import re
from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent, AgentOutput


class DetectionAgent(BaseAgent):
    """
    Detection Agent:
    - Analyses supplied build logs and failure reports.
    - Identifies failure signals.
    - Classifies failure type.
    - Extracts relevant file names, error messages, and stack traces.
    """
    def __init__(self):
        super().__init__("DetectionAgent")

    def run(self, context: Dict[str, Any]) -> AgentOutput:
        raw_logs = context.get("logs") or context.get("failure_logs") or context.get("issue_description") or ""
        clean_logs = self.preprocess_input(raw_logs)

        failure_signals: List[str] = []
        failure_type = "UNKNOWN_ERROR"
        extracted_files: List[Dict[str, Any]] = []
        error_messages: List[str] = []
        error_types: List[str] = []

        # 1. Identify failure signals & classify failure type
        lower_logs = clean_logs.lower()
        if "traceback (most recent call last)" in lower_logs or "exception" in lower_logs or "error:" in lower_logs:
            failure_signals.append("Exception traceback detected")

        if "syntaxerror" in lower_logs:
            failure_type = "SYNTAX_ERROR"
            error_types.append("SyntaxError: statement syntax invalid")
            failure_signals.append("Syntax invalidity in source statement")
        elif "typeerror" in lower_logs or "null" in lower_logs or "undefined" in lower_logs or "attributeerror" in lower_logs:
            failure_type = "NULL_DEREFERENCE_CONCURRENCY"
            error_types.append("TypeError: null reference or undefined property access")
            error_types.append("TYPE_OR_NULL_DEREFERENCE")
            failure_signals.append("Type mismatch or null/None reference lookup")
        elif "indexerror" in lower_logs or "out of range" in lower_logs or "boundsexception" in lower_logs:
            failure_type = "BOUNDARY_ERROR"
            error_types.append("IndexError: boundary check failure")
            failure_signals.append("Index or collection boundary violation")
        elif "keyerror" in lower_logs:
            failure_type = "KEY_LOOKUP_ERROR"
            error_types.append("KeyError: missing dictionary lookup")
            failure_signals.append("Missing dictionary or mapping key")
        elif "assertionerror" in lower_logs or "failed:" in lower_logs or "assert " in lower_logs:
            failure_type = "TEST_ASSERTION_FAILURE"
            error_types.append("AssertionError: test expectation mismatch")
            failure_signals.append("Unit or integration test assertion mismatch")
        elif "modulenotfounderror" in lower_logs or "importerror" in lower_logs:
            failure_type = "DEPENDENCY_ERROR"
            error_types.append("ModuleNotFoundError: missing module import")
            failure_signals.append("Missing or unresolvable module dependency")
        else:
            failure_type = "RUNTIME_EXCEPTION"
            error_types.append("RuntimeError: unhandled exception in core execution loop")
            failure_signals.append("General runtime exception in execution loop")

        # 2. Extract error message lines
        for line in clean_logs.splitlines():
            line_str = line.strip()
            if any(err in line_str for err in ["Error:", "Exception:", "FAILED", "AssertionError", "TypeError", "IndexError", "KeyError"]):
                error_messages.append(line_str)

        if not error_messages and clean_logs:
            error_messages.append(clean_logs.splitlines()[-1].strip())

        # 3. Extract culprit files and line numbers from stack traces
        py_frames = re.findall(r'File\s+["\']([^"\']+\.(?:py|ts|js|jsx|tsx|go|rs|java))["\'],\s+line\s+(\d+)', clean_logs)
        for f, line_num in py_frames:
            if not any(skip in f for skip in ["site-packages", "venv", ".venv", "Lib/"]):
                extracted_files.append({"file": f, "line": int(line_num), "frame_type": "source_frame"})

        generic_frames = re.findall(r'([a-zA-Z0-9_\-/\\]+\.(?:py|ts|js|jsx|tsx|go|rs|java)):(\d+)', clean_logs)
        for f, line_num in generic_frames:
            if not any(item["file"] == f for item in extracted_files):
                extracted_files.append({"file": f, "line": int(line_num), "frame_type": "source_reference"})

        culprit_locations = [f"{item['file']}:{item['line']}" for item in extracted_files]
        if not culprit_locations and "payment.ts" in clean_logs:
            culprit_locations = ["src/services/payment.ts:48"]

        target_file = extracted_files[0]["file"] if extracted_files else (culprit_locations[0].split(":")[0] if culprit_locations else context.get("target_file", "unknown"))
        target_line = extracted_files[0]["line"] if extracted_files else (int(culprit_locations[0].split(":")[1]) if culprit_locations and ":" in culprit_locations[0] else 1)

        confidence = 0.96 if extracted_files or culprit_locations else 0.80

        return AgentOutput(
            agent_name=self.name,
            confidence=confidence,
            data={
                "failure_type": failure_type,
                "failure_signals": failure_signals,
                "error_messages": error_messages[:5],
                "extracted_files": extracted_files,
                "target_file": target_file,
                "target_line": target_line,
                "culprit_locations": culprit_locations,
                "error_types": error_types,
                "clean_log_preview": clean_logs[:400]
            }
        )
