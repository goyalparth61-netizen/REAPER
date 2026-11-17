from abc import ABC, abstractmethod
from typing import Dict, Any
from pydantic import BaseModel

from app.security.prompt_injection import detect_and_sanitize_untrusted_input
from app.core.config import settings
from app.core.logging import logger


class AgentOutput(BaseModel):
    agent_name: str
    confidence: float
    data: Dict[str, Any]
    sanitized_input: bool = False


class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name

    def preprocess_input(self, text: str) -> str:
        clean, injected = detect_and_sanitize_untrusted_input(text)
        if injected:
            logger.warning(f"[{self.name}] Neutralized potential prompt injection vector in untrusted input.")
        return clean

    @abstractmethod
    def run(self, context: Dict[str, Any]) -> AgentOutput:
        pass
