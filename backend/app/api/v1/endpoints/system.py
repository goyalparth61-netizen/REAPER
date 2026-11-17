from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import time

from app.database.session import get_db
from app.repositories.repair_repo import RepairRepository
from app.core.config import settings

router = APIRouter(tags=["System"])


@router.get("/health")
def health():
    return {
        "status": "healthy",
        "auth": "ready",
        "engine": "REAPER Autonomous Software Repair Engine",
        "version": settings.VERSION,
        "time": time.time()
    }


@router.get("/status")
def status_legacy(db: Session = Depends(get_db)):
    repo_db = RepairRepository(db)
    active_jobs = repo_db.db.query(repo_db.db.query(repo_db.repo_model if hasattr(repo_db, 'repo_model') else None)).count() if False else 0
    from app.models.repair import RepairJob
    active_count = db.query(RepairJob).filter(
        RepairJob.status.in_(["RECEIVED", "VALIDATING", "INVESTIGATING", "REPRODUCING", "DIAGNOSING", "PATCHING", "POLICY_CHECK", "TESTING", "RETRYING", "CREATING_PR"])
    ).count()

    return {
        "agent": "REAPER",
        "state": "BUSY" if active_count > 0 else "IDLE",
        "active_tasks": active_count,
        "version": settings.VERSION
    }


@router.get("/system/status")
def system_status(db: Session = Depends(get_db)):
    return status_legacy(db)
