"""
ingestion.py

Lightweight file-type detection helpers for the API.
Actual document parsing has been moved to the ingestion_worker service.

Supported formats: PDF, TXT, MD, HTML, DOCX
"""

import os

# Mapping of extensions to their human-readable type name
EXTENSION_MAP = {
    ".pdf": "pdf",
    ".txt": "txt",
    ".md": "md",
    ".markdown": "md",
    ".html": "html",
    ".htm": "html",
    ".docx": "docx",
}

SUPPORTED_EXTENSIONS = set(EXTENSION_MAP.keys())
SUPPORTED_TYPES = set(EXTENSION_MAP.values())

# Human-friendly description for error messages
SUPPORTED_DESCRIPTION = "PDF, TXT, MD, HTML, DOCX"


def detect_file_type(filename: str) -> str:
    """Detect file type from extension.

    Returns one of: 'pdf', 'txt', 'md', 'html', 'docx'
    Raises ValueError if the extension is unsupported.
    """
    ext = os.path.splitext(filename)[1].lower()
    file_type = EXTENSION_MAP.get(ext)
    if file_type is None:
        raise ValueError(
            f"Unsupported file type '{ext}' for '{filename}'. "
            f"Supported types: {SUPPORTED_DESCRIPTION}"
        )
    return file_type


def is_supported(filename: str) -> bool:
    """Return True if the filename has a supported extension."""
    ext = os.path.splitext(filename)[1].lower()
    return ext in EXTENSION_MAP