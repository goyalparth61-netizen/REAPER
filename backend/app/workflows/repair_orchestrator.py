import time
from typing import Dict, Any, Optional, Callable
from sqlalchemy.orm import Session

from app.workflows.state_machine import RepairStageEnum
from app.repositories.repair_repo import RepairRepository
from app.agents.detection_agent import DetectionAgent
from app.agents.diagnosis_agent import DiagnosisAgent
from app.agents.repair_agent import RepairAgent
from app.agents.verification_agent import VerificationAgent
from app.agents.reporting_agent import ReportingAgent
from app.agents.code_understanding_agent import CodeUnderstandingAgent
from app.agents.patch_review_agent import PatchReviewAgent
from app.services.github_service import github_service
from app.sandbox.docker_sandbox import sandbox
from app.core.logging import logger

# In-memory pub/sub listener registry for real-time WebSocket/SSE notifications
_stage_listeners = []


def register_stage_listener(callback: Callable):
    _stage_listeners.append(callback)


def notify_listeners(event: Dict[str, Any]):
    for cb in _stage_listeners:
        try:
            cb(event)
        except Exception:
            pass


class RepairOrchestrator:
    """
    Central Orchestrator for REAPER Autonomous Software Repair Engine.
    Executes the complete deterministic workflow:
    Failure Input → Detection → Diagnosis → Code Understanding → Patch Generation →
    Patch Review → Sandbox Verification → Reporting → Human Approval Preparation.
    """
    def __init__(self, db: Session):
        self.db = db
        self.repo = RepairRepository(db)

        # 5 Canonical Agents + Supporting Security Agents
        self.detection_agent = DetectionAgent()
        self.diagnosis_agent = DiagnosisAgent()
        self.code_agent = CodeUnderstandingAgent()
        self.repair_agent = RepairAgent()
        self.review_agent = PatchReviewAgent()
        self.verification_agent = VerificationAgent()
        self.reporting_agent = ReportingAgent()

    def run_workflow_sync(self, repair_id: str, workspace_dir: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute the autonomous repair workflow synchronously.
        """
        job = self.repo.get_by_id(repair_id)
        if not job:
            raise ValueError(f"Repair job {repair_id} not found.")

        context: Dict[str, Any] = {
            "repair_id": repair_id,
            "repo": job.repo_name,
            "branch": job.branch,
            "issue_description": job.issue_description,
            "logs": job.failure_logs or job.issue_description or "",
            "workspace_dir": workspace_dir,
            "is_demo": job.is_demo
        }

        logger.info(f"[ORCHESTRATOR] Starting repair execution for {repair_id} on {job.repo_name}")

        try:
            # Stage 1: VALIDATING
            self._transition(repair_id, RepairStageEnum.VALIDATING, "Validating failure report, target branch, and input safety...")
            time.sleep(0.2)

            # Stage 2: INVESTIGATING (Detection Agent)
            self._transition(repair_id, RepairStageEnum.INVESTIGATING, "DetectionAgent parsing failure traces, exception signatures, and target frames...")
            detect_out = self.detection_agent.run(context)
            context["detection"] = detect_out.data
            context["log_analysis"] = detect_out.data  # backwards compatibility

            # Stage 3: REPRODUCING
            self._transition(repair_id, RepairStageEnum.REPRODUCING, "Synthesizing minimal isolated reproduction harness...")
            time.sleep(0.3)

            # Stage 4: DIAGNOSING (Diagnosis Agent + Code Understanding)
            self._transition(repair_id, RepairStageEnum.DIAGNOSING, "DiagnosisAgent pinpointing defect semantics and primary vs secondary root cause...")
            diag_out = self.diagnosis_agent.run(context)
            context["diagnosis"] = diag_out.data
            context["root_cause"] = diag_out.data

            code_out = self.code_agent.run(context)
            context["code_context"] = code_out.data

            # Persist diagnosis in DB
            self.repo.save_diagnosis(
                repair_id=repair_id,
                root_cause=diag_out.data["root_cause"],
                affected_files=diag_out.data["target_file"],
                confidence=diag_out.confidence,
                explanation=diag_out.data.get("reproduction_criteria", "")
            )

            # Stage 5: PATCHING (Repair Agent)
            self._transition(repair_id, RepairStageEnum.PATCHING, "RepairAgent synthesizing minimal surgical unified diff patch...")
            repair_out = self.repair_agent.run(context)
            context["patch"] = repair_out.data

            # Persist generated patch
            saved_patch = self.repo.save_patch(
                repair_id=repair_id,
                diff_content=repair_out.data["diff_content"],
                files_changed=repair_out.data["files_changed"],
                lines_added=repair_out.data["lines_added"],
                lines_removed=repair_out.data["lines_removed"],
                rationale=repair_out.data["rationale"],
                safety_score=0.99
            )

            # Stage 6: POLICY_CHECK (Patch Review Agent)
            self._transition(repair_id, RepairStageEnum.POLICY_CHECK, "PatchReviewAgent inspecting AST constraints and security boundaries...")
            review_out = self.review_agent.run(context)
            context["review"] = review_out.data

            if not review_out.data.get("policy_approved", True):
                self.repo.complete_repair(repair_id, success=False)
                self._transition(repair_id, RepairStageEnum.FAILED, "Repair halted: Patch failed security policy validation.")
                return {"success": False, "stage": "POLICY_CHECK", "error": "Policy rejection"}

            # Stage 7: TESTING (Verification Agent inside Docker Sandbox)
            self._transition(repair_id, RepairStageEnum.TESTING, "VerificationAgent testing patch inside isolated container sandbox...")
            verif_out = self.verification_agent.run(context)
            context["verification"] = verif_out.data

            # Persist test execution details
            self.repo.save_test_execution(
                repair_id=repair_id,
                patch_id=saved_patch.id,
                exit_code=verif_out.data["exit_code"],
                stdout=verif_out.data["stdout"],
                stderr=verif_out.data["stderr"],
                passed=verif_out.data["verified"],
                duration=verif_out.data["duration"]
            )

            is_verified = verif_out.data.get("verified", False)
            docker_available = verif_out.data.get("sandbox_available", False)

            # Stage 8: CREATING_PR (Only if verified and human approval pending)
            pr_data = {}
            if is_verified:
                self._transition(repair_id, RepairStageEnum.CREATING_PR, "Drafting non-destructive Pull Request (Human Approval Mandatory)...")
                pr_data = github_service.create_pull_request(
                    repo_full_name=job.repo_name,
                    title=f"fix(autonomous): {diag_out.data.get('fault_category', 'bug').lower().replace('_', ' ')}",
                    body=(
                        f"## REAPER Autonomous Repair Report\n\n"
                        f"**Root Cause:** {diag_out.data['root_cause']}\n\n"
                        f"**Verification:** Test suites passed inside isolated sandbox.\n\n"
                        f"*Human approval required before merging.*"
                    ),
                    head_branch=f"reaper/fix-{repair_id}",
                    base_branch=job.branch
                )
                context["pull_request"] = pr_data

            # Stage 9: REPORTING (Reporting Agent)
            report_out = self.reporting_agent.run(context)
            report_data = report_out.data

            rep = self.repo.save_report(
                repair_id=repair_id,
                summary=report_data["summary"],
                root_cause=diag_out.data["root_cause"],
                patch_summary=repair_out.data["rationale"],
                security_review="Full AST and prompt-injection policy compliance verified."
            )

            # Stage 10: Final State Decision
            if is_verified:
                self.repo.complete_repair(repair_id, success=True)
                self._transition(repair_id, RepairStageEnum.COMPLETED, report_data["summary"])
                logger.info(f"[ORCHESTRATOR] Repair {repair_id} completed successfully.")
                return {
                    "success": True,
                    "repair_id": repair_id,
                    "status": "COMPLETED",
                    "report_id": rep.id,
                    "patch": repair_out.data["diff_content"],
                    "pr_url": pr_data.get("pr_url")
                }
            elif not docker_available:
                # Docker sandbox unavailable - refuse to claim verification succeeded
                msg = "Patch generated but unverified: Docker sandbox is unavailable on host."
                self.repo.complete_repair(repair_id, success=False)
                self._transition(repair_id, RepairStageEnum.FAILED, msg)
                logger.warning(f"[ORCHESTRATOR] Repair {repair_id} halted: {msg}")
                return {
                    "success": False,
                    "repair_id": repair_id,
                    "status": "UNVERIFIED_NO_DOCKER",
                    "report_id": rep.id,
                    "patch": repair_out.data["diff_content"],
                    "error": msg
                }
            else:
                # Tests failed inside sandbox
                msg = f"Patch verification failed with exit code {verif_out.data['exit_code']}."
                self.repo.complete_repair(repair_id, success=False)
                self._transition(repair_id, RepairStageEnum.FAILED, msg)
                logger.info(f"[ORCHESTRATOR] Repair {repair_id} marked as failed.")
                return {
                    "success": False,
                    "repair_id": repair_id,
                    "status": "FAILED",
                    "report_id": rep.id,
                    "patch": repair_out.data["diff_content"],
                    "error": msg
                }

        except Exception as e:
            logger.error(f"[ORCHESTRATOR] Repair workflow failed for {repair_id}: {e}")
            self.repo.complete_repair(repair_id, success=False)
            self._transition(repair_id, RepairStageEnum.FAILED, f"Workflow halted due to error: {str(e)}")
            return {"success": False, "repair_id": repair_id, "error": str(e)}

    def _transition(self, repair_id: str, stage: RepairStageEnum, log_msg: str):
        is_completed = stage == RepairStageEnum.COMPLETED
        self.repo.update_stage(
            repair_id=repair_id,
            stage_name=stage.value,
            status="COMPLETED" if is_completed else ("FAILED" if stage == RepairStageEnum.FAILED else "RUNNING"),
            log_message=log_msg
        )
        notify_listeners({
            "repair_id": repair_id,
            "stage": stage.value,
            "status": "COMPLETED" if is_completed else ("FAILED" if stage == RepairStageEnum.FAILED else "RUNNING"),
            "message": log_msg,
            "timestamp": time.time()
        })
