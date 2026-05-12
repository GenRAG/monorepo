import os
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
import uuid

from app.config import settings

# Connect to Qdrant
client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key if settings.qdrant_api_key else None)


def ensure_collection(collection_name: str, vector_size: int = 4096): # Ensures Qdrant collection exists
    if not client.collection_exists(collection_name):
        print(f"Creating collection {collection_name}...")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )


def upsert_chunks(collection_name: str, chunks: list, embeddings: list, metadata: list):
    points = []
    for i, (chunk, vector, meta) in enumerate(zip(chunks, embeddings, metadata)):
        if not vector:
            continue

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
