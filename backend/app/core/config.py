import os
from typing import List, Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load .env if present
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
load_dotenv(env_path)


class Settings(BaseModel):
    PROJECT_NAME: str = os.getenv("APP_NAME", "REAPER")
    PROJECT_DESCRIPTION: str = "Autonomous Software Repair Engine"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"

    # Environment
    APP_ENV: str = os.getenv("APP_ENV", os.getenv("ENVIRONMENT", "development"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "t")

    # Supabase Configuration
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", None)
    SUPABASE_PUBLISHABLE_KEY: Optional[str] = os.getenv("SUPABASE_PUBLISHABLE_KEY", None)
    SUPABASE_SECRET_KEY: Optional[str] = os.getenv("SUPABASE_SECRET_KEY", None)

    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./reaper.db")
    USE_SQLITE_FALLBACK: bool = os.getenv("USE_SQLITE_FALLBACK", "false").lower() in ("true", "1", "t")

    # JWT Authentication
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "reaper-secret-super-secure-key-2026-argon2-sha256-jwt-cipher-lead-architect-key"
    )
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    VERIFICATION_CODE_EXPIRE_MINUTES: int = 60
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 60

    # Redis & Background Workers
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # SMTP Configuration (Optional)
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: Optional[str] = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "noreply@reaper.ai")
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() in ("true", "1", "t")

    # AI Provider Settings
    AI_PRIMARY_PROVIDER: str = os.getenv("AI_PRIMARY_PROVIDER", os.getenv("AI_PROVIDER", "gemini"))
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", os.getenv("AI_API_KEY", None))
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-3.5-flash")

    # Agent Feature Toggles
    ENABLE_DETECTION_AGENT: bool = os.getenv("ENABLE_DETECTION_AGENT", "true").lower() in ("true", "1", "t")
    ENABLE_DIAGNOSIS_AGENT: bool = os.getenv("ENABLE_DIAGNOSIS_AGENT", "true").lower() in ("true", "1", "t")
    ENABLE_REPAIR_AGENT: bool = os.getenv("ENABLE_REPAIR_AGENT", "true").lower() in ("true", "1", "t")
    ENABLE_VERIFICATION_AGENT: bool = os.getenv("ENABLE_VERIFICATION_AGENT", "true").lower() in ("true", "1", "t")

    # GitHub App Integration (Optional, disabled by default)
    ENABLE_GITHUB_INTEGRATION: bool = os.getenv("ENABLE_GITHUB_INTEGRATION", "false").lower() in ("true", "1", "t")
    GITHUB_APP_ID: Optional[str] = os.getenv("GITHUB_APP_ID", "")
    GITHUB_PRIVATE_KEY: Optional[str] = os.getenv("GITHUB_PRIVATE_KEY", "")
    GITHUB_WEBHOOK_SECRET: Optional[str] = os.getenv("GITHUB_WEBHOOK_SECRET", "")

    # CORS & Frontend Origins
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"))
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", os.getenv("FRONTEND_URL", "http://localhost:5173"))
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    # Docker Sandbox Limits
    ENABLE_DOCKER_SANDBOX: bool = os.getenv("ENABLE_DOCKER_SANDBOX", "true").lower() in ("true", "1", "t")
    SANDBOX_TIMEOUT_SECONDS: int = int(os.getenv("SANDBOX_TIMEOUT_SECONDS", "30"))
    SANDBOX_MAX_MEMORY_MB: int = int(os.getenv("SANDBOX_MAX_MEMORY_MB", "512"))
    SANDBOX_MAX_CPU: float = float(os.getenv("SANDBOX_MAX_CPU", "1.0"))

    # Security
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    PROMPT_INJECTION_SHIELD: bool = True
    MAX_UPLOAD_SIZE_BYTES: int = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(25 * 1024 * 1024)))  # 25 MB max


settings = Settings()
