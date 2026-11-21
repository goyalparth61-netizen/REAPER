import pytest
from app.repositories.repair_repo import RepairRepository
from app.workflows.repair_orchestrator import RepairOrchestrator
from app.sandbox.docker_sandbox import sandbox, SandboxResult


def test_create_and_fetch_repair(db_session):
    repo = RepairRepository(db_session)
    job = repo.create_repair(
        repo_name="reaper-engine/payment-gateway",
        branch="main",
        issue_description="Unhandled null pointer in payment webhook",
        failure_logs="TypeError at line 48 in payment.ts",
        user_id="usr-demo-01"
    )
    assert job.id.startswith("reaper-")
    assert job.status == "RECEIVED"

    fetched = repo.get_by_id(job.id)
    assert fetched is not None
    assert fetched.repo_name == "reaper-engine/payment-gateway"


def test_list_repairs(db_session):
    repo = RepairRepository(db_session)
    jobs = repo.list_repairs(limit=10)
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


def test_repair_orchestrator_complete_workflow(db_session, monkeypatch):
    """
    Test full orchestrator workflow with verified sandbox execution.
    """
    # Mock sandbox to simulate successful containerized verification
    monkeypatch.setattr(
        sandbox,
        "execute_test",
        lambda test_command, patch_content=None, workspace_source_dir=None: SandboxResult(
            exit_code=0,
            stdout="18 passed in 1.14s",
            stderr="",
            duration_seconds=1.2,
            passed=True,
            sandbox_available=True
        )
    )

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


def test_repair_orchestrator_docker_unavailable_safety(db_session, monkeypatch):
    """
    Test that when Docker is unavailable, the orchestrator refuses to fake a pass.
    """
    monkeypatch.setattr(sandbox, "is_docker_available", lambda: False)

    repo = RepairRepository(db_session)
    job = repo.create_repair(
        repo_name="reaper-engine/payment-gateway",
        branch="main",
        issue_description="TypeError: Null reference",
        failure_logs="TypeError: null pointer in test"
    )

    orchestrator = RepairOrchestrator(db_session)
    result = orchestrator.run_workflow_sync(job.id)

    assert result["success"] is False
    assert result["status"] == "UNVERIFIED_NO_DOCKER"
    assert "Docker sandbox is unavailable" in result["error"]
