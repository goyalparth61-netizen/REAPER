from typing import Dict, Any
from app.agents.repair_agent import RepairAgent
from app.agents.base_agent import AgentOutput


class PatchGenerationAgent(RepairAgent):
    """
    Backwards-compatible alias for RepairAgent.
    """
    def __init__(self):
        super().__init__()
        self.name = "PatchGenerationAgent"
