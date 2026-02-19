import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    S3_ENDPOINT = os.getenv("S3_ENDPOINT")
    AWS_ACCESS = os.getenv("MINIO_ROOT_USER", os.getenv("MINIO_USER"))
    AWS_SECRET = os.getenv("MINIO_ROOT_PASSWORD", os.getenv("MINIO_PASSWORD"))
    BUCKET_NAME = os.getenv("BUCKET_NAME", "genrag-docs")
    OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
    ZEROENTROPY_KEY = os.getenv("ZEROENTROPY_API_KEY")
    COHERE_KEY = os.getenv("COHERE_API_KEY")
    LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY")
    LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY")
    LANGFUSE_BASE_URL = os.getenv(
        "LANGFUSE_BASE_URL", os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
    )
