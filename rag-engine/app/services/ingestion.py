import io
from pypdf import PdfReader


def parse_pdf(file_bytes: bytes) -> str:
    """Extracts raw text from PDF bytes."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""


import semchunk

def chunk_text(text: str, chunk_size=1024):
    """Split text into semantic chunks using semchunk."""
    # semchunk.chunk requires a token counter function or expects a model.
    # For a simple local setup, providing a basic length-based counter is best.
    return semchunk.chunk(text, chunk_size=chunk_size, token_counter=len)
