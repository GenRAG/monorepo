"""
worker/main.py

Entry point for the ingestion worker.
Listens for jobs on the Redis queue, processes documents end-to-end:
  download → parse (markitdown) → chunk (semchunk) → embed (OpenRouter) → upsert (Qdrant)

Usage:
    python -m worker.main
"""

import asyncio
import json
import sys
import time
import traceback
from datetime import datetime, timezone

import redis as sync_redis

from worker.config import settings
from worker.storage import download_object, ensure_bucket_exists
from worker.parse import parse_document
from worker.chunking import chunk_text
from worker.embedding import EmbeddingService
from worker.vector_db import (
    ID_PATTERN,
    delete_stale_points,
    org_collection,
    point_id,
    upsert_chunks,
)

# --- Redis key helpers ---

QUEUE_KEY = "ingestion:jobs"


def _status_key(job_id: str) -> str:
    return f"job:{job_id}:status"


def _meta_key(job_id: str) -> str:
    return f"job:{job_id}:meta"


def _progress_key(job_id: str) -> str:
    return f"job:{job_id}:progress"


def _result_key(job_id: str) -> str:
    return f"job:{job_id}:result"


# --- Job state management ---


def _set_job_status(r: sync_redis.Redis, job_id: str, status: str):
    r.set(_status_key(job_id), status)
    print(f"  [{job_id}] status → {status}")


def _init_job_meta(
    r: sync_redis.Redis, job_id: str, filename: str, org_id: str, job_type: str
):
    r.hset(
        _meta_key(job_id),
        mapping={
            "filename": filename,
            "org_id": org_id,
            "job_type": job_type,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    )


def _mark_started(r: sync_redis.Redis, job_id: str):
    r.hset(_meta_key(job_id), "started_at", datetime.now(timezone.utc).isoformat())


def _mark_completed(
    r: sync_redis.Redis, job_id: str, processed: int, total: int
):
    now = datetime.now(timezone.utc).isoformat()
    r.hset(_meta_key(job_id), "completed_at", now)
    r.hset(_progress_key(job_id), mapping={
        "processed_chunks": str(processed),
        "total_chunks": str(total),
        "progress_pct": "100",
    })
    _set_job_status(r, job_id, "completed")


def _mark_failed(r: sync_redis.Redis, job_id: str, error: str):
    r.hset(_meta_key(job_id), "error_message", error[:2000])
    r.hset(_meta_key(job_id), "completed_at", datetime.now(timezone.utc).isoformat())
    _set_job_status(r, job_id, "failed")


def _update_progress(
    r: sync_redis.Redis, job_id: str, processed: int, total: int
):
    pct = int((processed / total) * 100) if total > 0 else 0
    r.hset(_progress_key(job_id), mapping={
        "processed_chunks": str(processed),
        "total_chunks": str(total),
        "progress_pct": str(pct),
    })


# --- Job processing ---


def process_job(r: sync_redis.Redis, payload: dict):
    """Process a single ingestion job end-to-end."""
    job_id = payload["job_id"]
    org_id = payload["org_id"]
    filename = payload["filename"]
    job_type = payload.get("job_type", "pdf")
    dataset_id = payload.get("dataset_id")

    print(f"\n=== Processing job {job_id} ===")
    print(f"  type={job_type}, org={org_id}, dataset={dataset_id}, file={filename}")

    try:
        _set_job_status(r, job_id, "processing")
        _mark_started(r, job_id)

        if not dataset_id:
            # Jobs queued before the dataset migration have no dataset_id;
            # indexing them would create chunks no retrieval can select.
            _mark_failed(r, job_id, "Missing dataset_id in job payload")
            return
        # Don't trust the queue blindly: anyone able to write to Redis could
        # otherwise point a job at another org's file or collection.
        if not ID_PATTERN.match(org_id or "") or not ID_PATTERN.match(dataset_id):
            _mark_failed(r, job_id, "Invalid org_id or dataset_id in job payload")
            return

        chunks: list[str] = []
        metadata: list[dict] = []

        if job_type == "website":
            # --- Website ingestion: crawl sitemap, scrape pages, chunk content ---
            print(f"  [{job_id}] Crawling website: {filename}")
            from worker.loader import Loader  # lazy import

            loader = Loader(
                sitemaps=[filename],
                max_pages=payload.get("max_pages", 100),
                storage_prefix=f"{org_id}/{dataset_id}",
            )
            loader.run()
            docs = loader.pages

            for doc in docs:
                doc_chunks = chunk_text(doc["content_md"])
                chunks.extend(doc_chunks)
                for chunk_index in range(len(doc_chunks)):
                    metadata.append(
                        {
                            "org_id": org_id,
                            "dataset_id": dataset_id,
                            "filename": doc["url"],
                            "title": doc.get("title", ""),
                            "chunk_index": chunk_index,
                        }
                    )
            print(
                f"  [{job_id}] Scraped {len(docs)} pages, "
                f"created {len(chunks)} chunks"
            )

        else:
            # --- Document ingestion: download, parse, chunk ---
            s3_path = payload["s3_path"]
            if not s3_path.startswith(f"{org_id}/{dataset_id}/") or ".." in s3_path:
                _mark_failed(r, job_id, "s3_path outside the job's org/dataset")
                return
            print(f"  [{job_id}] Downloading from MinIO: {s3_path}")
            file_bytes = download_object(s3_path)

            print(f"  [{job_id}] Parsing document ({filename})")
            raw_text = parse_document(file_bytes, filename)
            if not raw_text:
                _mark_failed(
                    r, job_id, "Text extraction failed: no content found"
                )
                return
            print(f"  [{job_id}] Extracted {len(raw_text)} characters")

            print(f"  [{job_id}] Chunking text")
            chunks = chunk_text(raw_text)
            if not chunks:
                _mark_failed(r, job_id, "No content extracted.")
                return
            metadata = [
                {
                    "org_id": org_id,
                    "dataset_id": dataset_id,
                    "filename": filename,
                    "chunk_index": chunk_index,
                }
                for chunk_index in range(len(chunks))
            ]
            print(f"  [{job_id}] Created {len(chunks)} chunks")

        # Keep track of total chunks before filtering
        total_chunks = len(chunks)

        # --- Step 4: Generate embeddings ---
        print(f"  [{job_id}] Generating embeddings...")
        embedder = EmbeddingService()
        all_vectors = asyncio.run(embedder.process_chunks_concurrently(chunks))

        # Filter out failed embeddings
        valid_indices = [i for i, v in enumerate(all_vectors) if v]
        valid_chunks = [chunks[i] for i in valid_indices]
        valid_vectors = [all_vectors[i] for i in valid_indices]
        valid_metadata = [metadata[i] for i in valid_indices]

        print(
            f"  [{job_id}] Generated {len(valid_vectors)} valid embeddings"
            f" ({total_chunks - len(valid_vectors)} failed)"
        )

        # --- Step 5: Upsert to Qdrant (in batches of 100) ---
        print(f"  [{job_id}] Upserting to Qdrant...")
        collection_name = org_collection(org_id)
        for i in range(0, len(valid_chunks), 100):
            batch_end = min(i + 100, len(valid_chunks))
            upsert_chunks(
                collection_name=collection_name,
                chunks=valid_chunks[i:batch_end],
                embeddings=valid_vectors[i:batch_end],
                metadata=valid_metadata[i:batch_end],
            )
            _update_progress(r, job_id, batch_end, total_chunks)

        # Point IDs are deterministic, so the upsert above overwrote the
        # unchanged chunk positions in place; now drop whatever is left of
        # the previous version (shorter re-ingest, legacy untagged copy).
        current_ids: dict[str, list[str]] = {}
        for m in valid_metadata:
            current_ids.setdefault(m["filename"], []).append(
                point_id(org_id, dataset_id, m["filename"], m["chunk_index"])
            )
        delete_stale_points(collection_name, org_id, dataset_id, current_ids)

        # --- Step 6: Mark complete ---
        result = {
            "status": "success",
            "message": f"Processed {total_chunks} chunks",
            "chunks": total_chunks,
            "chunks_embedded": len(valid_vectors),
        }
        # Store result as JSON string
        r.set(_result_key(job_id), json.dumps(result))
        _mark_completed(r, job_id, len(valid_vectors), total_chunks)
        print(f"  [{job_id}] ✅ Completed — {total_chunks} chunks processed")

    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"  [{job_id}] ❌ Failed: {error_msg}")
        traceback.print_exc()
        _mark_failed(r, job_id, error_msg)


