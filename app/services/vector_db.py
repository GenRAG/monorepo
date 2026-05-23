from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance, SparseVector, SparseVectorParams, SparseIndexConfig
import uuid
from app.config import settings

client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key if settings.qdrant_api_key else None)

def ensure_collection(collection_name: str, vector_size: int = 4096):
    if not client.collection_exists(collection_name):
        print(f"Creating collection {collection_name}...")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )

def upsert_chunks(collection_name: str, chunks: list, embeddings: list, metadata: list):
    points = []
    # Ensure collection exists before upserting
    ensure_collection(collection_name)

    for i, (chunk, vector, meta) in enumerate(zip(chunks, embeddings, metadata)):
        if not vector:
            continue

        # Add SparseVector for BM25/full-text search
        # Note: In a real hybrid setup, you'd generate these from a BM25 indexer
        # For now, we enable the index by structure

        points.append(
            PointStruct(
                id=uuid.uuid4().hex,
                vector=vector,
                payload={
                    "text": chunk,
                    "org_id": meta["org_id"],
                    "filename": meta.get("filename", ""),
                    "title": meta.get("title", ""),
                    "chunk_index": i,
                },
            )
        )

    client.upsert(collection_name=collection_name, points=points)
    return len(points)
