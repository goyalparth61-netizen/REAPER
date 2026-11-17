from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.user import User, Session as UserSession, VerificationToken, PasswordResetToken


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.strip().lower()).first()

    def create(self, email: str, hashed_password: str, full_name: str, is_verified: bool = False) -> User:
        user = User(
            email=email.strip().lower(),
            hashed_password=hashed_password,
            full_name=full_name.strip(),
            is_verified=is_verified
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def set_verified(self, user: User) -> User:
        user.is_verified = True
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_password(self, user: User, hashed_password: str) -> User:
        user.hashed_password = hashed_password
        self.db.commit()
        self.db.refresh(user)
        return user

    # Verification tokens
    def create_verification_code(self, user_id: str, email: str, code: str, expires_at: datetime) -> VerificationToken:
        token = VerificationToken(
            user_id=user_id,
            email=email.strip().lower(),
            code=code,
            expires_at=expires_at
        )
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def get_valid_verification_code(self, email: str, code: str) -> Optional[VerificationToken]:
        now = datetime.now(timezone.utc)
        return self.db.query(VerificationToken).filter(
            VerificationToken.email == email.strip().lower(),
            VerificationToken.code == code.strip(),
            VerificationToken.used_at.is_(None),
            VerificationToken.expires_at > now
        ).first()

    def mark_verification_code_used(self, token: VerificationToken):
        token.used_at = datetime.now(timezone.utc)
        self.db.commit()

    # Password reset tokens
    def create_reset_token(self, user_id: str, token_hash: str, expires_at: datetime) -> PasswordResetToken:
        token = PasswordResetToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def get_valid_reset_token(self, token_hash: str) -> Optional[PasswordResetToken]:
        now = datetime.now(timezone.utc)
        return self.db.query(PasswordResetToken).filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now
        ).first()

    def mark_reset_token_used(self, token: PasswordResetToken):
        token.used_at = datetime.now(timezone.utc)
        self.db.commit()

    # Sessions
    def create_session(self, user_id: str, refresh_token: str, expires_at: datetime, ip: Optional[str] = None, user_agent: Optional[str] = None) -> UserSession:
        session = UserSession(
            user_id=user_id,
            refresh_token=refresh_token,
            expires_at=expires_at,
            ip_address=ip,
            user_agent=user_agent
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_session_by_token(self, refresh_token: str) -> Optional[UserSession]:
        now = datetime.now(timezone.utc)
        return self.db.query(UserSession).filter(
            UserSession.refresh_token == refresh_token,
            UserSession.is_revoked.is_(False),
            UserSession.expires_at > now
        ).first()

    def revoke_session(self, refresh_token: str):
        session = self.db.query(UserSession).filter(UserSession.refresh_token == refresh_token).first()
        if session:
            session.is_revoked = True
            self.db.commit()

    def revoke_all_user_sessions(self, user_id: str):
        self.db.query(UserSession).filter(UserSession.user_id == user_id).update({"is_revoked": True})
        self.db.commit()
