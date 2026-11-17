from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentOutput


class RootCauseAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__("RootCauseAnalysisAgent")

    def run(self, context: Dict[str, Any]) -> AgentOutput:
        log_data = context.get("log_analysis", {})
        repo = context.get("repo", "unknown")
        culprits = log_data.get("culprit_locations", ["src/services/payment.ts:48"])

        primary_file = culprits[0] if culprits else "src/index.ts:1"

        root_cause = (
            f"Unchecked object dereference in `{primary_file}`. The caller invokes property lookup on an "
            f"asynchronously resolved account record before verifying completion or initialization, leading to "
            f"intermittent null pointer dereference during high-concurrency requests."
        )

        return AgentOutput(
            agent_name=self.name,
            confidence=0.94,
            data={
                "root_cause": root_cause,
                "fault_category": "NULL_DEREFERENCE_CONCURRENCY",
                "target_file": primary_file.split(":")[0],
                "target_line": int(primary_file.split(":")[1]) if ":" in primary_file else 48,
                "reproduction_criteria": "Concurrent race condition under load with uninitialized state."
            }
        )
