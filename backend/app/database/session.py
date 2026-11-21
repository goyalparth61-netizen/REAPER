import os
import urllib.parse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings
from app.core.logging import logger
from app.database.base import Base


def _normalize_db_url(raw_url: str) -> str:
    """
    Ensure PostgreSQL URLs use psycopg2 driver and proper URL encoding.
    """
    if not raw_url:
        return "sqlite:///./reaper.db"

    if raw_url.startswith("postgresql://") or raw_url.startswith("postgres://"):
        scheme_prefix = "postgresql+psycopg2://"
        rest = raw_url.split("://", 1)[1]

        # Handle unencoded @ characters in password
        if "@" in rest and rest.count("@") > 1:
            userpass, hostdb = rest.rsplit("@", 1)
            if ":" in userpass:
                user, password = userpass.split(":", 1)
                encoded_pw = urllib.parse.quote_plus(password)
                return f"{scheme_prefix}{user}:{encoded_pw}@{hostdb}"
        elif raw_url.startswith("postgresql://"):
            return raw_url.replace("postgresql://", scheme_prefix, 1)
        elif raw_url.startswith("postgres://"):
            return raw_url.replace("postgres://", scheme_prefix, 1)

    return raw_url


def _create_database_engine():
    configured_url = settings.DATABASE_URL
    normalized_url = _normalize_db_url(configured_url)

    if normalized_url.startswith("sqlite"):
        logger.info(f"Database configured explicitly for SQLite local storage: {normalized_url}")
        return create_engine(normalized_url, connect_args={"check_same_thread": False})

    # PostgreSQL / Supabase
    try:
        engine = create_engine(
            normalized_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            connect_args={"connect_timeout": 5}
        )
        # Probe connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to primary persistent PostgreSQL / Supabase database.")
        return engine
    except Exception as e:
        error_msg = f"Failed to connect to primary PostgreSQL database ({type(e).__name__}: {e})"
        logger.error(error_msg)

        if settings.USE_SQLITE_FALLBACK:
            fallback_url = "sqlite:///./reaper.db"
            logger.warning(
                f"USE_SQLITE_FALLBACK is enabled. Falling back to local development SQLite database: {fallback_url}"
            )
            return create_engine(fallback_url, connect_args={"check_same_thread": False})

        raise RuntimeError(
            f"{error_msg}. To allow local standalone execution without a reachable PostgreSQL cluster, "
            f"set USE_SQLITE_FALLBACK=true in your environment or set DATABASE_URL=sqlite:///./reaper.db."
        ) from e


engine = _create_database_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables and seed default verified developer account.
    """
    try:
        import app.models  # noqa: F401
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas initialized successfully.")

        from app.models.user import User
        from app.core.security import hash_password

        db = SessionLocal()
        try:
            demo_user = db.query(User).filter(User.email == "demo@reaper.ai").first()
            if not demo_user:
                demo_user = User(
                    id="usr-demo-01",
                    email="demo@reaper.ai",
                    full_name="Lead Engineer",
                    hashed_password=hash_password("Password123!"),
                    is_active=True,
                    is_verified=True,
                    role="lead_architect"
                )
                db.add(demo_user)
                db.commit()
                logger.info("Default verified developer account seeded: demo@reaper.ai")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error during init_db: {e}")
        raise
