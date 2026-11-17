from pydantic import BaseModel, ConfigDict
from datetime import datetime


class RepairReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    repair_id: str
    summary: str
    root_cause_summary: str
    patch_summary: str
    security_review: str
    created_at: datetime
