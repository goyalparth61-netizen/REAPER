import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings
from app.core.logging import logger
from app.database.base import Base

# Engine configuration
db_url = settings.DATABASE_URL

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)
else:
    # PostgreSQL / Supabase
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

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
        # Import models so Base has all metadata
        import app.models  # noqa: F401
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas initialized.")

        # Seed initial developer account if not exists
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
