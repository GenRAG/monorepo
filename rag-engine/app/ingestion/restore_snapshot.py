import logging
import os
import time

from qdrant_client import QdrantClient

from app.logging_config import setup_logging

setup_logging()
logging.getLogger("httpx").setLevel(
    logging.WARNING
)  # Hiding the useless httpx logs from QdrantClient
logger = logging.getLogger("genrag_api.ingestion.restore_snapshot")


def _wait_for_qdrant(client: QdrantClient, timeout_seconds: int) -> bool:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        try:
            client.get_collections()
            return True
        except Exception as exc:
            logger.info("Qdrant not ready yet: %s", exc)
            time.sleep(2)
    return False


def _require_env(name: str) -> str | None:
    value = os.getenv(name)
    if not value:
        logger.error("Missing required environment variable: %s", name)
        return None
    return value


def restore_snapshot() -> int:
    qdrant_url = _require_env("QDRANT_URL")
    collection_name = _require_env("COLLECTION_NAME")
    snapshot_path = _require_env("QDRANT_SNAPSHOT_PATH")
    wait_seconds_raw = _require_env("QDRANT_WAIT_SECONDS")

    if not all([qdrant_url, collection_name, snapshot_path, wait_seconds_raw]):
        return 1

    try:
        wait_seconds = int(wait_seconds_raw)
    except ValueError:
        logger.error(
            "QDRANT_WAIT_SECONDS must be an integer. Got: %s", wait_seconds_raw
        )
        return 1

    client = QdrantClient(url=qdrant_url)

    if not _wait_for_qdrant(client, wait_seconds):
        logger.error("Qdrant did not become ready in %s seconds.", wait_seconds)
        return 1

    # Optionally, we could check if the collection already exists and skip restore to avoid overwriting existing data.
    # if client.collection_exists(collection_name):
    #     logger.info(
    #         "Collection '%s' already exists. Skipping restore.", collection_name
    #     )
    #     return 0

    if not os.path.exists(snapshot_path):
        logger.error("Snapshot file not found at %s", snapshot_path)
        return 1

    location = f"file://{snapshot_path}"
    logger.info("Restoring collection '%s' from %s", collection_name, location)
    client.recover_snapshot(
        collection_name=collection_name, location=location, wait=True
    )
    logger.info("Snapshot restore complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(restore_snapshot())
