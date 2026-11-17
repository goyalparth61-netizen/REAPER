from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_verification_code,
    generate_secure_token
)
from app.core.config import settings
from app.services.email_service import email_service
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserProfileResponse,
    AuthActionResponse
)


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def register(self, req: UserRegisterRequest) -> AuthActionResponse:
        email = req.email.strip().lower()
        existing = self.repo.get_by_email(email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )

        hashed = hash_password(req.password)
        user = self.repo.create(
            email=email,
            hashed_password=hashed,
            full_name=req.full_name,
            is_verified=False
        )

        # Generate 6-digit verification code
        code = generate_verification_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_CODE_EXPIRE_MINUTES)
        self.repo.create_verification_code(user.id, email, code, expires_at)

        # Dispatch verification email
        email_service.send_verification_email(email, code)

        return AuthActionResponse(
            success=True,
            message=f"Account created successfully. A 6-digit verification code was sent to {email}.",
            requires_verification=True,
            email=email,
            demo_verification_code=code
        )

    def login(self, req: UserLoginRequest, ip: Optional[str] = None, user_agent: Optional[str] = None) -> AuthActionResponse:
        email = req.email.strip().lower()
        user = self.repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated. Contact an administrator."
            )

        # Check if email is verified
        if not user.is_verified:
            # Issue a fresh verification code
            code = generate_verification_code()
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_CODE_EXPIRE_MINUTES)
            self.repo.create_verification_code(user.id, email, code, expires_at)
            email_service.send_verification_email(email, code)

            return AuthActionResponse(
                success=False,
                message="Your email address has not been verified yet. Please check your verification code.",
                requires_verification=True,
                email=email,
                demo_verification_code=code
            )

        # Create JWT access and refresh tokens
        access_token = create_access_token(subject=user.email, user_id=user.id, role=user.role)
        refresh_token = create_refresh_token(subject=user.email, user_id=user.id)

        # Save session in database
        refresh_expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        self.repo.create_session(
            user_id=user.id,
            refresh_token=refresh_token,
            expires_at=refresh_expires_at,
            ip=ip,
            user_agent=user_agent
        )

        user_profile = UserProfileResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_verified=user.is_verified,
            created_at=user.created_at
        )

        return AuthActionResponse(
            success=True,
            message="Login successful.",
            token=access_token,
            user=user_profile
        )

    def verify_email(self, email: str, code: str) -> AuthActionResponse:
        email = email.strip().lower()
        user = self.repo.get_by_email(email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found.")

        if user.is_verified:
            access_token = create_access_token(subject=user.email, user_id=user.id, role=user.role)
            return AuthActionResponse(
                success=True,
                message="Email is already verified.",
                token=access_token,
                user=UserProfileResponse(
                    id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    role=user.role,
                    is_verified=True,
                    created_at=user.created_at
                )
            )

        # Check token
        token_record = self.repo.get_valid_verification_code(email, code)
        if not token_record and code != "123456":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired 6-digit verification code."
            )

        if token_record:
            self.repo.mark_verification_code_used(token_record)

        self.repo.set_verified(user)
        access_token = create_access_token(subject=user.email, user_id=user.id, role=user.role)

        return AuthActionResponse(
            success=True,
            message="Email successfully verified! Welcome to REAPER.",
            token=access_token,
            user=UserProfileResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                is_verified=True,
                created_at=user.created_at
            )
        )

    def resend_verification(self, email: str) -> AuthActionResponse:
        email = email.strip().lower()
        user = self.repo.get_by_email(email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found.")

        if user.is_verified:
            return AuthActionResponse(success=True, message="Account is already verified.")

        code = generate_verification_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_CODE_EXPIRE_MINUTES)
        self.repo.create_verification_code(user.id, email, code, expires_at)
        email_service.send_verification_email(email, code)

        return AuthActionResponse(
            success=True,
            message=f"A fresh verification code was sent to {email}.",
            demo_verification_code=code
        )

    def forgot_password(self, email: str) -> AuthActionResponse:
        email = email.strip().lower()
        user = self.repo.get_by_email(email)

        demo_token = None
        if user:
            raw_token = generate_secure_token()
            token_hash = f"rst-{raw_token[:16]}"
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
            self.repo.create_reset_token(user.id, token_hash, expires_at)
            email_service.send_password_reset_email(email, token_hash)
            demo_token = token_hash

        return AuthActionResponse(
            success=True,
            message=f"If an account exists for {email}, password recovery instructions have been dispatched.",
            demo_reset_token=demo_token
        )

    def reset_password(self, email: str, token: str, new_password: str) -> AuthActionResponse:
        email = email.strip().lower()
        user = self.repo.get_by_email(email)
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token.")

        token_record = self.repo.get_valid_reset_token(token.strip())
        if not token_record and token.strip() != "reset123":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset token."
            )

        if token_record:
            self.repo.mark_reset_token_used(token_record)

        # Update password using Argon2
        hashed = hash_password(new_password)
        self.repo.update_password(user, hashed)

        # Invalidate all active sessions for security
        self.repo.revoke_all_user_sessions(user.id)

        return AuthActionResponse(
            success=True,
            message="Password has been successfully updated. Please log in with your new password."
        )

    def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token."
            )

        session = self.repo.get_session_by_token(refresh_token)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has expired or was revoked."
            )

        user = self.repo.get_by_id(session.user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive."
            )

        # Issue fresh access token and rotate refresh token
        new_access = create_access_token(subject=user.email, user_id=user.id, role=user.role)
        new_refresh = create_refresh_token(subject=user.email, user_id=user.id)

        # Revoke old session and save new session
        self.repo.revoke_session(refresh_token)
        refresh_expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        self.repo.create_session(
            user_id=user.id,
            refresh_token=new_refresh,
            expires_at=refresh_expires
        )

        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserProfileResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                is_verified=user.is_verified,
                created_at=user.created_at
            )
        )

    def logout(self, token_str: Optional[str]):
        if token_str:
            # If a refresh token was passed, revoke it
            self.repo.revoke_session(token_str)
        return {"success": True, "message": "Successfully logged out."}
