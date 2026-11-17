import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import logger


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        response = await call_next(request)

        duration = round((time.time() - start_time) * 1000, 2)
        logger.info(
            f"{request.method} {path} - {response.status_code} ({duration}ms) from {client_ip}"
        )
        return response
