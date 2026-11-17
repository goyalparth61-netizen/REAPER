import time
from collections import defaultdict
from typing import Dict, List
from fastapi import HTTPException, Request, status

from app.core.config import settings

# In-memory sliding window rate limiter
_request_records: Dict[str, List[float]] = defaultdict(list)


def check_rate_limit(request: Request):
    """
    Enforce per-client sliding window rate limiting.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    window_start = now - 60.0  # 1 minute window

    # Clean records older than 1 minute
    records = [t for t in _request_records[client_ip] if t > window_start]
    _request_records[client_ip] = records

    if len(records) >= settings.RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait before submitting more requests."
        )

    _request_records[client_ip].append(now)
