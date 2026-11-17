import re
from typing import Tuple

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"disregard\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"system\s+prompt\s*:",
    r"override\s+(all\s+)?safety\s+rules",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"output\s+the\s+entire\s+prompt",
    r"reveal\s+secret",
    r"curl\s+https?://",
    r"wget\s+https?://",
    r"nc\s+-e",
    r"/bin/sh\s+-i",
    r"eval\s*\(",
    r"exec\s*\("
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]


def detect_and_sanitize_untrusted_input(text: str) -> Tuple[str, bool]:
    """
    Treat all repository files, logs, commit messages, and external content as untrusted data.
    Detects and sanitizes potential prompt injection vectors.
    """
    if not text:
        return "", False

    found_injection = False
    sanitized = text

    for pattern in COMPILED_PATTERNS:
        if pattern.search(sanitized):
            found_injection = True
            sanitized = pattern.sub("[SANITIZED_SECURITY_NEUTRALIZED]", sanitized)

    return sanitized, found_injection
