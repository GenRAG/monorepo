import logging
import os
import dotenv
import torch
from transformers import AutoModel, AutoTokenizer
from app.logging_config import setup_logging
from .sqlite_store import SQLiteStore
from .chunking import Chunking
from ..services.vector_db import get_qdrant_client, upsert_chunks_with_client
from .connection import connect_to_db
from tqdm.auto import tqdm
from tqdm.contrib.logging import logging_redirect_tqdm

dotenv.load_dotenv()

QDRANT_URL = os.getenv("INGESTION_QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "knowledge_base")

setup_logging()
logger = logging.getLogger("genrag_api.ingestion.indexing")


def run_indexing(model_id: str = "jinaai/jina-embeddings-v2-base-en"):
    # Connect to vector database and ensure collection exists
    qdrant_client = get_qdrant_client(QDRANT_URL)
    connect_to_db(qdrant_client, QDRANT_URL, COLLECTION_NAME)

    # Load data from SQLite
    store = SQLiteStore()
    docs = store.get_documents()

    if torch.cuda.is_available():
        device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        device = torch.device("mps")
    else:
        device = torch.device("cpu")

    model = AutoModel.from_pretrained(model_id, trust_remote_code=True).to(device)
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    model.eval()

    chunking = Chunking(model, tokenizer, device)

    with logging_redirect_tqdm():
        for doc in tqdm(docs, desc="Indexing documents", unit="doc"):
            logger.info("Generating chunks using late chunking")

            chunks, embeddings = chunking.late_chunking(doc['content_md'])

            count = upsert_chunks_with_client(
                qdrant_client=qdrant_client,
                collection_name=COLLECTION_NAME,
                chunks=chunks,
                embeddings=embeddings,
                metadata={
                    "url": doc["url"],
                    "title": doc["title"],
                    "description": doc["description"],
                    "last_modified": doc["last_modified"],
                    "last_crawled": doc["last_crawled"],
                },
            )
            logger.info("Stored chunks to vector db (count=%s)", count)

        logger.info("Completed running indexing pipeline")


if __name__ == "__main__":
    run_indexing()
