"""
worker/chunking.py

Text chunking using semchunk — splits Markdown text into
semantic chunks for embedding and retrieval.
"""

import semchunk


def chunk_text(text: str, chunk_size: int = 1024):
    """Split text into semantic chunks using semchunk.

    Args:
        text: The text to chunk.
        chunk_size: Target chunk size in tokens (default: 1024).

    Returns:
        List of text chunks.
    """
    if not text or not text.strip():
        return []

    # semchunk.chunk requires a token counter function.
    # Using len as a simple character-based counter works well.
    return semchunk.chunk(text, chunk_size=chunk_size, token_counter=len)