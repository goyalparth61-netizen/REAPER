from enum import Enum
from typing import List


class RepairStageEnum(str, Enum):
    RECEIVED = "RECEIVED"
    VALIDATING = "VALIDATING"
    INVESTIGATING = "INVESTIGATING"
    REPRODUCING = "REPRODUCING"
    DIAGNOSING = "DIAGNOSING"
    PATCHING = "PATCHING"
    POLICY_CHECK = "POLICY_CHECK"
    TESTING = "TESTING"
    RETRYING = "RETRYING"
    CREATING_PR = "CREATING_PR"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    STOPPED = "STOPPED"


# Ordered progression
STANDARD_WORKFLOW_SEQUENCE: List[RepairStageEnum] = [
    RepairStageEnum.RECEIVED,
    RepairStageEnum.VALIDATING,
    RepairStageEnum.INVESTIGATING,
    RepairStageEnum.REPRODUCING,
    RepairStageEnum.DIAGNOSING,
    RepairStageEnum.PATCHING,
    RepairStageEnum.POLICY_CHECK,
    RepairStageEnum.TESTING,
    RepairStageEnum.CREATING_PR,
    RepairStageEnum.COMPLETED
]
