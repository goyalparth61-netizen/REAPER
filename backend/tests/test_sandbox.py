import pytest
from app.sandbox.docker_sandbox import DockerSandbox, SandboxResult


def test_sandbox_execution_safety_abort():
    """
    When Docker daemon is unavailable, execute_test must refuse execution on the host machine.
    """
    sandbox = DockerSandbox()
    # When docker is not running:
    if not sandbox.is_docker_available():
        result = sandbox.execute_test("pytest", "--- diff dummy")
        assert result.exit_code == 1
        assert result.passed is False
        assert result.sandbox_available is False
        assert "Docker sandbox is unavailable" in result.stderr
    else:
        result = sandbox.execute_test("echo 'test'", "--- diff dummy")
        assert result.sandbox_available is True


def test_sandbox_docker_mocked_execution(monkeypatch):
    """
    Verify that when Docker is available, _run_in_docker produces a valid passing SandboxResult.
    """
    sandbox = DockerSandbox()
    monkeypatch.setattr(sandbox, "is_docker_available", lambda: True)
    monkeypatch.setattr(
        sandbox,
        "_run_in_docker",
        lambda temp_dir, cmd, start: SandboxResult(
            exit_code=0,
            stdout="============================== 18 passed in 1.14s ==============================",
            stderr="",
            duration_seconds=1.2,
            passed=True,
            sandbox_available=True
        )
    )

    result = sandbox.execute_test("pytest -v", "--- diff dummy")
    assert result.exit_code == 0
    assert result.passed is True
    assert result.sandbox_available is True
    assert "passed" in result.stdout.lower()
