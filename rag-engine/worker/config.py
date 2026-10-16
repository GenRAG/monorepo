"""
worker/config.py

Worker-specific configuration — only the env vars the ingestion worker needs.
No FastAPI / langfuse / cohere / zeroentropy settings are loaded here.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    qdrant_url: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    qdrant_api_key: str = os.getenv("QDRANT_API_KEY", "")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    s3_endpoint: str = os.getenv("S3_ENDPOINT", "")
    aws_access: str = os.getenv("MINIO_ROOT_USER", os.getenv("MINIO_USER", ""))
    aws_secret: str = os.getenv(
        "MINIO_ROOT_PASSWORD", os.getenv("MINIO_PASSWORD", "")
    )
    bucket_name: str = os.getenv("BUCKET_NAME", "genrag-docs")


settings = Settings()