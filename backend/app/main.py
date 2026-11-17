from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.core.config import settings
from app.core.logging import logger
from app.database.session import init_db, get_db
from app.middleware.audit_middleware import AuditLoggingMiddleware
from app.middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)
from app.api.v1.api import api_v1_router
from app.repositories.repair_repo import RepairRepository
from app.tasks.repair_tasks import trigger_repair_execution
from app.services.auth_service import AuthService
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB models and seed demo user
    logger.info("Starting REAPER Autonomous Software Repair Engine...")
    init_db()
    yield
    # Shutdown
    logger.info("Stopping REAPER engine cleanly.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.add_middleware(AuditLoggingMiddleware)

# Mount Versioned API (v1)
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


# ============================================================================
# Root Diagnostics & Health
# ============================================================================

@app.get("/")
def root():
    return {
        "project": "REAPER",
        "team": "CiPher",
        "engine": "Autonomous Software Repair Engine",
        "version": settings.VERSION,
        "status": "online",
        "api_v1": "/api/v1",
        "docs": "/docs",
        "auth_engine": "Argon2 + JWT Access/Refresh",
        "mission": "Engineering autonomous software repair."
    }


@app.get("/api/health")
def api_health():
    import time
    return {
        "status": "healthy",
        "auth": "ready",
        "engine": "REAPER",
        "time": time.time()
    }


# ============================================================================
# Legacy & Frontend Direct Endpoints (/api/*)
# Kept for 100% seamless compatibility with existing frontend components
# ============================================================================

@app.get("/api/status")
def api_status_legacy(db: Session = Depends(get_db)):
    from app.models.repair import RepairJob
    active_count = db.query(RepairJob).filter(
        RepairJob.status.in_(["RECEIVED", "VALIDATING", "INVESTIGATING", "REPRODUCING", "DIAGNOSING", "PATCHING", "POLICY_CHECK", "TESTING", "RETRYING", "CREATING_PR"])
    ).count()

    return {
        "agent": "REAPER",
        "state": "BUSY" if active_count > 0 else "IDLE",
        "active_tasks": active_count
    }


@app.get("/api/runs")
def api_runs_legacy(db: Session = Depends(get_db)):
    repo = RepairRepository(db)
    repairs = repo.list_repairs(limit=30)
    return {
        "runs": [
            {
                "id": r.id,
                "repo": r.repo_name,
                "branch": r.branch,
                "status": r.status,
                "stage": r.current_stage,
                "issue": r.issue_description,
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
                "is_demo": r.is_demo
            }
            for r in repairs
        ]
    }


class LegacyRepairRequest:
    pass


@app.post("/api/repair")
async def api_repair_legacy(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    repo_name = data.get("repo", "reaper-engine/payment-gateway")
    branch = data.get("branch", "main")
    issue = data.get("issue", "")
    is_demo = bool(data.get("isDemo", False))

    repo_db = RepairRepository(db)
    job = repo_db.create_repair(
        repo_name=repo_name,
        branch=branch,
        issue_description=issue,
        user_id="usr-demo-01",
        is_demo=is_demo
    )
    trigger_repair_execution(job.id)

    return {
        "runId": job.id,
        "status": "DISPATCHED",
        "repo": job.repo_name,
        "branch": job.branch,
        "stage": "ANALYSING",
        "message": "Autonomous repair agent initialized in isolated environment."
    }


# Auth Legacy Endpoints
@app.post("/api/auth/signup")
def legacy_signup(req: UserRegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.register(req)


@app.post("/api/auth/login")
def legacy_login(req: UserLoginRequest, request: Request, db: Session = Depends(get_db)):
    service = AuthService(db)
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    return service.login(req, ip=ip, user_agent=ua)


@app.post("/api/auth/verify-email")
def legacy_verify_email(req: VerifyEmailRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.verify_email(req.email, req.code)


@app.post("/api/auth/resend-verification")
def legacy_resend_verification(req: ResendVerificationRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.resend_verification(req.email)


@app.post("/api/auth/forgot-password")
def legacy_forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.forgot_password(req.email)


@app.post("/api/auth/reset-password")
def legacy_reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.reset_password(req.email, req.token, req.new_password)


@app.get("/api/auth/me")
def legacy_me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    from app.api.deps import get_current_user
    current_user = get_current_user(authorization=authorization, db=db)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_verified": current_user.is_verified
    }


@app.post("/api/auth/logout")
def legacy_logout(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    service = AuthService(db)
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    return service.logout(token)
