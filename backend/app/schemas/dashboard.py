from pydantic import BaseModel
from typing import List, Dict, Any


class DashboardStatsResponse(BaseModel):
    total_repairs: int
    successful_repairs: int
    active_repairs: int
    success_rate: float
    total_repositories: int
    average_repair_time_seconds: float
    security_score: float


class DashboardActivityResponse(BaseModel):
    runs: List[Dict[str, Any]]
