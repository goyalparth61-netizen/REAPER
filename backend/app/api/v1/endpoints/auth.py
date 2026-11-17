from fastapi import APIRouter, Depends, Request, Header
from typing import Optional
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserProfileResponse,
    AuthActionResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthActionResponse)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.register(req)


# Alias for frontend /api/auth/signup
@router.post("/signup", response_model=AuthActionResponse)
def signup(req: UserRegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.register(req)


@router.post("/login", response_model=AuthActionResponse)
def login(req: UserLoginRequest, request: Request, db: Session = Depends(get_db)):
    service = AuthService(db)
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    return service.login(req, ip=ip, user_agent=ua)


@router.post("/refresh", response_model=TokenResponse)
def refresh(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.refresh_access_token(req.refresh_token)


@router.post("/verify-email", response_model=AuthActionResponse)
def verify_email(req: VerifyEmailRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.verify_email(req.email, req.code)


@router.post("/resend-verification", response_model=AuthActionResponse)
def resend_verification(req: ResendVerificationRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.resend_verification(req.email)


@router.post("/forgot-password", response_model=AuthActionResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.forgot_password(req.email)


@router.post("/reset-password", response_model=AuthActionResponse)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.reset_password(req.email, req.token, req.new_password)


@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at
    )


@router.post("/logout")
def logout(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    service = AuthService(db)
    token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    return service.logout(token)
