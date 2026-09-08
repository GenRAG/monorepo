import logging

from app.logging_config import setup_logging
from ..services.vector_db import ensure_collection_with_client


setup_logging()
logger = logging.getLogger("genrag_api.ingestion.connection")


def connect_to_db(
    qdrant_client, qdrant_url: str, collection_name: str = "knowledge_base"
):
    logger.info("Connecting to Qdrant at: %s", qdrant_url)
    try:
        ensure_collection_with_client(qdrant_client, collection_name)
        logger.info("Connected to Qdrant successfully")
    except Exception as e:
        logger.error("Failed to connect to Qdrant: %s", e, exc_info=True)
        logger.info("Make sure Qdrant is running at the specified URL")
        raise
