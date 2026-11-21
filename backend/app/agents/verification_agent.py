from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentOutput
from app.sandbox.docker_sandbox import sandbox
from app.core.logging import logger


class VerificationAgent(BaseAgent):
    """
    Verification Agent:
    - Validates patch structure and security constraints.
    - Executes test suites inside isolated Docker containers.
    - Captures stdout, stderr, exit code, and execution duration.
    - Detects regressions.
    - Rejects unsuccessful repairs.
    """
    __test__ = False  # Prevent pytest from treating this agent as a test class

    def __init__(self):
        super().__init__("VerificationAgent")

    def run(self, context: Dict[str, Any]) -> AgentOutput:
        patch_data = context.get("patch", {})
        diff = patch_data.get("diff_content", "")
        test_command = context.get("test_command", "pytest -v")
        workspace_dir = context.get("workspace_dir")

        # 1. Structural & Safety Validation
        has_eval = "eval(" in diff or "exec(" in diff or "__import__" in diff or "os.system" in diff
        has_suspicious_url = "http://" in diff or "ftp://" in diff
        is_safe = not has_eval and not has_suspicious_url

        if not is_safe:
            logger.warning(f"[{self.name}] Patch rejected by security policy filter.")
            return AgentOutput(
                agent_name=self.name,
                confidence=0.99,
                data={
                    "verified": False,
                    "policy_approved": False,
                    "rejection_reason": "Patch contains prohibited execution or exfiltration primitives.",
                    "exit_code": 1,
                    "duration": 0.0,
                    "stdout": "",
                    "stderr": "Security policy check rejected patch.",
                    "sandbox_available": sandbox.is_docker_available(),
                    "recommendation": "REJECT_AND_RETRY"
                }
            )

        # 2. Execute test inside isolated Docker container
        sandbox_res = sandbox.execute_test(
            test_command=test_command,
            patch_content=diff,
            workspace_source_dir=workspace_dir
        )

        verified = sandbox_res.passed and sandbox_res.exit_code == 0 and sandbox_res.sandbox_available

        logger.info(
            f"[{self.name}] Verification result: passed={sandbox_res.passed}, "
            f"exit_code={sandbox_res.exit_code}, docker_available={sandbox_res.sandbox_available}"
        )

        return AgentOutput(
            agent_name=self.name,
            confidence=0.98 if sandbox_res.sandbox_available else 0.85,
            data={
                "verified": verified,
                "policy_approved": True,
                "exit_code": sandbox_res.exit_code,
                "duration": sandbox_res.duration_seconds,
                "stdout": sandbox_res.stdout,
                "stderr": sandbox_res.stderr,
                "sandbox_available": sandbox_res.sandbox_available,
                "regression_passed": verified,
                "test_suite_status": "PASSED" if verified else ("UNVERIFIED_NO_DOCKER" if not sandbox_res.sandbox_available else "FAILED"),
                "recommendation": "PROCEED_TO_PR" if verified else ("AWAITING_DOCKER_SANDBOX" if not sandbox_res.sandbox_available else "RETRY_WITH_ALTERNATIVE_PATCH")
            }
        )
