from celery import Celery
import concurrent.futures
from app.core.config import settings
from app.core.logging import logger

celery_app = Celery(
    "reaper_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300
)

# In-process asynchronous thread pool executor for local standalone execution without Redis
executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)


def dispatch_background_job(fn, *args, **kwargs):
    """
    Dispatch a long-running repair job in background.
    """
    try:
        executor.submit(fn, *args, **kwargs)
        logger.info(f"Background repair job dispatched to thread executor.")
    except Exception as e:
        logger.error(f"Failed to submit background task: {e}")
