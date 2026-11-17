from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.repositories.repair_repo import RepairRepository
from app.schemas.report import RepairReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=List[RepairReportResponse])
def list_reports(db: Session = Depends(get_db)):
    repo_db = RepairRepository(db)
    return repo_db.list_reports(limit=50)


@router.get("/{report_id}", response_model=RepairReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db)):
    repo_db = RepairRepository(db)
    report = repo_db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return report