# --- Main loop ---


def main():
    print("=" * 60)
    print("GenRAG Ingestion Worker starting...")
    # Strip credentials (redis://:password@host) before logging
    print(f"  Redis: {settings.redis_url.rsplit('@', 1)[-1]}")
    print(f"  MinIO: {settings.s3_endpoint}")
    print(f"  Qdrant: {settings.qdrant_url}")
    print("=" * 60)

    # Ensure MinIO bucket exists (worker may start before the API)
    try:
        ensure_bucket_exists()
        print("MinIO bucket ready")
    except Exception as e:
        print(f"Warning: could not verify MinIO bucket: {e}")

    # Connect to Redis — no socket_timeout so BLPOP manages its own blocking duration
    r = sync_redis.Redis.from_url(
        settings.redis_url, decode_responses=True, socket_timeout=None
    )

    # Test Redis connection
    try:
        r.ping()
        print("Redis connection OK")
    except Exception as e:
        print(f"FATAL: Cannot connect to Redis: {e}")
        sys.exit(1)

    print(f"Listening on queue '{QUEUE_KEY}' (BLPOP)...")
    print("Waiting for jobs...")

    while True:
        try:
            # Blocking pop — waits up to 30s for a job
            result = r.blpop(QUEUE_KEY, timeout=30)
            if result is None:
                continue

            _, job_json = result
            payload = json.loads(job_json)
            process_job(r, payload)

        except json.JSONDecodeError as e:
            print(f"Invalid job payload: {e}")
            continue
        except KeyboardInterrupt:
            print("\nShutting down...")
            break
        except Exception as e:
            print(f"Unexpected error in main loop: {e}")
            traceback.print_exc()
            # Brief pause before retrying to avoid tight error loops
            time.sleep(1)
            continue

    print("Worker stopped.")


if __name__ == "__main__":
    main()