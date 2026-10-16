"""
worker/parse.py

Unified document parsing using markitdown.
Converts any supported format (PDF, DOCX, HTML, TXT, MD, and more)
into clean Markdown text ready for chunking.
"""

import os
import re
from io import BytesIO

from markitdown import MarkItDown


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
SUPPORTED_DESCRIPTION = "PDF, TXT, MD, HTML, DOCX"


# Regex to match markdown images with data URIs (base64-encoded content).
# These bloat the embedding input with useless binary noise.
# Matches ![alt](data:...) and ![](data:...)
_DATA_URI_IMAGE_RE = re.compile(r"!\[.*?\]\(data:[^)]+\)")


def strip_base64_images(text: str) -> str:
    """Remove markdown image tags containing base64 data URIs.

    These are produced by markitdown when it extracts embedded images
    (e.g. from DOCX files). The base64 blobs are meaningless for
    semantic search and waste embedding capacity.
    """
    return _DATA_URI_IMAGE_RE.sub("", text)


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


def parse_document(file_bytes: bytes, filename: str) -> str:
    """Parse a document of any supported type and return clean Markdown text.

    Uses markitdown's unified converter — no need for separate
    parsing logic per file type.

    Args:
        file_bytes: Raw file content as bytes.
        filename: Original filename (used for extension detection).

    Returns:
        Extracted Markdown text content.

    Raises:
        ValueError: If file type is unsupported.
        RuntimeError: If markitdown conversion fails.
    """
    # Validate file type early
    detect_file_type(filename)

    md = MarkItDown()
    result = md.convert(BytesIO(file_bytes), file_path=filename)
    text = result.text_content

    if text is None:
        raise RuntimeError(
            f"markitdown returned no content for '{filename}'"
        )

    # Strip base64 image data URIs — they are meaningless for embeddings
    text = strip_base64_images(text)

    return text.strip()