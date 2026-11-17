import pytest
from app.sandbox.docker_sandbox import DockerSandbox


def test_sandbox_execution():
    sandbox = DockerSandbox()
    result = sandbox.execute_test("pytest", "--- diff dummy")
    assert result.exit_code == 0
    assert result.passed is True
    assert result.duration_seconds > 0
    assert "passed" in result.stdout.lower()
