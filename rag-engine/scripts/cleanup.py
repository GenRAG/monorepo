#!/usr/bin/env python3
"""Cleanup MinIO and Qdrant for a fresh start.

Connects to services from the host (not inside Docker).
MinIO is expected on localhost:9010, Qdrant on localhost:6333.

Usage:
    uv run python scripts/cleanup.py          # dry-run (shows what would be deleted)
    uv run python scripts/cleanup.py --apply   # actually deletes everything
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv

import boto3
from botocore.config import Config as BotoConfig
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from app.services.storage import BUCKET_NAME

load_dotenv()

MINIO_URL = os.getenv("CLEANUP_MINIO_URL")
MINIO_ACCESS = os.getenv("MINIO_USER")
MINIO_SECRET = os.getenv("MINIO_PASSWORD")
QDRANT_URL = os.getenv("CLEANUP_QDRANT_URL")
QDRANT_COLLECTION = "genrag_knowledge_base"


def clean_minio(dry_run: bool):
    print(f"\n=== MinIO ({MINIO_URL}, bucket: {BUCKET_NAME}) ===")
    s3 = boto3.client(
        "s3",
        endpoint_url=MINIO_URL,
        aws_access_key_id=MINIO_ACCESS,
        aws_secret_access_key=MINIO_SECRET,
        config=BotoConfig(retries={"max_attempts": 1}),
    )

    try:
        response = s3.list_objects_v2(Bucket=BUCKET_NAME)
        objects = response.get("Contents", [])
        if not objects:
            print("  Bucket is already empty.")
        else:
            keys = [{"Key": obj["Key"]} for obj in objects]
            print(f"  Found {len(keys)} object(s):")
            for k in keys:
                print(f"    - {k['Key']}")

            if dry_run:
                print("  [dry-run] Skipping deletion. Pass --apply to remove.")
            else:
                s3.delete_objects(Bucket=BUCKET_NAME, Delete={"Objects": keys})
                print(f"  Deleted {len(keys)} object(s).")

        # Also clean versioned objects (if versioning was ever enabled)
        try:
            versions = s3.list_object_versions(Bucket=BUCKET_NAME).get("Versions", [])
            if versions:
                version_keys = [{"Key": v["Key"], "VersionId": v["VersionId"]} for v in versions]
                if dry_run:
                    print(f"  Found {len(version_keys)} versioned object(s) [dry-run].")
                else:
                    s3.delete_objects(Bucket=BUCKET_NAME, Delete={"Objects": version_keys})
                    print(f"  Cleaned {len(version_keys)} versioned object(s).")
        except Exception:
            pass

    except Exception as e:
        print(f"  Error: {e}")


def clean_qdrant(dry_run: bool):
    print(f"\n=== Qdrant ({QDRANT_URL}, collection: {QDRANT_COLLECTION}) ===")
    qdrant = QdrantClient(url=QDRANT_URL)

    if not qdrant.collection_exists(QDRANT_COLLECTION):
        print("  Collection does not exist. Nothing to do.")
        return

    info = qdrant.get_collection(QDRANT_COLLECTION)
    print(f"  Collection has {info.points_count} point(s).")

    if dry_run:
        print("  [dry-run] Skipping deletion. Pass --apply to remove.")
        return

    qdrant.delete_collection(QDRANT_COLLECTION)
    print(f"  Deleted collection '{QDRANT_COLLECTION}'.")

    qdrant.create_collection(
        collection_name=QDRANT_COLLECTION,
        vectors_config=VectorParams(size=4096, distance=Distance.COSINE),
    )
    qdrant.create_payload_index(
        collection_name=QDRANT_COLLECTION,
        field_name="org_id",
        field_schema="keyword",
    )
    print(f"  Recreated collection '{QDRANT_COLLECTION}' with payload index on org_id.")


def main():
    parser = argparse.ArgumentParser(description="Clean MinIO and Qdrant for a fresh start.")
    parser.add_argument("--apply", action="store_true", help="Actually delete data (default is dry-run)")
    args = parser.parse_args()

    dry_run = not args.apply

    print(">>> CLEANUP SCRIPT <<<")
    print(f"Mode: {'DRY-RUN' if dry_run else 'APPLY'}")
    print()

    clean_minio(dry_run)
    clean_qdrant(dry_run)

    print("\nDone.")


if __name__ == "__main__":
    main()