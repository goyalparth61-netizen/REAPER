import pytest
from app.services.github_service import get_github_service, MockGitHubService
from app.core.config import settings


def test_github_service_disabled_by_default():
    assert settings.ENABLE_GITHUB_INTEGRATION is False
    service = get_github_service()
    assert isinstance(service, MockGitHubService)


def test_mock_github_repositories():
    service = get_github_service()
    repos = service.list_repositories()
    assert len(repos) >= 4
    assert any(r["name"] == "payment-gateway" for r in repos)


def test_mock_pull_request_creation():
    service = get_github_service()
    pr = service.create_pull_request(
        repo_full_name="reaper-engine/payment-gateway",
        title="fix(autonomous): null dereference",
        body="Autonomous patch",
        head_branch="reaper/fix-01"
    )
    assert pr["status"] == "OPEN"
    # Verify strict requirement: NEVER automatically merge, human approval required
    assert pr["auto_merge"] is False
    assert pr["human_approval_required"] is True
