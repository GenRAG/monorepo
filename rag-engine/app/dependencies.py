import hmac

from fastapi import Header, HTTPException, status
from app.config import settings

def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")):
    # Fail closed: with RAG_ENGINE_API_KEY unset, an empty X-API-Key header
    # would otherwise match "" and pass.
    if not settings.rag_engine_api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="API key auth not configured")
    # Constant-time comparison to avoid leaking the key through timing.
    if not hmac.compare_digest(x_api_key.encode(), settings.rag_engine_api_key.encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API Key")
    return x_api_key
