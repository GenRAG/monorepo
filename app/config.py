import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings # Import BaseSettings from pydantic_settings

load_dotenv()

class Settings(BaseSettings):
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    rag_engine_api_key: str = os.getenv("RAG_ENGINE_API_KEY", "") # New API key for RAG engine
    qdrant_url: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    s3_endpoint: str = os.getenv("S3_ENDPOINT", "")
    aws_access: str = os.getenv("MINIO_ROOT_USER", os.getenv("MINIO_USER", ""))
    aws_secret: str = os.getenv("MINIO_ROOT_PASSWORD", os.getenv("MINIO_PASSWORD", ""))
    bucket_name: str = os.getenv("BUCKET_NAME", "genrag-docs")
    zeroentropy_key: str = os.getenv("ZEROENTROPY_API_KEY", "")
    cohere_key: str = os.getenv("COHERE_API_KEY", "")
    langfuse_public_key: str = os.getenv("LANGFUSE_PUBLIC_KEY", "")
    langfuse_secret_key: str = os.getenv("LANGFUSE_SECRET_KEY", "")
    langfuse_base_url: str = os.getenv(
        "LANGFUSE_BASE_URL", os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
    )

settings = Settings()
