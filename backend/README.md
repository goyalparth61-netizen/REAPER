# REAPER — Autonomous Software Repair Engine
## Backend Architecture & Developer Manual

> **CiPher Founding Team**: Archi Sharma (AI/ML) & Parth Goyal (CSCQ)  
> *“Built by CiPher • Engineering autonomous software repair.”*

---

## 1. Overview & Technology Stack

REAPER is an autonomous AI software repair agent that investigates continuous integration failures, diagnoses root causes, synthesizes minimal surgical patches, tests them inside isolated sandboxes, and prepares non-destructive pull requests with mandatory human approval.

### Technology Stack:
- **Language**: Python 3.12+
- **Web Framework**: FastAPI (Async ASGI, OpenAPI 3.1, Swagger UI at `/docs`)
- **Database**: PostgreSQL / Supabase PostgreSQL (SQLAlchemy 2.0 ORM + Alembic migrations, with SQLite zero-config fallback)
- **Authentication**: Email + Password with Argon2id hashing, JWT Access Tokens (15 min) + Refresh Tokens (7 days), 6-digit verification codes, and secure reset tokens
- **Task Queue & Cache**: Redis + Celery 5.4 (with in-process thread pool fallback for local development)
- **Container Sandbox**: Docker Sandbox (non-root, CPU/Memory caps, network isolation, ephemeral volume mounts)
- **Test Framework**: Pytest + Pytest-Asyncio
- **Security**: Prompt injection sanitizer, sliding-window rate limiting, path traversal protection, CORS allowlisting, audit logging

---

## 2. Directory Architecture

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py                    # Dependency injection (get_current_user, get_db)
│   │   └── v1/
│   │       ├── api.py                 # Core v1 router registry
│   │       └── endpoints/
│   │           ├── auth.py            # Registration, login, verification, password reset, me
│   │           ├── dashboard.py       # Aggregated stats and telemetry activity
│   │           ├── repositories.py    # Repository discovery, detail, delete
│   │           ├── repairs.py         # Autonomous repair dispatch, logs, reports, stopping
│   │           ├── reports.py         # Repair report retrieval
│   │           ├── system.py          # Health checks and engine status
│   │           └── ws.py              # WebSocket / SSE real-time telemetry streaming
│   ├── core/
│   │   ├── config.py                  # Pydantic Settings & environment variables
│   │   ├── security.py                # Argon2 password hashing & JWT token operations
│   │   └── logging.py                 # Structured logger
│   ├── database/
│   │   ├── base.py                    # SQLAlchemy 2.0 DeclarativeBase
│   │   └── session.py                 # Database engine, SessionLocal, and init_db seeder
│   ├── models/                        # SQLAlchemy ORM Models
│   │   ├── user.py                    # User, Session, VerificationToken, PasswordResetToken
│   │   ├── repository.py              # Repository model
│   │   └── repair.py                  # RepairJob, RepairStage, AiDiagnosis, GeneratedPatch, TestExecution, RepairReport, AuditLog
│   ├── schemas/                       # Pydantic v2 schemas
│   │   ├── auth.py
│   │   ├── repository.py
│   │   ├── repair.py
│   │   ├── report.py
│   │   └── dashboard.py
│   ├── repositories/                  # Clean data-access layer
│   │   ├── user_repo.py
│   │   ├── repair_repo.py
│   │   └── repository_repo.py
│   ├── services/                      # Business logic layer
│   │   ├── auth_service.py
│   │   ├── email_service.py
│   │   ├── stats_service.py
│   │   └── github_service.py          # Safe GitHub interface (Disabled by default)
│   ├── agents/                        # 6 Specialized Autonomous AI Repair Agents
│   │   ├── base_agent.py
│   │   ├── log_analysis_agent.py      # Stack trace & exception frame extractor
│   │   ├── root_cause_agent.py        # Semantic fault & invariant analyzer
│   │   ├── code_understanding_agent.py# AST dependency & context extractor
│   │   ├── patch_generation_agent.py  # Minimal surgical unified diff synthesizer
│   │   ├── patch_review_agent.py      # AST safety & security policy reviewer
│   │   └── test_analysis_agent.py     # Sandbox test output validator
│   ├── workflows/
│   │   ├── state_machine.py           # 10-stage repair workflow enum
│   │   └── repair_orchestrator.py     # Central workflow coordinator
│   ├── sandbox/
│   │   └── docker_sandbox.py          # Hermetic containerized execution environment
│   ├── security/
│   │   ├── prompt_injection.py        # Neutralizes prompt injection patterns in untrusted code
│   │   ├── rate_limiter.py            # Sliding window rate limiter
│   │   └── sanitizer.py               # Path traversal and input hygiene
│   ├── tasks/
│   │   ├── celery_app.py              # Celery configuration & thread pool fallback
│   │   └── repair_tasks.py            # Background repair task jobs
│   ├── middleware/
│   │   ├── audit_middleware.py        # Request telemetry logging
│   │   └── error_handler.py           # Standardized, leak-proof exception handling
│   └── main.py                        # FastAPI application entrypoint
├── migrations/                        # Alembic database migrations
├── tests/                             # Comprehensive Pytest test suite
├── Dockerfile                         # Production multi-stage Docker build
├── docker-compose.yml                 # API, Postgres, Redis, Celery composition
├── alembic.ini                        # Alembic configuration
└── requirements.txt                   # Production package dependencies
```

---

## 3. Autonomous Repair Workflow Stages

The core REAPER repair engine executes an orchestrated 10-stage state machine:

```
[RECEIVED]
   ↓
