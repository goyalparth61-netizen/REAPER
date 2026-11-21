from typing import Dict, Any
from app.agents.detection_agent import DetectionAgent
from app.agents.base_agent import AgentOutput


class LogAnalysisAgent(DetectionAgent):
    """
    Backwards-compatible alias for DetectionAgent.
    """
    def __init__(self):
        super().__init__()
        self.name = "LogAnalysisAgent"
