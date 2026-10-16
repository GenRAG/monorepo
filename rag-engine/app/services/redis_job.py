"""
app/services/redis_job.py

Redis-backed job state management for the API.
Replaces the old in-memory JobManager with persistent storage
so the worker (a separate process/container) can read/write job state.

Redis key schema:
  ingestion:jobs          — List (queue) of pending job JSON payloads
  job:{job_id}:status     — String: "queued" | "processing" | "completed" | "failed"
  job:{job_id}:meta       — Hash: filename, org_id, dataset_id, job_type, created_at, started_at, completed_at, error_message
  job:{job_id}:progress   — Hash: processed_chunks, total_chunks, progress_pct
  job:{job_id}:result     — String (JSON): final result dict
"""

import json
from datetime import datetime, timezone
from typing import Optional

import redis.asyncio as aioredis

from app.config import settings

QUEUE_KEY = "ingestion:jobs"


def _status_key(job_id: str) -> str:
    return f"job:{job_id}:status"


def _meta_key(job_id: str) -> str:
    return f"job:{job_id}:meta"


def _progress_key(job_id: str) -> str:
    return f"job:{job_id}:progress"


def _result_key(job_id: str) -> str:
    return f"job:{job_id}:result"


class RedisJobManager:
    """Manages job state in Redis for the ingestion pipeline."""

    def __init__(self):
        self._redis: Optional[aioredis.Redis] = None

    async def _get_redis(self) -> aioredis.Redis:
        """Lazy-initialize the async Redis client."""
        if self._redis is None:
            self._redis = aioredis.from_url(
                settings.redis_url, decode_responses=True
            )
        return self._redis

    async def push_job(
        self,
        job_id: str,
        org_id: str,
        dataset_id: str,
        filename: str,
        s3_path: str,
        job_type: str = "pdf",
        max_pages: int = 100,
    ):
        """Push a job payload to the Redis queue and initialise its state keys.

        Args:
            job_id: Unique job identifier.
            org_id: Organization identifier for multi-tenancy.
            dataset_id: Dataset the document/website is ingested into.
            filename: Original filename (for display/reference).
            s3_path: MinIO object key (org_id/dataset_id/filename) where the file is stored.
            job_type: "pdf" or "website".
            max_pages: Max pages to crawl (website jobs only).
        """
        r = await self._get_redis()
        now = datetime.now(timezone.utc).isoformat()

        # Initialise metadata hash
        await r.hset(
            _meta_key(job_id),
            mapping={
                "filename": filename,
                "org_id": org_id,
                "dataset_id": dataset_id,
                "job_type": job_type,
                "created_at": now,
            },
        )

        # Set initial status
        await r.set(_status_key(job_id), "queued")

        # Push payload to the job queue
        payload: dict = {
            "job_id": job_id,
            "org_id": org_id,
            "dataset_id": dataset_id,
            "filename": filename,
            "s3_path": s3_path,
            "job_type": job_type,
        }
        if job_type == "website":
            payload["max_pages"] = max_pages

        await r.lpush(QUEUE_KEY, json.dumps(payload))

    async def get_job_status(self, job_id: str) -> Optional[dict]:
        """Retrieve full job status from Redis.

        Args:
            job_id: The job to query.

        Returns:
            A dict with status info, or None if the job doesn't exist.
        """
        r = await self._get_redis()

        status = await r.get(_status_key(job_id))
        if status is None:
            return None

        meta = await r.hgetall(_meta_key(job_id))
        progress = await r.hgetall(_progress_key(job_id))
        result_raw = await r.get(_result_key(job_id))

        response = {
            "job_id": job_id,
            "status": status,
            "filename": meta.get("filename", ""),
            "org_id": meta.get("org_id", ""),
            "dataset_id": meta.get("dataset_id", ""),
            "created_at": meta.get("created_at", ""),
        }

        if meta.get("started_at"):
            response["started_at"] = meta["started_at"]

        if meta.get("completed_at"):
            response["completed_at"] = meta["completed_at"]

        if meta.get("error_message"):
            response["error"] = meta["error_message"]

        if progress:
            response["chunks_processed"] = int(progress.get("processed_chunks", 0))
            response["total_chunks"] = int(progress.get("total_chunks", 0))
            response["progress"] = int(progress.get("progress_pct", 0))

        if status == "completed" and result_raw:
            try:
                response["result"] = json.loads(result_raw)
            except json.JSONDecodeError:
                pass

        return response

    async def get_job_result(self, job_id: str) -> Optional[dict]:
        """Retrieve the result of a completed job.

        Args:
            job_id: The job to query.

        Returns:
            The result dict, or None if not found / not completed.
        """
        r = await self._get_redis()
        status = await r.get(_status_key(job_id))
        if status != "completed":
            return None

        result_raw = await r.get(_result_key(job_id))
        if result_raw:
            try:
                return json.loads(result_raw)
            except json.JSONDecodeError:
                return None
        return None


# Global singleton for the API
redis_job_manager = RedisJobManager()