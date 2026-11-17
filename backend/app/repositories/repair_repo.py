from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.repair import (
    RepairJob,
    RepairStage,
    AiDiagnosis,
    GeneratedPatch,
    TestExecution,
    RepairReport,
    AuditLog
)


class RepairRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_repair(
        self,
        repo_name: str,
        branch: str = "main",
        issue_description: Optional[str] = None,
        failure_logs: Optional[str] = None,
        user_id: Optional[str] = None,
        repository_id: Optional[str] = None,
        is_demo: bool = False
    ) -> RepairJob:
        job = RepairJob(
            repo_name=repo_name,
            branch=branch,
            issue_description=issue_description,
            failure_logs=failure_logs,
            user_id=user_id,
            repository_id=repository_id,
            is_demo=is_demo,
            status="RECEIVED",
            current_stage="RECEIVED"
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get_by_id(self, repair_id: str) -> Optional[RepairJob]:
        return self.db.query(RepairJob).filter(RepairJob.id == repair_id).first()

    def list_repairs(self, user_id: Optional[str] = None, limit: int = 50) -> List[RepairJob]:
        query = self.db.query(RepairJob)
        if user_id:
            query = query.filter(RepairJob.user_id == user_id)
        return query.order_by(RepairJob.created_at.desc()).limit(limit).all()

    def update_stage(self, repair_id: str, stage_name: str, status: str = "RUNNING", log_message: Optional[str] = None) -> Optional[RepairJob]:
        job = self.get_by_id(repair_id)
        if not job:
            return None

        job.current_stage = stage_name
        job.status = status

        # Record stage event
        stage = RepairStage(
            repair_id=repair_id,
            stage_name=stage_name,
            status=status,
            log_output=log_message,
            started_at=datetime.now(timezone.utc)
        )
        if status in ("COMPLETED", "FAILED", "SKIPPED"):
            stage.finished_at = datetime.now(timezone.utc)

        self.db.add(stage)
        self.db.commit()
        self.db.refresh(job)
        return job

    def complete_repair(self, repair_id: str, success: bool = True):
        job = self.get_by_id(repair_id)
        if job:
            job.status = "COMPLETED" if success else "FAILED"
            job.completed_at = datetime.now(timezone.utc)
            self.db.commit()

    def stop_repair(self, repair_id: str) -> Optional[RepairJob]:
        job = self.get_by_id(repair_id)
        if job and job.status not in ("COMPLETED", "FAILED", "STOPPED"):
            job.status = "STOPPED"
            job.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(job)
        return job

    def save_diagnosis(self, repair_id: str, root_cause: str, affected_files: str, confidence: float, explanation: str) -> AiDiagnosis:
        diag = AiDiagnosis(
            repair_id=repair_id,
            root_cause=root_cause,
            affected_files=affected_files,
            confidence_score=confidence,
            explanation=explanation
        )
        self.db.add(diag)
        self.db.commit()
        self.db.refresh(diag)
        return diag

    def save_patch(self, repair_id: str, diff_content: str, files_changed: int, lines_added: int, lines_removed: int, rationale: str, safety_score: float) -> GeneratedPatch:
        patch = GeneratedPatch(
            repair_id=repair_id,
            diff_content=diff_content,
            files_changed=files_changed,
            lines_added=lines_added,
            lines_removed=lines_removed,
            rationale=rationale,
            safety_score=safety_score
        )
        self.db.add(patch)
        self.db.commit()
        self.db.refresh(patch)
        return patch

    def save_test_execution(self, repair_id: str, exit_code: int, stdout: str, stderr: str, passed: bool, duration: float, patch_id: Optional[str] = None) -> TestExecution:
        te = TestExecution(
            repair_id=repair_id,
            patch_id=patch_id,
            exit_code=exit_code,
            stdout=stdout,
            stderr=stderr,
            test_passed=passed,
            duration_seconds=duration
        )
        self.db.add(te)
        self.db.commit()
        self.db.refresh(te)
        return te

    def save_report(self, repair_id: str, summary: str, root_cause: str, patch_summary: str, security_review: str) -> RepairReport:
        rep = RepairReport(
            repair_id=repair_id,
            summary=summary,
            root_cause_summary=root_cause,
            patch_summary=patch_summary,
            security_review=security_review
        )
        self.db.add(rep)
        self.db.commit()
        self.db.refresh(rep)
        return rep

    def get_report_by_repair_id(self, repair_id: str) -> Optional[RepairReport]:
        return self.db.query(RepairReport).filter(RepairReport.repair_id == repair_id).first()

    def get_report_by_id(self, report_id: str) -> Optional[RepairReport]:
        return self.db.query(RepairReport).filter(RepairReport.id == report_id).first()

    def list_reports(self, limit: int = 50) -> List[RepairReport]:
        return self.db.query(RepairReport).order_by(RepairReport.created_at.desc()).limit(limit).all()

    def log_audit(self, action: str, resource_type: str, resource_id: Optional[str] = None, details: Optional[str] = None, user_id: Optional[str] = None, ip: Optional[str] = None) -> AuditLog:
        al = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip
        )
        self.db.add(al)
        self.db.commit()
        return al
