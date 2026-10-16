"""
Migrate an org's legacy data into its own collection and a dataset.

Legacy layout: every org shared the Qdrant collection `genrag_knowledge_base`,
chunks had no `dataset_id`, and files lived at `{org_id}/{filename}` /
`{org_id}/websites/...` in MinIO. New layout: one collection per org
(`org_{org_id}`), every chunk tagged with a `dataset_id`, files under
`{org_id}/{dataset_id}/`. This script, for one org:
  1. copies the org's points (vectors + payload) from the shared collection
     into `org_{org_id}`, tagging untagged points with `--dataset-id`,
  2. moves the org's legacy MinIO objects under `{org_id}/{dataset_id}/`,
  3. with `--delete-source`, removes the org's points from the shared collection.

Point IDs are kept; re-ingestion removes stale points by payload filter, so
the old ID scheme is harmless. Safe to re-run (copy is an idempotent upsert).

Documents with more than 100 chunks were truncated to 100 points by an old
ingestion bug (chunk IDs restarted every 100-chunk batch); the script lists
documents with exactly 100 points so they can be re-ingested.

Usage:
    uv run python scripts/migrate_to_datasets.py --org-id ORG --dataset-id DATASET [--dry-run] [--delete-source]
"""

import argparse
import os
import sys
from collections import Counter

from dotenv import load_dotenv

# Run from the repo root as a plain script: make `app` importable and load
# .env before app.services.storage reads S3 settings at import time.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

from qdrant_client.models import (  # noqa: E402
    FieldCondition,
    Filter,
    FilterSelector,
    MatchValue,
    PointStruct,
    PayloadSchemaType,
    VectorParams,
    Distance,
)

from app.schemas.rag import validate_dataset_id, validate_org_id  # noqa: E402
from app.services.storage import BUCKET_NAME, ENDPOINT, get_s3_client  # noqa: E402
from app.services.vector_db import (  # noqa: E402
    INDEXED_PAYLOAD_FIELDS,
    LEGACY_COLLECTION,
    client,
    org_collection,
)


def check_minio():
    """Fail before touching Qdrant if MinIO isn't reachable, so the org is
    never left half-migrated."""
    if not ENDPOINT:
        sys.exit("S3_ENDPOINT is not set (check .env)")
    get_s3_client().head_bucket(Bucket=BUCKET_NAME)
    print(f"MinIO OK: {ENDPOINT} bucket '{BUCKET_NAME}'")


def ensure_org_collection(collection: str, vector_size: int):
    if not client.collection_exists(collection):
        client.create_collection(
            collection_name=collection,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )
        print(f"Qdrant: created collection {collection}")
    for field in INDEXED_PAYLOAD_FIELDS:
        client.create_payload_index(collection, field, PayloadSchemaType.KEYWORD)


def migrate_qdrant(org_id: str, dataset_id: str, source: str, dry_run: bool, delete_source: bool):
    if not client.collection_exists(source):
        print(f"Qdrant: source collection {source} doesn't exist, nothing to copy")
        return
    org_filter = Filter(must=[FieldCondition(key="org_id", match=MatchValue(value=org_id))])
    total = client.count(collection_name=source, count_filter=org_filter, exact=True).count
    target = org_collection(org_id)
    print(f"Qdrant: {total} points for org '{org_id}' in {source} -> {target}")
    if not total:
        return

    vector_size = client.get_collection(source).config.params.vectors.size
    if not dry_run:
        ensure_org_collection(target, vector_size)

    per_file: Counter = Counter()
    copied = tagged = 0
    offset = None
    while True:
        points, offset = client.scroll(
            collection_name=source,
            scroll_filter=org_filter,
            with_payload=True,
            with_vectors=True,
            limit=256,
            offset=offset,
        )
        batch = []
        for point in points:
            payload = dict(point.payload or {})
            if not payload.get("dataset_id"):
                payload["dataset_id"] = dataset_id
                tagged += 1
                per_file[payload.get("filename", "")] += 1
            batch.append(PointStruct(id=point.id, vector=point.vector, payload=payload))
        if batch and not dry_run:
            client.upsert(collection_name=target, points=batch, wait=True)
        copied += len(batch)
        if offset is None:
            break
    print(f"Qdrant: {'would copy' if dry_run else 'copied'} {copied} points ({tagged} tagged with dataset_id='{dataset_id}')")

    suspicious = sorted(f for f, n in per_file.items() if n == 100)
    if suspicious:
        print(f"Re-ingest recommended — {len(suspicious)} document(s) with exactly 100 chunks (likely truncated):")
        for filename in suspicious:
            print(f"  - {filename}")

    if delete_source and not dry_run:
        copied_count = client.count(collection_name=target, count_filter=org_filter, exact=True).count
        if copied_count < total:
            sys.exit(f"Refusing to delete source: only {copied_count}/{total} points found in {target}")
        client.delete(collection_name=source, points_selector=FilterSelector(filter=org_filter), wait=True)
        print(f"Qdrant: deleted {total} points of org '{org_id}' from {source}")


def migrate_minio(org_id: str, dataset_id: str, dry_run: bool) -> int:
    s3 = get_s3_client()
    moved = 0
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=BUCKET_NAME, Prefix=f"{org_id}/"):
        for obj in page.get("Contents", []):
            key = obj["Key"]
            rest = key[len(org_id) + 1:]
            parts = rest.split("/")
            # Legacy layouts: {org}/{filename} and {org}/websites/{hash}.json.
            # Anything else is already under a dataset prefix.
            is_legacy = len(parts) == 1 or (len(parts) == 2 and parts[0] == "websites")
            if not is_legacy:
                continue
            new_key = f"{org_id}/{dataset_id}/{rest}"
            print(f"MinIO: {key} -> {new_key}")
            if not dry_run:
                s3.copy_object(
                    Bucket=BUCKET_NAME,
                    Key=new_key,
                    CopySource={"Bucket": BUCKET_NAME, "Key": key},
                )
                s3.delete_object(Bucket=BUCKET_NAME, Key=key)
            moved += 1
    print(f"MinIO: {moved} legacy objects {'to move' if dry_run else 'moved'}")
    return moved


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--org-id", required=True)
    parser.add_argument("--dataset-id", required=True, help="dataset for the org's untagged legacy data")
    parser.add_argument("--source-collection", default=LEGACY_COLLECTION)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--delete-source", action="store_true", help="remove the org's points from the shared collection after copying")
    args = parser.parse_args()

    org_id = validate_org_id(args.org_id)
    dataset_id = validate_dataset_id(args.dataset_id)
    check_minio()
    migrate_qdrant(org_id, dataset_id, args.source_collection, args.dry_run, args.delete_source)
    migrate_minio(org_id, dataset_id, args.dry_run)


if __name__ == "__main__":
    main()
