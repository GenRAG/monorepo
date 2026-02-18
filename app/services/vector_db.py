import os
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance

# Connect to Qdrant container
QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant:6333")
client = QdrantClient(url=QDRANT_URL)

def ensure_collection(collection_name: str, vector_size: int = 4096):
    """Ensure the collection exists in Qdrant."""
    if not client.collection_exists(collection_name):
        print(f"Creating collection {collection_name}...")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
        )

def upsert_chunks(collection_name: str, chunks: list, embeddings: list, metadata: dict):
    """Saves vectors to Qdrant."""
    points = []
    for i, (chunk, vector) in enumerate(zip(chunks, embeddings)):
        if not vector: continue
        
        points.append(PointStruct(
            id=i,  # Ideally use uuid.uuid4().hex in production
            vector=vector,
            payload={
                "text": chunk,
                "org_id": metadata["org_id"],
                "filename": metadata["filename"],
                "chunk_index": i
            }
        ))
    
    client.upsert(
        collection_name=collection_name,
        points=points
    )
    return len(points)

