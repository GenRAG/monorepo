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
        print(f"❌ PDF Error: {e}")
        return ""

def chunk_text(text: str, chunk_size=1000, overlap=100):
    """Splits text into chunks of roughly 1000 characters."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        # Move forward, leaving some overlap context
        start += (chunk_size - overlap)
    return chunks