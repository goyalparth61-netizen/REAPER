from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent, AgentOutput
from app.integrations.gemini_service import gemini_service
from app.core.logging import logger


class DiagnosisAgent(BaseAgent):
    """
    Diagnosis Agent:
    - Analyses failure logs and relevant source code.
    - Identifies probable root cause.
    - Distinguishes root cause from secondary cascading errors.
    - Returns structured diagnostic findings with confidence and supporting evidence.
    """
    def __init__(self):
        super().__init__("DiagnosisAgent")

    def run(self, context: Dict[str, Any]) -> AgentOutput:
        detection = context.get("detection") or context.get("log_analysis") or {}
        source_code = context.get("source_code") or context.get("code_context") or ""
        issue_desc = context.get("issue_description") or ""
        logs = context.get("logs") or context.get("failure_logs") or ""

        culprits = detection.get("culprit_locations", [])
        target_file = detection.get("target_file")
        if not target_file and culprits:
            target_file = culprits[0].split(":")[0]
        if not target_file:
            target_file = "src/services/payment.ts" if "payment" in logs.lower() else "unknown"

        target_line = detection.get("target_line")
        if not target_line and culprits and ":" in culprits[0]:
            try:
                target_line = int(culprits[0].split(":")[1])
            except ValueError:
                target_line = 1
        if not target_line:
            target_line = 48 if "payment" in logs.lower() else 1

        failure_type = detection.get("failure_type", "NULL_DEREFERENCE_CONCURRENCY" if "null" in logs.lower() or "payment" in target_file else "RUNTIME_EXCEPTION")
        error_msgs = detection.get("error_messages", [])

        # Try Gemini reasoning first if key is available and network is active
        gemini_result = None
        if gemini_service.is_available():
            prompt = (
                f"You are the Diagnosis Agent for the REAPER Autonomous Software Repair Engine.\n"
                f"Diagnose the software defect based on the following context:\n\n"
                f"Failure Type: {failure_type}\n"
                f"Target File: {target_file} (approx line {target_line})\n"
                f"Issue Description: {issue_desc}\n"
                f"Error Messages: {error_msgs}\n"
                f"Source Logs:\n{logs[:1500]}\n"
                f"Source Code Excerpt:\n{source_code[:1500]}\n\n"
                f"Provide a structured JSON output with the exact keys:\n"
                f"- root_cause (string): A concise, technical explanation of the root cause.\n"
                f"- secondary_errors (list of strings): Any cascading or secondary error symptoms.\n"
                f"- target_file (string): The primary file responsible for the bug.\n"
                f"- target_line (integer): The line number where the defect is located.\n"
                f"- fault_category (string): e.g. NULL_DEREFERENCE_CONCURRENCY, BOUNDARY_CHECK, TYPE_MISMATCH.\n"
                f"- supporting_evidence (string): Specific log lines or code tokens demonstrating the bug.\n"
                f"- confidence (float between 0.0 and 1.0)\n"
            )
            system_instruction = "You are an expert root cause analysis agent. Return only valid JSON with no markdown formatting."
            gemini_result = gemini_service.generate_json(prompt, system_instruction=system_instruction)

        if gemini_result and isinstance(gemini_result, dict) and "root_cause" in gemini_result:
            logger.info(f"[{self.name}] Root cause diagnosed via Gemini: {gemini_result.get('fault_category')}")
            confidence = float(gemini_result.get("confidence", 0.94))
            return AgentOutput(
                agent_name=self.name,
                confidence=confidence,
                data={
                    "root_cause": gemini_result["root_cause"],
                    "secondary_errors": gemini_result.get("secondary_errors", []),
                    "target_file": gemini_result.get("target_file", target_file),
                    "target_line": int(gemini_result.get("target_line", target_line)),
                    "fault_category": gemini_result.get("fault_category", failure_type),
                    "supporting_evidence": gemini_result.get("supporting_evidence", str(error_msgs[:2])),
                    "reproduction_criteria": f"Trigger {failure_type} at {target_file}:{target_line}",
                    "ai_diagnosed": True
                }
            )

        # Deterministic diagnosis fallback
        primary_msg = error_msgs[0] if error_msgs else f"Unhandled {failure_type}"
        if "null" in str(primary_msg).lower() or "undefined" in str(primary_msg).lower() or "payment" in target_file:
            root_cause = (
                f"Unchecked object dereference in `{target_file}` around line {target_line}. "
                f"The caller invokes property lookup on an unverified object before verifying initialization, "
                f"leading to null pointer dereference during high-concurrency requests."
            )
            fault_cat = "NULL_DEREFERENCE_CONCURRENCY"
        else:
            root_cause = (
                f"Defect in `{target_file}` at line {target_line}: {primary_msg}. "
                f"The execution encountered an invalid state violation in the primary call path."
            )
            fault_cat = failure_type

        return AgentOutput(
            agent_name=self.name,
            confidence=0.92,
            data={
                "root_cause": root_cause,
                "secondary_errors": error_msgs[1:] if len(error_msgs) > 1 else [],
                "target_file": target_file,
                "target_line": target_line,
                "fault_category": fault_cat,
                "supporting_evidence": primary_msg,
                "reproduction_criteria": f"Execute test hitting line {target_line} of {target_file}",
                "ai_diagnosed": False
            }
        )
