import boto3
import os
from botocore.exceptions import ClientError

# Load config from .env
ENDPOINT = os.getenv("S3_ENDPOINT")
ACCESS_KEY = os.getenv("MINIO_USER")
SECRET_KEY = os.getenv("MINIO_PASSWORD")
BUCKET_NAME = os.getenv("BUCKET_NAME", "genrag-documents")


def get_s3_client():
    """Creates the connection to MinIO"""
    return boto3.client(
        "s3",
        endpoint_url=ENDPOINT,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
    )


def ensure_bucket_exists():
    """Ensure storage bucket exists."""
    s3 = get_s3_client()
    try:
        s3.head_bucket(Bucket=BUCKET_NAME)
    except ClientError:
        try:
            s3.create_bucket(Bucket=BUCKET_NAME)
            print(f"Created bucket: {BUCKET_NAME}")
        except Exception as e:
            print(f"Bucket creation warning: {e}")


def upload_file(file_obj, object_name):
    """Upload a file to MinIO."""
    s3 = get_s3_client()
    # MinIO has no healthcheck in compose, so the startup bucket creation can
    # run before MinIO is up; make sure the bucket exists at upload time too.
    ensure_bucket_exists()
    try:
        s3.upload_fileobj(file_obj, BUCKET_NAME, object_name)
        print(f"Uploaded {object_name} to storage")
        return True
    except Exception as e:
        print(f"Upload failed: {e}")
        return False


import hashlib
import json


def page_exists_with_same_hash(org_id: str, url: str, content_md: str) -> bool:
    """Check if a page exists in MinIO with the same content hash (dedup)."""
    s3 = get_s3_client()
    content_hash = hashlib.sha256(content_md.encode("utf-8")).hexdigest()
    url_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()
    object_name = f"{org_id}/websites/{url_hash}.json"
    try:
        result = s3.get_object(Bucket=BUCKET_NAME, Key=object_name)
        existing = json.loads(result["Body"].read().decode("utf-8"))
        return existing.get("content_hash") == content_hash
    except Exception:
        return False


def upload_page(org_id: str, page_data: dict) -> bool:
    """Upload a scraped web page to MinIO as JSON under {org_id}/websites/.

    The page_data dict must include a 'content_md' key. A content_hash is
    automatically computed and included for deduplication checks.
    """
    s3 = get_s3_client()
    page_data["content_hash"] = hashlib.sha256(page_data["content_md"].encode("utf-8")).hexdigest()
    url_hash = hashlib.sha256(page_data["url"].encode("utf-8")).hexdigest()
    object_name = f"{org_id}/websites/{url_hash}.json"
    try:
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=object_name,
            Body=json.dumps(page_data, indent=2).encode("utf-8"),
            ContentType="application/json",
        )
        print(f"Uploaded page to {object_name}")
        return True
    except Exception as e:
        print(f"Upload page failed: {e}")
        return False


def document_key(org_id: str, dataset_id: str, filename: str) -> str:
    """MinIO key of an uploaded document: {org_id}/{dataset_id}/{filename}."""
    return f"{org_id}/{dataset_id}/{filename}"


def delete_file(org_id: str, dataset_id: str, filename: str) -> bool:
    """Delete a document from MinIO at {org_id}/{dataset_id}/{filename}.

    Returns True if deleted, False if the object did not exist.
    """
    s3 = get_s3_client()
    object_name = document_key(org_id, dataset_id, filename)
    try:
        # S3 delete_object succeeds even when the key is missing, so check first
        # to report accurately whether something was removed.
        s3.head_object(Bucket=BUCKET_NAME, Key=object_name)
    except ClientError:
        print(f"Object {object_name} not found for deletion")
        return False
    try:
        s3.delete_object(Bucket=BUCKET_NAME, Key=object_name)
        print(f"Deleted {object_name} from storage")
        return True
    except Exception as e:
        print(f"Delete failed for {object_name}: {e}")
        return False


def delete_page(org_id: str, url: str) -> bool:
    """Delete a scraped web page from MinIO at {org_id}/websites/{url_hash}.json.

    Returns True if deleted, False if the object did not exist.
    """
    s3 = get_s3_client()
    url_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()
    object_name = f"{org_id}/websites/{url_hash}.json"
    try:
        s3.delete_object(Bucket=BUCKET_NAME, Key=object_name)
        print(f"Deleted page {object_name} from storage")
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            print(f"Page object {object_name} not found for deletion")
            return False
        print(f"Delete page failed for {object_name}: {e}")
        return False
    except Exception as e:
        print(f"Delete page failed for {object_name}: {e}")
        return False


def delete_prefix(prefix: str) -> int:
    """Delete every object under a key prefix (paginated, >1000 objects safe).

    Returns the count of deleted objects.
    """
    s3 = get_s3_client()
    deleted_count = 0
    try:
        paginator = s3.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=BUCKET_NAME, Prefix=prefix):
            objects = [{"Key": obj["Key"]} for obj in page.get("Contents", [])]
            if not objects:
                continue
            s3.delete_objects(
                Bucket=BUCKET_NAME,
                Delete={"Objects": objects, "Quiet": True},
            )
            deleted_count += len(objects)
        print(f"Deleted {deleted_count} objects under prefix {prefix}")
        return deleted_count
    except Exception as e:
        print(f"Delete prefix failed for {prefix}: {e}")
        return deleted_count


def delete_org_prefix(org_id: str) -> int:
    """Delete all objects under the {org_id}/ prefix from MinIO."""
    return delete_prefix(f"{org_id}/")


def delete_dataset_prefix(org_id: str, dataset_id: str) -> int:
    """Delete all objects (documents + scraped pages) of one dataset."""
    return delete_prefix(f"{org_id}/{dataset_id}/")


def get_all_pages(org_id: str) -> list[dict]:
    """Retrieve all scraped web pages for an org from MinIO."""
    s3 = get_s3_client()
    prefix = f"{org_id}/websites/"
    pages = []
    try:
        response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix=prefix)
        if "Contents" not in response:
            return pages
        for obj in response["Contents"]:
            try:
                result = s3.get_object(Bucket=BUCKET_NAME, Key=obj["Key"])
                page_data = json.loads(result["Body"].read().decode("utf-8"))
                pages.append(page_data)
            except Exception as e:
                print(f"Failed to read {obj['Key']}: {e}")
        return pages
    except Exception as e:
        print(f"Failed to list pages: {e}")
        return pages
