from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.session import get_db
from app.services.stats_service import StatsService
from app.repositories.repair_repo import RepairRepository
from app.schemas.dashboard import DashboardStatsResponse, DashboardActivityResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    service = StatsService(db)
    return service.get_stats()


@router.get("/activity", response_model=DashboardActivityResponse)
def get_dashboard_activity(db: Session = Depends(get_db)):
    repo = RepairRepository(db)
    repairs = repo.list_repairs(limit=15)
    
    activity = []
    for r in repairs:
        activity.append({
            "id": r.id,
            "repo": r.repo_name,
            "branch": r.branch,
            "status": r.status,
            "stage": r.current_stage,
            "issue": r.issue_description,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
            "is_demo": r.is_demo
        })
    return DashboardActivityResponse(runs=activity)
