import os
import tempfile
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database.session import get_db
from app.repositories.repair_repo import RepairRepository
from app.tasks.repair_tasks import trigger_repair_execution
from app.api.deps import get_optional_current_user
from app.models.user import User
from app.schemas.repair import (
    RepairCreateRequest,
    RepairResponse,
    RepairDetailResponse,
    RepairLogsResponse
)
from app.schemas.report import RepairReportResponse
from app.utils.archive_validator import validate_and_extract_archive, ArchiveValidationError

router = APIRouter(prefix="/repairs", tags=["Repairs"])


@router.post("", response_model=Dict[str, Any])
def create_repair(
    req: RepairCreateRequest,
    current_user: User = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    repo_db = RepairRepository(db)
    user_id = current_user.id if current_user else "usr-demo-01"

    # Create repair record in DB
    job = repo_db.create_repair(
        repo_name=req.repo,
        branch=req.branch or "main",
        issue_description=req.issue,
        failure_logs=req.failure_logs,
        user_id=user_id,
        is_demo=req.isDemo
    )

    # Queue background autonomous repair workflow
    trigger_repair_execution(job.id)

    return {
        "runId": job.id,
        "status": "DISPATCHED",
        "repo": job.repo_name,
        "branch": job.branch,
        "stage": "ANALYSING",
        "message": "Autonomous repair agent initialized in isolated environment."
    }


@router.post("/upload", response_model=Dict[str, Any])
async def upload_project_archive(
    file: UploadFile = File(...),
    repo_name: Optional[str] = Form("local/uploaded-project"),
    branch: Optional[str] = Form("main"),
    issue_description: Optional[str] = Form(""),
    failure_logs: Optional[str] = Form(""),
    current_user: User = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Ingest a local Python project archive (.zip, .tar.gz) for autonomous repair.
    Validates against path traversal, oversized archives, and decompression attacks.
    """
    temp_dir = tempfile.mkdtemp(prefix="reaper_upload_")
    archive_dest = os.path.join(temp_dir, file.filename or "archive.zip")
    extract_dest = os.path.join(temp_dir, "extracted")

    try:
        # Save file to temporary path
        with open(archive_dest, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Validate and extract safely
        _, extracted_files = validate_and_extract_archive(archive_dest, extract_dest)

        user_id = current_user.id if current_user else "usr-demo-01"
        repo_db = RepairRepository(db)
        job = repo_db.create_repair(
            repo_name=repo_name,
            branch=branch,
            issue_description=issue_description or f"Local project archive repair ({len(extracted_files)} files)",
            failure_logs=failure_logs,
            user_id=user_id,
            is_demo=False
        )

        # Trigger repair execution with the verified extracted workspace
        from app.workflows.repair_orchestrator import RepairOrchestrator
        orchestrator = RepairOrchestrator(db)
        res = orchestrator.run_workflow_sync(job.id, workspace_dir=extract_dest)

        return {
            "runId": job.id,
            "status": res.get("status", "DISPATCHED"),
            "extracted_files_count": len(extracted_files),
            "patch": res.get("patch"),
            "report_id": res.get("report_id"),
            "message": "Local archive analyzed and processed."
        }

    except ArchiveValidationError as ave:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ave))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Archive ingestion failed: {str(e)}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


@router.get("", response_model=List[Dict[str, Any]])
def list_repairs(
    current_user: User = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    repo_db = RepairRepository(db)
    user_id = current_user.id if current_user else None
    jobs = repo_db.list_repairs(user_id=user_id, limit=50)

    return [
        {
            "id": j.id,
            "repo": j.repo_name,
            "branch": j.branch,
            "status": j.status,
            "stage": j.current_stage,
            "issue": j.issue_description,
            "created_at": j.created_at.strftime("%Y-%m-%d %H:%M:%S") if j.created_at else "",
            "is_demo": j.is_demo
        }
        for j in jobs
    ]


@router.get("/{repair_id}", response_model=RepairDetailResponse)
def get_repair(repair_id: str, db: Session = Depends(get_db)):
    repo_db = RepairRepository(db)
    job = repo_db.get_by_id(repair_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repair run not found.")
    return job


@router.post("/{repair_id}/stop")
def stop_repair(repair_id: str, db: Session = Depends(get_db)):
    repo_db = RepairRepository(db)
    job = repo_db.stop_repair(repair_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repair run not found.")
    return {"success": True, "message": f"Repair operation {repair_id} halted by user.", "status": job.status}


@router.get("/{repair_id}/logs", response_model=RepairLogsResponse)
def get_repair_logs(repair_id: str, db: Session = Depends(get_db)):
    repo_db = RepairRepository(db)
    job = repo_db.get_by_id(repair_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repair run not found.")

    log_lines = []
    for s in job.stages:
        log_lines.append(f"[{s.stage_name}] ({s.status}): {s.log_output or 'In progress...'}")

    if not log_lines:
        log_lines = [f"[RECEIVED]: Repair operation {repair_id} queued in orchestrator."]

    return RepairLogsResponse(
        repair_id=job.id,
        status=job.status,
        current_stage=job.current_stage,
        logs=log_lines
    )


@router.get("/{repair_id}/report", response_model=RepairReportResponse)
def get_repair_report(repair_id: str, db: Session = Depends(get_db)):
    repo_db = RepairRepository(db)
    report = repo_db.get_report_by_repair_id(repair_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repair report is still generating or not found.")
    return report
