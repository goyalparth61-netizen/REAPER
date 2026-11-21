from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request, Header, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.core.config import settings
from app.core.logging import logger
from app.database.session import init_db, get_db
from app.middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)
from app.api.v1.api import api_v1_router
from app.api.v1.endpoints.repairs import (
    create_repair,
    list_repairs,
    get_repair,
    get_repair_report,
    get_repair_logs,
    stop_repair,
    upload_project_archive
)
from app.api.v1.endpoints.repositories import (
    list_repositories,
    create_repository,
    get_repository,
    delete_repository
)
from app.api.v1.endpoints.system import agents_status, status_endpoint
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
from app.schemas.repair import RepairCreateRequest
from app.schemas.repository import RepositoryCreateRequest


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting REAPER Autonomous Software Repair Engine...")
    init_db()
    yield
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

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Versioned API (/api/v1)
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


# ============================================================================
# Root Diagnostics & Health
# ============================================================================

@app.get("/")
def root():
    return {
        "project": "REAPER",
        "tagline": "Detect. Diagnose. Repair. Verify.",
        "team": "CiPher",
        "engine": "Autonomous Software Repair Engine",
        "version": settings.VERSION,
        "status": "online",
        "api_v1": "/api/v1",
        "docs": "/docs",
        "auth_engine": "Argon2 + JWT Dual-Token (Access/Refresh)",
        "mission": "Engineering autonomous software repair."
    }


@app.get("/api/health")
def api_health():
    import time
    return {
        "status": "healthy",
        "auth": "ready",
        "engine": "REAPER",
        "version": settings.VERSION,
        "time": time.time()
    }


# ============================================================================
# Canonical Direct Endpoints (/api/*)
# Directly consistent with Section 10 of project specifications
# ============================================================================

@app.get("/api/agents/status")
def direct_agents_status(db: Session = Depends(get_db)):
    return agents_status(db=db)


@app.post("/api/repairs")
def direct_create_repair(
    req: RepairCreateRequest,
    db: Session = Depends(get_db)
):
    return create_repair(req=req, current_user=None, db=db)


@app.get("/api/repairs")
def direct_list_repairs(db: Session = Depends(get_db)):
    return list_repairs(current_user=None, db=db)


@app.get("/api/repairs/{task_id}")
def direct_get_repair(task_id: str, db: Session = Depends(get_db)):
    return get_repair(repair_id=task_id, db=db)


@app.get("/api/repairs/{task_id}/report")
def direct_get_repair_report(task_id: str, db: Session = Depends(get_db)):
    return get_repair_report(repair_id=task_id, db=db)


@app.get("/api/repositories")
def direct_list_repositories(db: Session = Depends(get_db)):
    return list_repositories(current_user=None, db=db)


@app.post("/api/repositories", status_code=status.HTTP_201_CREATED)
def direct_create_repository(req: RepositoryCreateRequest, db: Session = Depends(get_db)):
    return create_repository(req=req, current_user=None, db=db)


@app.delete("/api/repositories/{repository_id}")
def direct_delete_repository(repository_id: str, db: Session = Depends(get_db)):
    return delete_repository(repository_id=repository_id, db=db)


# ============================================================================
# Frontend Direct Compatibility Endpoints (/api/status, /api/runs, /api/repair)
# ============================================================================

@app.get("/api/status")
def api_status_legacy(db: Session = Depends(get_db)):
    return status_endpoint(db=db)


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


@app.post("/api/repair")
async def api_repair_legacy(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    repo_name = data.get("repo", "reaper-engine/payment-gateway")
    branch = data.get("branch", "main")
    issue = data.get("issue", "")
    failure_logs = data.get("failure_logs", issue)
    is_demo = bool(data.get("isDemo", False))

    req = RepairCreateRequest(
        repo=repo_name,
        branch=branch,
        issue=issue,
        failure_logs=failure_logs,
        isDemo=is_demo
    )
    return create_repair(req=req, current_user=None, db=db)


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
