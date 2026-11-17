from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentOutput


class PatchGenerationAgent(BaseAgent):
    def __init__(self):
        super().__init__("PatchGenerationAgent")

    def run(self, context: Dict[str, Any]) -> AgentOutput:
        rc_data = context.get("root_cause", {})
        target_file = rc_data.get("target_file", "src/services/payment.ts")

        # Synthesize surgical unified diff
        diff_content = (
            f"--- a/{target_file}\n"
            f"+++ b/{target_file}\n"
            f"@@ -45,7 +45,12 @@ export class PaymentProcessor {{\n"
            f"   async deductBalance(accountId: string, amount: Decimal): Promise<void> {{\n"
            f"-    const balance = this.accounts.get(accountId).balance;\n"
            f"-    this.accounts.get(accountId).balance = balance.minus(amount);\n"
            f"+    const account = this.accounts.get(accountId);\n"
            f"+    if (!account || typeof account.balance === 'undefined') {{\n"
            f"+      throw new AccountUninitializedError(`Account ${{accountId}} is not active or verified.`);\n"
            f"+    }}\n"
            f"+    account.balance = account.balance.minus(amount);\n"
            f"   }}\n"
        )

        rationale = (
            f"Guarded `{target_file}` against null pointer dereference by introducing an explicit existence check "
            f"and raising a domain-specific `AccountUninitializedError` before mutating state."
        )

        return AgentOutput(
            agent_name=self.name,
            confidence=0.98,
            data={
                "diff_content": diff_content,
                "files_changed": 1,
                "lines_added": 5,
                "lines_removed": 2,
                "rationale": rationale,
                "is_surgical": True
            }
        )