[VALIDATING]      → Verifies repository target, branch, and failure logs
   ↓
[INVESTIGATING]   → LogAnalysisAgent parses stack traces & exception frames
   ↓
[REPRODUCING]     → Sealed environment prepares reproduction test harness
   ↓
[DIAGNOSING]      → RootCauseAnalysisAgent & CodeUnderstandingAgent extract semantic fault
   ↓
[PATCHING]        → PatchGenerationAgent synthesizes minimal surgical unified diff
   ↓
[POLICY_CHECK]    → PatchReviewAgent enforces AST safety and prompt injection rules
   ↓
[TESTING]         → TestAnalysisAgent executes test suite in DockerSandbox
   ↓
[CREATING_PR]     → GitHubService drafts Pull Request (Human Approval Strictly Enforced)
   ↓
[COMPLETED]       → Full Technical Report generated and persisted
```

---

## 4. Setup & Installation

### Local Virtual Environment
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Running Database Migrations
```bash
alembic upgrade head
```
*(When starting for the first time with SQLite, tables and the verified default developer account `demo@reaper.ai` / `Password123!` are also automatically initialized on application startup).*

### Starting the FastAPI Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger Documentation will be available at:  
👉 **http://127.0.0.1:8000/docs**

---

## 5. Background Workers & Redis

### Running Celery Worker (Optional)
```bash
celery -A app.tasks.celery_app.celery_app worker --loglevel=info
```
*Note: If Redis is offline, the backend automatically falls back to an internal thread-pool executor so all background repair tasks still run seamlessly without crashing.*

---

## 6. Docker Compose Deployment

To deploy the entire production stack (FastAPI + PostgreSQL + Redis + Celery):
```bash
docker-compose up -d --build
```

---

## 7. Running Automated Tests

```bash
python -m pytest tests -v
```
All unit tests mock external network boundaries and test the full registration, Argon2 verification, token issuance, repair orchestration, sandbox safety, and agent workflows.

---

## 8. Hackathon Safety Restrictions

- **GitHub Integration**: Kept disabled by default (`ENABLE_GITHUB_INTEGRATION=false`). Real repository operations will only be triggered when explicitly toggled during official evaluation.
- **Auto-Merge Forbidden**: Pull requests are strictly created as drafts requiring explicit human engineer review.
