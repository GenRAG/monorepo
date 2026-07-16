
from fastapi import Header, HTTPException, status
from app.config import settings

def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")):
    if x_api_key != settings.rag_engine_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API Key")
    return x_api_key
