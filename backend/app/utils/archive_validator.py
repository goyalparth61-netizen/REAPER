import os
import zipfile
import tarfile
from typing import Tuple, List
from app.core.config import settings
from app.core.logging import logger

ALLOWED_EXTENSIONS = {".zip", ".tar.gz", ".tgz"}
MAX_ARCHIVE_SIZE = settings.MAX_UPLOAD_SIZE_BYTES  # Default 25MB
MAX_UNCOMPRESSED_RATIO = 10  # Prevent decompression bombs (max 250MB extracted)


class ArchiveValidationError(Exception):
    pass


def validate_and_extract_archive(archive_path: str, destination_dir: str) -> Tuple[bool, List[str]]:
    """
    Validates uploaded project archive for:
    1. Size limits (reject oversized archives)
    2. Path traversal (prevent writing outside destination_dir)
    3. Dangerous symlinks or special devices
    4. Decompression bomb ratio

    Returns (is_valid, list_of_extracted_relative_files).
    """
    if not os.path.exists(archive_path):
        raise ArchiveValidationError(f"Archive file not found: {archive_path}")

    file_size = os.path.getsize(archive_path)
    if file_size > MAX_ARCHIVE_SIZE:
        raise ArchiveValidationError(
            f"Archive exceeds maximum allowed size of {MAX_ARCHIVE_SIZE / (1024 * 1024):.1f} MB (got {file_size / (1024 * 1024):.1f} MB)"
        )

    ext = None
    lower_path = archive_path.lower()
    for allowed in ALLOWED_EXTENSIONS:
        if lower_path.endswith(allowed):
            ext = allowed
            break

    if not ext:
        raise ArchiveValidationError(f"Unsupported archive format. Supported formats: {', '.join(ALLOWED_EXTENSIONS)}")

    os.makedirs(destination_dir, exist_ok=True)
    real_dest = os.path.realpath(destination_dir)
    extracted_files: List[str] = []

    if ext == ".zip":
        with zipfile.ZipFile(archive_path, "r") as zf:
            total_uncompressed = sum(info.file_size for info in zf.infolist())
            if total_uncompressed > MAX_ARCHIVE_SIZE * MAX_UNCOMPRESSED_RATIO:
                raise ArchiveValidationError("Archive rejected: Decompression bomb detected (excessive uncompressed ratio).")

            for info in zf.infolist():
                filename = info.filename
                # Path traversal check
                target_path = os.path.realpath(os.path.join(destination_dir, filename))
                if not (target_path == real_dest or target_path.startswith(real_dest + os.sep)):
                    raise ArchiveValidationError(f"Path traversal attempt detected in archive member: {filename}")

                # Check for suspicious absolute paths or null bytes
                if "\0" in filename or filename.startswith("/") or filename.startswith("\\"):
                    raise ArchiveValidationError(f"Malicious member path detected: {filename}")

            zf.extractall(destination_dir)
            extracted_files = [info.filename for info in zf.infolist() if not info.is_dir()]

    elif ext in (".tar.gz", ".tgz"):
        with tarfile.open(archive_path, "r:gz") as tf:
            total_uncompressed = 0
            for member in tf.getmembers():
                total_uncompressed += member.size
                if total_uncompressed > MAX_ARCHIVE_SIZE * MAX_UNCOMPRESSED_RATIO:
                    raise ArchiveValidationError("Archive rejected: Decompression bomb detected.")

                # Reject symlinks pointing outside destination
                if member.islnk() or member.issym():
                    link_target = os.path.realpath(os.path.join(destination_dir, member.linkname))
                    if not link_target.startswith(real_dest):
                        raise ArchiveValidationError(f"Dangerous symlink pointing outside sandbox: {member.name} -> {member.linkname}")

                # Path traversal check
                target_path = os.path.realpath(os.path.join(destination_dir, member.name))
                if not (target_path == real_dest or target_path.startswith(real_dest + os.sep)):
                    raise ArchiveValidationError(f"Path traversal attempt detected in tar member: {member.name}")

            tf.extractall(destination_dir)
            extracted_files = [m.name for m in tf.getmembers() if m.isfile()]

    logger.info(f"[ARCHIVE] Successfully verified and extracted {len(extracted_files)} files to {destination_dir}")
    return True, extracted_files
