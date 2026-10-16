"""
worker/storage.py

MinIO S3-compatible storage operations for the ingestion worker.
Provides file download/upload for both document files and scraped web pages.
"""

import hashlib
import json
import boto3
from botocore.config import Config as BotoConfig
from botocore.exceptions import ClientError
from worker.config import settings


def get_s3_client():
    """Create and return a boto3 S3 client configured for MinIO."""
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint,
        aws_access_key_id=settings.aws_access,
        aws_secret_access_key=settings.aws_secret,
        config=BotoConfig(signature_version="s3v4"),
        region_name="us-east-1",
    )


def ensure_bucket_exists():
    """Create the configured bucket if it doesn't already exist."""
    client = get_s3_client()
    try:
        client.head_bucket(Bucket=settings.bucket_name)
    except ClientError:
        client.create_bucket(Bucket=settings.bucket_name)
        print(f"Created bucket '{settings.bucket_name}'")


def download_object(key: str) -> bytes:
    """Download a raw object from MinIO by key and return its bytes.

    Raises:
        FileNotFoundError: If the object does not exist in MinIO.
    """
    client = get_s3_client()
    try:
        response = client.get_object(Bucket=settings.bucket_name, Key=key)
        return response["Body"].read()
    except ClientError as e:
        raise FileNotFoundError(
            f"Object '{key}' not found in bucket '{settings.bucket_name}': {e}"
        )


def upload_file(file_obj, object_name: str):
    """Upload a file-like object to MinIO.

    Args:
        file_obj: A file-like object (BytesIO, etc.).
        object_name: The key/path within the bucket.
    """
    client = get_s3_client()
    client.upload_fileobj(file_obj, settings.bucket_name, object_name)
    print(f"Uploaded '{object_name}' to bucket '{settings.bucket_name}'")


# --- Website ingestion helpers ---
# Pages live under {org_id}/{dataset_id}/websites/{sha256(url)}.json


def _page_key(prefix: str, url: str) -> str:
    url_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()
    return f"{prefix}/websites/{url_hash}.json"


def page_exists_with_same_hash(prefix: str, url: str, content_md: str) -> bool:
    """Check if a page exists in MinIO with the same content hash (dedup)."""
    client = get_s3_client()
    content_hash = hashlib.sha256(content_md.encode("utf-8")).hexdigest()
    object_name = _page_key(prefix, url)
    try:
        result = client.get_object(Bucket=settings.bucket_name, Key=object_name)
        existing = json.loads(result["Body"].read().decode("utf-8"))
        return existing.get("content_hash") == content_hash
    except Exception:
        return False


def upload_page(prefix: str, page_data: dict) -> bool:
    """Upload a scraped web page to MinIO as JSON under {prefix}/websites/.

    The page_data dict must include a 'content_md' key. A content_hash is
    automatically computed and included for deduplication checks.
    """
    client = get_s3_client()
    page_data["content_hash"] = hashlib.sha256(
        page_data["content_md"].encode("utf-8")
    ).hexdigest()
    object_name = _page_key(prefix, page_data["url"])
    try:
        client.put_object(
            Bucket=settings.bucket_name,
            Key=object_name,
            Body=json.dumps(page_data, indent=2).encode("utf-8"),
            ContentType="application/json",
        )
        print(f"Uploaded page to {object_name}")
        return True
    except Exception as e:
        print(f"Upload page failed: {e}")
        return False
