# REAPER Production Deployment Guide (Preview)

> [!NOTE]
> This guide prepares the application for future production deployment across Vercel (Frontend), Render (Backend), and Supabase (PostgreSQL Database). No production deployment secrets or keys are stored in the repository.

---

## 1. Deployment Topology

```
+---------------------------+        REST / WebSockets        +---------------------------+
|          Vercel           | ──────────────────────────────► |          Render           |
|  React 18 + Vite Frontend |                                 |    FastAPI Python Backend |
+---------------------------+                                 +-------------+-------------+
                                                                            |
                                                                            | SQLAlchemy 2.0 (Pooler:6543)
                                                                            v
                                                              +---------------------------+
                                                              |         Supabase          |
                                                              |    Managed PostgreSQL     |
                                                              +---------------------------+
```

---

## 2. Frontend Deployment (Vercel)

### Project Configuration
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 18.x or 20.x

### Environment Variables Checklist (Vercel Dashboard)
| Variable Name | Description | Example Target |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public HTTPS URL of the Render backend | `https://reaper-backend.onrender.com` |

---

## 3. Backend Deployment (Render)

### Service Specification
- **Service Type**: Web Service
- **Environment**: Python 3.12+
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Environment Variables Checklist (Render Dashboard)
| Variable Name | Required | Purpose |
| :--- | :--- | :--- |
| `APP_ENV` | Yes | Set to `production` |
| `DEBUG` | Yes | Set to `false` in production |
| `DATABASE_URL` | Yes | Supabase PostgreSQL Connection Pooler URL (`postgresql://...`) |
| `USE_SQLITE_FALLBACK` | No | Set to `false` in production (ensures hard failure if DB is down) |
| `SUPABASE_URL` | Yes | Supabase project API URL (`https://<ref>.supabase.co`) |
| `SUPABASE_SECRET_KEY` | Yes | Supabase Service Role Secret Key (`eyJ...`) |
| `SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase Anon Key |
| `GEMINI_API_KEY` | Yes | Google Gemini API Key for autonomous multi-agent reasoning |
| `AI_PRIMARY_PROVIDER` | Yes | Set to `gemini` |
| `AI_MODEL` | Yes | Set to `gemini-3.5-flash` |
| `JWT_SECRET_KEY` | Yes | Cryptographically random string (min 32 bytes) for token signing |
| `JWT_ALGORITHM` | Yes | `HS256` |
| `FRONTEND_URL` | Yes | Public HTTPS URL of the deployed Vercel frontend |
| `FRONTEND_ORIGIN` | Yes | Public HTTPS URL of the deployed Vercel frontend |
| `ENABLE_DOCKER_SANDBOX` | Yes | Controls whether Docker container isolation is attempted |

---

## 4. Database Setup (Supabase)

1. Provision a new project on [Supabase](https://supabase.com).
2. Retrieve the **Connection Pooler** URI from `Settings > Database > Connection Pooling`:
   - Connection Mode: **Transaction** (port `6543`) or **Session** (port `5432`).
   - Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
   > [!IMPORTANT]
   > Direct connection strings (`db.<ref>.supabase.co`) resolve exclusively to IPv6 addresses. Platforms without full IPv6 routing require the connection pooler URL above.
3. Run Alembic migrations against Supabase:
   ```bash
   alembic upgrade head
   ```

---

## 5. Security Checklist
- [x] Zero backend secrets or database credentials committed to version control.
- [x] `.env` files strictly listed in `.gitignore`.
- [x] CORS origins restricted to the frontend production domain.
- [x] Hard timeouts and non-root execution enforced on sandbox containers.
- [x] Path traversal and zip bomb validation enforced on project archive uploads.
