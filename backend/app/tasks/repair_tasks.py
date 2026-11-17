from app.tasks.celery_app import celery_app, dispatch_background_job
from app.database.session import SessionLocal
from app.workflows.repair_orchestrator import RepairOrchestrator
from app.core.logging import logger


def run_repair_job(repair_id: str):
    db = SessionLocal()
    try:
        orchestrator = RepairOrchestrator(db)
        return orchestrator.run_workflow_sync(repair_id)
    except Exception as e:
        logger.error(f"Error in background repair job {repair_id}: {e}")
        return {"success": False, "error": str(e)}
    finally:
        db.close()


@celery_app.task(name="tasks.execute_repair_task")
def execute_repair_task(repair_id: str):
    return run_repair_job(repair_id)


def trigger_repair_execution(repair_id: str):
    """
    Trigger repair execution.
    Attempts Celery dispatch first; gracefully falls back to thread pool if Redis is offline.
    """
    try:
        execute_repair_task.delay(repair_id)
        logger.info(f"Repair task {repair_id} queued in Celery.")
    except Exception:
        logger.info(f"Celery broker not connected. Executing repair task {repair_id} in background thread pool.")
        dispatch_background_job(run_repair_job, repair_id)
