import time
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt

from app.core.config import settings

# Initialize Argon2 hasher
try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerifyMismatchError, VerificationError
    ph = PasswordHasher(
        time_cost=2,
        memory_cost=65536,
        parallelism=2,
        hash_len=32,
        salt_len=16
    )
    HAS_ARGON2 = True
except ImportError:
    HAS_ARGON2 = False


def hash_password(password: str) -> str:
    """
    Hash a password using Argon2id.
    Falls back to salted PBKDF2-HMAC-SHA256 if argon2 is unavailable.
    """
    if HAS_ARGON2:
        return ph.hash(password)
    
    # Fallback salted PBKDF2
    salt = secrets.token_bytes(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"pbkdf2:{salt.hex()}:{hashed.hex()}"


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against an Argon2 or PBKDF2 hash.
    """
    if not hashed_password:
        return False

    if hashed_password.startswith("$argon2"):
        if not HAS_ARGON2:
            return False
        try:
            return ph.verify(hashed_password, password)
        except (VerifyMismatchError, VerificationError):
            return False
        except Exception:
            return False

    # Handle PBKDF2 hash format: "pbkdf2:salt:hash"
    if hashed_password.startswith("pbkdf2:"):
        try:
            parts = hashed_password.split(":")
            if len(parts) == 3:
                salt = bytes.fromhex(parts[1])
                expected = parts[2]
                computed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000).hex()
                return secrets.compare_digest(expected, computed)
        except Exception:
            return False

    # Legacy raw SHA-256 or PBKDF2
    return False


def create_access_token(
    subject: str,
    user_id: str,
    role: str = "engineer",
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a signed JWT access token.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": subject,
        "user_id": user_id,
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": secrets.token_hex(16)
    }
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    subject: str,
    user_id: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a signed JWT refresh token.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode: Dict[str, Any] = {
        "sub": subject,
        "user_id": user_id,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": secrets.token_hex(16)
    }
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT token.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.PyJWTError:
        return None


def generate_verification_code() -> str:
    """
    Generate a cryptographically secure 6-digit email verification code.
    """
    return f"{secrets.randbelow(900000) + 100000}"


def generate_secure_token() -> str:
    """
    Generate a URL-safe token for password resets or sessions.
    """
    return secrets.token_urlsafe(32)
