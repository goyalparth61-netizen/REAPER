from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import time
from typing import Dict, Any

from app.database.session import get_db
from app.repositories.repair_repo import RepairRepository
from app.core.config import settings
from app.integrations.gemini_service import gemini_service
from app.sandbox.docker_sandbox import sandbox
from app.models.repair import RepairJob

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
def status_endpoint(db: Session = Depends(get_db)):
    active_count = db.query(RepairJob).filter(
        RepairJob.status.in_([
            "RECEIVED", "VALIDATING", "INVESTIGATING", "REPRODUCING",
            "DIAGNOSING", "PATCHING", "POLICY_CHECK", "TESTING", "RETRYING", "CREATING_PR"
        ])
    ).count()

    return {
        "agent": "REAPER",
        "state": "BUSY" if active_count > 0 else "IDLE",
        "active_tasks": active_count,
        "version": settings.VERSION
    }


@router.get("/system/status")
def system_status(db: Session = Depends(get_db)):
    return status_endpoint(db)


@router.get("/agents/status")
def agents_status(db: Session = Depends(get_db)):
    """
    Returns authentic live telemetry for all 5 canonical REAPER agents.
    """
    docker_ok = sandbox.is_docker_available()
    gemini_ok = gemini_service.is_available()

    return {
        "engine": "REAPER",
        "version": settings.VERSION,
        "provider": settings.AI_PRIMARY_PROVIDER,
        "model": settings.AI_MODEL,
        "ai_connected": gemini_ok,
        "docker_sandbox_available": docker_ok,
        "agents": {
            "detection_agent": {
                "name": "DetectionAgent",
                "role": "Failure Signal Identification & AST/Trace Frame Extraction",
                "status": "ACTIVE" if settings.ENABLE_DETECTION_AGENT else "DISABLED",
                "mode": "deterministic_ast"
            },
            "diagnosis_agent": {
                "name": "DiagnosisAgent",
                "role": "Root Cause Isolation & Cascading Failure Disambiguation",
                "status": "ACTIVE" if (settings.ENABLE_DIAGNOSIS_AGENT and gemini_ok) else "HEURISTIC_STANDBY",
                "mode": "gemini_reasoning" if gemini_ok else "ast_heuristic"
            },
            "repair_agent": {
                "name": "RepairAgent",
                "role": "Surgical Unified Diff Synthesis & Patch Minimization",
                "status": "ACTIVE" if (settings.ENABLE_REPAIR_AGENT and gemini_ok) else "HEURISTIC_STANDBY",
                "mode": "gemini_synthesis" if gemini_ok else "targeted_template"
            },
            "verification_agent": {
                "name": "VerificationAgent",
                "role": "Hermetic Container Sandbox Verification & Regression Shield",
                "status": "ACTIVE" if docker_ok else "DOCKER_UNAVAILABLE",
                "mode": "docker_container" if docker_ok else "blocked_no_docker"
            },
            "reporting_agent": {
                "name": "ReportingAgent",
                "role": "Structured Telemetry, Audit Trails & Human PR Packaging",
                "status": "ACTIVE",
                "mode": "persisted_audit"
            }
        }
    }
