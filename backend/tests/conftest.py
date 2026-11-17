import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # Import all models before create_all
from app.database.base import Base
from app.database.session import get_db
from app.models.user import User
from app.core.security import hash_password

# In-memory SQLite database for test speed and isolation
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)

    # Seed demo user
    db = TestingSessionLocal()
    try:
        user = User(
            id="usr-test-01",
            email="test@reaper.ai",
            full_name="Test Engineer",
            hashed_password=hash_password("Password123!"),
            is_active=True,
            is_verified=True,
            role="lead_architect"
        )
        db.add(user)
        db.commit()
    finally:
        db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app, raise_server_exceptions=True)
    yield test_client
    app.dependency_overrides.clear()
