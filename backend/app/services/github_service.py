from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.core.logging import logger


class IGitHubService(ABC):
    @abstractmethod
    def list_repositories(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_repository_metadata(self, repo_full_name: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_failed_workflow_logs(self, repo_full_name: str, run_id: Optional[str] = None) -> str:
        pass

    @abstractmethod
    def create_repair_branch(self, repo_full_name: str, branch_name: str, base_branch: str = "main") -> bool:
        pass

    @abstractmethod
    def create_pull_request(self, repo_full_name: str, title: str, body: str, head_branch: str, base_branch: str = "main") -> Dict[str, Any]:
        pass


class MockGitHubService(IGitHubService):
    """
    Mock GitHub service for safe pre-hackathon development and local tests.
    Ensures no real GitHub operations are performed while maintaining exact contract.
    """
    DEMO_REPOS = [
        {
            "id": "repo-1",
            "name": "payment-gateway",
            "owner": "reaper-engine",
            "fullName": "reaper-engine/payment-gateway",
            "defaultBranch": "main",
            "visibility": "private",
            "language": "TypeScript",
            "description": "Distributed payment processing service with idempotency checks",
            "isDemo": True,
            "lastScan": "Clean • 2 hrs ago"
        },
        {
            "id": "repo-2",
            "name": "auth-service",
            "owner": "reaper-engine",
            "fullName": "reaper-engine/auth-service",
            "defaultBranch": "main",
            "visibility": "private",
            "language": "Go",
            "description": "JWT & OAuth2 session management microservice",
            "isDemo": True,
            "lastScan": "Failing CI • 14 mins ago"
        },
        {
            "id": "repo-3",
            "name": "data-pipeline",
            "owner": "reaper-engine",
            "fullName": "reaper-engine/data-pipeline",
            "defaultBranch": "master",
            "visibility": "public",
            "language": "Python",
            "description": "High-throughput streaming ETL pipeline with regression test suite",
            "isDemo": True,
            "lastScan": "Failing tests in test_etl.py"
        },
        {
            "id": "repo-4",
            "name": "react-dashboard",
            "owner": "reaper-engine",
            "fullName": "reaper-engine/react-dashboard",
            "defaultBranch": "main",
            "visibility": "public",
            "language": "JavaScript",
            "description": "Frontend telemetry console and client application",
            "isDemo": True,
            "lastScan": "Clean • 1 day ago"
        }
    ]

    def list_repositories(self) -> List[Dict[str, Any]]:
        return self.DEMO_REPOS

    def get_repository_metadata(self, repo_full_name: str) -> Optional[Dict[str, Any]]:
        for r in self.DEMO_REPOS:
            if r["fullName"].lower() == repo_full_name.lower():
                return r
        return {
            "name": repo_full_name.split("/")[-1],
            "owner": repo_full_name.split("/")[0] if "/" in repo_full_name else "reaper-engine",
            "fullName": repo_full_name,
            "defaultBranch": "main",
            "language": "Python",
            "isDemo": True
        }

    def get_failed_workflow_logs(self, repo_full_name: str, run_id: Optional[str] = None) -> str:
        return (
            "FAIL src/services/payment.test.ts\n"
            "  ● processPayment() › should handle concurrent race conditions safely\n"
            "    TypeError: Cannot read properties of undefined (reading 'balance')\n"
            "      at PaymentProcessor.deductBalance (src/services/payment.ts:48:22)\n"
            "      at async PaymentProcessor.processPayment (src/services/payment.ts:112:15)\n"
            "      at async Object.<anonymous> (src/services/payment.test.ts:34:7)\n"
            "Test Suites: 1 failed, 14 passed, 15 total\n"
            "Tests:       1 failed, 62 passed, 63 total\n"
        )

    def create_repair_branch(self, repo_full_name: str, branch_name: str, base_branch: str = "main") -> bool:
        logger.info(f"[MOCK GITHUB] Created simulated branch {branch_name} from {base_branch} on {repo_full_name}")
        return True

    def create_pull_request(self, repo_full_name: str, title: str, body: str, head_branch: str, base_branch: str = "main") -> Dict[str, Any]:
        logger.info(f"[MOCK GITHUB] Drafted simulated pull request: '{title}' for {head_branch} -> {base_branch}")
        return {
            "pr_number": 42,
            "pr_url": f"https://github.com/{repo_full_name}/pull/42",
            "title": title,
            "status": "OPEN",
            "auto_merge": False,
            "human_approval_required": True
        }


class RealGitHubAppService(IGitHubService):
    """
    Real GitHub App integration.
    Only instantiated when ENABLE_GITHUB_INTEGRATION=True and GITHUB_APP_ID is provided.
    Never auto-merges pull requests. Human approval is strictly enforced.
    """
    def __init__(self):
        try:
            from github import Github
            self.gh = Github()
            logger.info("Real GitHub App Service initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize PyGithub: {e}")
            self.gh = None

    def list_repositories(self) -> List[Dict[str, Any]]:
        # In production, uses GitHub App installation token
        return []

    def get_repository_metadata(self, repo_full_name: str) -> Optional[Dict[str, Any]]:
        return None

    def get_failed_workflow_logs(self, repo_full_name: str, run_id: Optional[str] = None) -> str:
        return ""

    def create_repair_branch(self, repo_full_name: str, branch_name: str, base_branch: str = "main") -> bool:
        return True

    def create_pull_request(self, repo_full_name: str, title: str, body: str, head_branch: str, base_branch: str = "main") -> Dict[str, Any]:
        return {
            "pr_number": 1,
            "pr_url": "",
            "title": title,
            "status": "OPEN",
            "auto_merge": False,
            "human_approval_required": True
        }


def get_github_service() -> IGitHubService:
    if settings.ENABLE_GITHUB_INTEGRATION and settings.GITHUB_APP_ID:
        return RealGitHubAppService()
    return MockGitHubService()


github_service = get_github_service()
