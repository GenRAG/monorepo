import logging
import os
import dotenv
import uuid
from app.logging_config import setup_logging
from .sqlite_store import SQLiteStore
from app.services.vector_db import ensure_collection, client as qdrant_client
from qdrant_client.models import PointStruct
from app.services.embedding import EmbeddingService
from app.services.ingestion import chunk_text
from tqdm.auto import tqdm
from tqdm.contrib.logging import logging_redirect_tqdm

dotenv.load_dotenv()

COLLECTION_NAME = os.getenv("COLLECTION_NAME", "health_knowledge_base")

setup_logging()
logger = logging.getLogger("genrag_api.ingestion.indexing")

def run_indexing():
    # Connect to vector database and ensure collection exists
    ensure_collection(COLLECTION_NAME, vector_size=4096)

    # Load data from SQLite
    store = SQLiteStore()
    docs = store.get_documents()

    embedding_service = EmbeddingService()

    with logging_redirect_tqdm():
        for doc in tqdm(docs, desc="Indexing documents", unit="doc"):
            logger.info(f"Generating chunks for {doc['url']}")

            # Basic Chunking strategy using main repo tools
            chunks = chunk_text(doc['content_md'], chunk_size=1000, overlap=100)
            
            # Use Qwen Embedding Service
            embeddings = embedding_service.process_chunks_in_batches(chunks)

            points = []
            for i, (chunk, vector) in enumerate(zip(chunks, embeddings)):
                if not vector:
                    continue

                points.append(
                    PointStruct(
                        id=uuid.uuid4().hex,
                        vector=vector,
                        payload={
                            "text": chunk,
                            "org_id": "nhs_dataset",  # Setting a default origin org_id for multitenancy
                            "filename": doc["url"],
                            "title": doc["title"],
                            "description": doc.get("description", ""),
                            "chunk_index": i,
                        },
                    )
                )

            qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)
            logger.info(f"Stored chunks to vector db (count={len(points)})")

        logger.info("Completed running indexing pipeline")


if __name__ == "__main__":
    run_indexing()
