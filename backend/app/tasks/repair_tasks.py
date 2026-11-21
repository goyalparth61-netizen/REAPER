from app.tasks.celery_app import dispatch_background_job
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


def trigger_repair_execution(repair_id: str):
    """
    Trigger repair execution.
    Dispatches directly to asynchronous background thread executor for zero-latency HTTP responses.
    """
    logger.info(f"Dispatching repair task {repair_id} to background worker executor...")
    dispatch_background_job(run_repair_job, repair_id)
