# REAPER API Reference (v1)

The REAPER backend exposes a high-performance RESTful API using FastAPI at `/api/v1`.

## Authentication Endpoints (`/api/v1/auth`)

### POST `/api/v1/auth/register`
Register a new developer account.
- **Request Body**:
  ```json
  {
    "email": "engineer@company.com",
    "password": "SecurePassword123!",
    "full_name": "Software Engineer"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "uuid-v4",
    "email": "engineer@company.com",
    "full_name": "Software Engineer",
    "role": "developer",
    "is_active": true
  }
  ```

### POST `/api/v1/auth/login`
Authenticate with email and password to receive JWT tokens.
- **Request Body**:
  ```json
  {
    "email": "engineer@company.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "id": "uuid-v4",
      "email": "engineer@company.com",
      "full_name": "Software Engineer"
    }
  }
  ```

### POST `/api/v1/auth/refresh`
Refresh expired access tokens.
- **Request Body**: `{"refresh_token": "eyJhbGciOi..."}`
- **Response** (`200 OK`): `{"access_token": "eyJhbGciOi...", "token_type": "bearer", "expires_in": 1800}`

---

## Repositories Endpoints (`/api/v1/repositories`)

- `GET /api/v1/repositories`: List connected repositories for the current user.
- `POST /api/v1/repositories`: Connect a new repository.
- `GET /api/v1/repositories/{id}`: Retrieve repository details and repair history.

---

## Repair Jobs Endpoints (`/api/v1/repairs`)

- `POST /api/v1/repairs`: Trigger an autonomous repair job on a bug or test failure.
  ```json
  {
    "repository_url": "https://github.com/org/repo.git",
    "branch": "main",
    "issue_description": "IndexError in parser on empty input",
    "error_logs": "IndexError: list index out of range at line 42",
    "language": "python"
  }
  ```
- `GET /api/v1/repairs/{id}`: Poll live status and pipeline stage.
- `GET /api/v1/repairs/{id}/logs`: Stream repair logs and agent thoughts.
- `POST /api/v1/repairs/{id}/cancel`: Abort an ongoing repair session.

---

## Agent Inspection Endpoints (`/api/v1/agents`)

- `GET /api/v1/agents`: Inspect status, latency, and capability profiles of all 6 repair agents.
