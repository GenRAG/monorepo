import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Storage
    S3_ENDPOINT = os.getenv("S3_ENDPOINT") # None if AWS
    AWS_ACCESS = os.getenv("MINIO_ROOT_USER")
    AWS_SECRET = os.getenv("MINIO_ROOT_PASSWORD")
    BUCKET_NAME = os.getenv("BUCKET_NAME", "genrag-docs")
    
    # AI
    OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")