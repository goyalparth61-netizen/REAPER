import pytest
from app.repositories.repair_repo import RepairRepository
from app.workflows.repair_orchestrator import RepairOrchestrator
from app.workflows.state_machine import RepairStageEnum


def test_create_and_fetch_repair(db_session):
    repo = RepairRepository(db_session)
    job = repo.create_repair(
        repo_name="reaper-engine/payment-gateway",
        branch="main",
        issue_description="TypeError: Cannot read properties of undefined (reading 'balance')"
    )
    assert job.id is not None
    assert job.status == "RECEIVED"
    assert job.repo_name == "reaper-engine/payment-gateway"

    fetched = repo.get_by_id(job.id)
    assert fetched is not None
    assert fetched.id == job.id


def test_list_repairs(db_session):
    repo = RepairRepository(db_session)
    jobs = repo.list_repairs()
    assert isinstance(jobs, list)


def test_stop_repair(db_session):
    repo = RepairRepository(db_session)
    job = repo.create_repair(
        repo_name="reaper-engine/auth-service",
        branch="main",
        issue_description="Job to be halted"
    )
    stopped = repo.stop_repair(job.id)
    assert stopped.status == "STOPPED"


def test_repair_orchestrator_complete_workflow(db_session):
    repo = RepairRepository(db_session)
    job = repo.create_repair(
        repo_name="reaper-engine/payment-gateway",
        branch="main",
        issue_description="TypeError: Cannot read properties of undefined (reading 'balance')",
        failure_logs="TypeError: Cannot read properties of undefined (reading 'balance') at PaymentProcessor.deductBalance (src/services/payment.ts:48:22)"
    )

    orchestrator = RepairOrchestrator(db_session)
    result = orchestrator.run_workflow_sync(job.id)

    assert result["success"] is True
    assert result["status"] == "COMPLETED"
    assert "patch" in result

    # Verify database persistence of diagnosis, patch, test run, report
    updated_job = repo.get_by_id(job.id)
    assert updated_job.status == "COMPLETED"
    assert updated_job.diagnosis is not None
    assert "Unchecked object dereference" in updated_job.diagnosis.root_cause
    assert updated_job.patch is not None
    assert updated_job.report is not None
    assert len(updated_job.stages) >= 8
