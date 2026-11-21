from typing import Dict, Any
from app.agents.diagnosis_agent import DiagnosisAgent
from app.agents.base_agent import AgentOutput


class RootCauseAnalysisAgent(DiagnosisAgent):
    """
    Backwards-compatible alias for DiagnosisAgent.
    """
    def __init__(self):
        super().__init__()
        self.name = "RootCauseAnalysisAgent"
