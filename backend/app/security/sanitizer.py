import os
import re


def sanitize_file_path(path: str, base_dir: str) -> str:
    """
    Prevent directory traversal attacks (e.g. ../../etc/passwd).
    """
    clean_path = os.path.normpath(path).lstrip("/\\")
    full_path = os.path.abspath(os.path.join(base_dir, clean_path))
    base_abs = os.path.abspath(base_dir)

    if not full_path.startswith(base_abs):
        raise ValueError("Security violation: Attempted path traversal.")
    return full_path


def sanitize_branch_name(branch: str) -> str:
    """
    Sanitize git branch names against shell injection characters.
    """
    clean = re.sub(r"[^a-zA-Z0-9_\-\./]", "", branch)
    return clean[:100]
