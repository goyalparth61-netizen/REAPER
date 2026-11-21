from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentOutput


class TestAnalysisAgent(BaseAgent):
    __test__ = False  # Prevent pytest from treating this agent as a test class

    def __init__(self):
        super().__init__("TestAnalysisAgent")

    def run(self, context: Dict[str, Any]) -> AgentOutput:
        verification = context.get("verification") or context.get("sandbox_result") or {}
        exit_code = verification.get("exit_code", 1)
        passed = verification.get("verified", False) or verification.get("passed", False)
        sandbox_available = verification.get("sandbox_available", False)

        test_status = "PASSED" if (passed and sandbox_available) else ("UNVERIFIED_NO_DOCKER" if not sandbox_available else "FAILED")

        return AgentOutput(
            agent_name=self.name,
            confidence=0.97,
            data={
                "regression_passed": passed and sandbox_available,
                "exit_code": exit_code,
                "test_suite_status": test_status,
                "sandbox_available": sandbox_available,
                "recommendation": "PROCEED_TO_PR" if (passed and sandbox_available) else "ABORT_OR_RETRY"
            }
        )
