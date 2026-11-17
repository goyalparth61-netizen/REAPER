from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.repositories import router as repositories_router
from app.api.v1.endpoints.repairs import router as repairs_router
from app.api.v1.endpoints.reports import router as reports_router
from app.api.v1.endpoints.system import router as system_router
from app.api.v1.endpoints.ws import router as ws_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(repositories_router)
api_v1_router.include_router(repairs_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(system_router)
api_v1_router.include_router(ws_router)
