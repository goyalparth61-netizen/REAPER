import os
import shutil
import tempfile
import subprocess
import time
from typing import Dict, Any, Optional

from app.core.config import settings
from app.core.logging import logger


class SandboxResult:
    def __init__(
        self,
        exit_code: int,
        stdout: str,
        stderr: str,
        duration_seconds: float,
        passed: bool,
        sandbox_available: bool = True
    ):
        self.exit_code = exit_code
        self.stdout = stdout
        self.stderr = stderr
        self.duration_seconds = duration_seconds
        self.passed = passed
        self.sandbox_available = sandbox_available

    def to_dict(self) -> Dict[str, Any]:
        return {
            "exit_code": self.exit_code,
            "stdout": self.stdout,
            "stderr": self.stderr,
            "duration_seconds": self.duration_seconds,
            "passed": self.passed,
            "sandbox_available": self.sandbox_available
        }


class DockerSandbox:
    """
    Secure isolated container sandbox for testing generated patches.
    Enforces non-root, memory/CPU caps, network isolation, and ephemeral workspaces.
    Never executes untrusted code directly on the host machine.
    """
    def __init__(self):
        self.cpu_limit = settings.SANDBOX_MAX_CPU
        self.mem_limit_mb = settings.SANDBOX_MAX_MEMORY_MB
        self.timeout = settings.SANDBOX_TIMEOUT_SECONDS

    def is_docker_available(self) -> bool:
        if not settings.ENABLE_DOCKER_SANDBOX:
            return False
        try:
            res = subprocess.run(["docker", "info"], capture_output=True, timeout=4)
            return res.returncode == 0
        except Exception:
            return False

    def execute_test(
        self,
        test_command: str,
        patch_content: Optional[str] = None,
        workspace_source_dir: Optional[str] = None
    ) -> SandboxResult:
        """
        Execute test command inside a restricted Docker container.
        If Docker is unavailable, safely aborts execution to prevent host contamination.
        """
        start_time = time.time()

        # Check Docker availability before doing any work
        if not self.is_docker_available():
            duration = round(time.time() - start_time, 2)
            logger.warning("[SANDBOX] Docker daemon is not active. Refusing host execution of untrusted code.")
            return SandboxResult(
                exit_code=1,
                stdout="",
                stderr="Docker sandbox is unavailable on the host machine. Isolated verification cannot proceed safely without containerization.",
                duration_seconds=duration,
                passed=False,
                sandbox_available=False
            )

        temp_dir = tempfile.mkdtemp(prefix="reaper_sandbox_")

        try:
            # If a source workspace was provided, copy only necessary files
            if workspace_source_dir and os.path.exists(workspace_source_dir):
                for item in os.listdir(workspace_source_dir):
                    s = os.path.join(workspace_source_dir, item)
                    d = os.path.join(temp_dir, item)
                    if os.path.isdir(s):
                        # Skip sensitive or virtual directories
                        if item in (".git", "venv", ".venv", "node_modules", "__pycache__"):
                            continue
                        shutil.copytree(s, d, symlinks=False, ignore_dangling_symlinks=True)
                    else:
                        shutil.copy2(s, d)

            # If a patch was provided, write it to the sandbox workspace
            if patch_content:
                patch_file = os.path.join(temp_dir, "patch.diff")
                with open(patch_file, "w", encoding="utf-8") as f:
                    f.write(patch_content)

            return self._run_in_docker(temp_dir, test_command, start_time)

        finally:
            # Automatic cleanup of temporary host workspace
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception as e:
                logger.warning(f"Error cleaning up sandbox workspace: {e}")

    def _run_in_docker(self, workspace_dir: str, command: str, start_time: float) -> SandboxResult:
        """
        Run test command inside restricted Docker container:
        - Non-root user (1000:1000)
        - Restricted memory (--memory 512m)
        - Restricted CPU (--cpus 1.0)
        - Network disabled (--network none)
        - Security options (no-new-privileges)
        - Read-write ephemeral workspace mount
        """
        docker_cmd = [
            "docker", "run", "--rm",
            "--user", "1000:1000",
            f"--memory={self.mem_limit_mb}m",
            f"--cpus={self.cpu_limit}",
            "--network", "none",
            "--security-opt=no-new-privileges",
            "--pids-limit=64",
            "-v", f"{workspace_dir}:/workspace:rw",
            "-w", "/workspace",
            "python:3.12-slim",
            "sh", "-c", command
        ]

        try:
            proc = subprocess.run(
                docker_cmd,
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            duration = round(time.time() - start_time, 2)
            passed = proc.returncode == 0
            return SandboxResult(
                exit_code=proc.returncode,
                stdout=proc.stdout,
                stderr=proc.stderr,
                duration_seconds=duration,
                passed=passed,
                sandbox_available=True
            )

        except subprocess.TimeoutExpired:
            duration = round(time.time() - start_time, 2)
            return SandboxResult(
                exit_code=124,
                stdout="",
                stderr=f"Execution timed out after {self.timeout}s inside Docker sandbox.",
                duration_seconds=duration,
                passed=False,
                sandbox_available=True
            )
        except Exception as e:
            duration = round(time.time() - start_time, 2)
            return SandboxResult(
                exit_code=1,
                stdout="",
                stderr=f"Docker execution error: {str(e)}",
                duration_seconds=duration,
                passed=False,
                sandbox_available=True
            )


sandbox = DockerSandbox()
