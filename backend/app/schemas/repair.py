from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class RepairCreateRequest(BaseModel):
    repo: str
    branch: Optional[str] = "main"
    issue: Optional[str] = ""
    failure_logs: Optional[str] = ""
    isDemo: Optional[bool] = False


class RepairStageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    stage_name: str
    status: str
    log_output: Optional[str] = None
    started_at: datetime
    finished_at: Optional[datetime] = None


class GeneratedPatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    diff_content: str
    files_changed: int
    lines_added: int
    lines_removed: int
    rationale: Optional[str] = None
    safety_score: float


class AiDiagnosisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    root_cause: str
    affected_files: str
    confidence_score: float
    explanation: Optional[str] = None


class RepairResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    repo: str
    branch: str
    status: str
    current_stage: str
    issue: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    is_demo: bool = False


class RepairDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    repo_name: str
    branch: str
    status: str
    current_stage: str
    issue_description: Optional[str] = None
    failure_logs: Optional[str] = None
    retry_count: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    stages: List[RepairStageResponse] = []
    diagnosis: Optional[AiDiagnosisResponse] = None
    patch: Optional[GeneratedPatchResponse] = None


class RepairLogsResponse(BaseModel):
    repair_id: str
    status: str
    current_stage: str
    logs: List[str]
