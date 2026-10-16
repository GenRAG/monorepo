"""
worker/vector_db.py

Qdrant vector database operations for the ingestion worker.
Handles collection creation, upserting chunk vectors and clearing stale chunks.
"""

import re
import uuid

from qdrant_client import QdrantClient
from qdrant_client.models import (
    PointStruct,
    VectorParams,
    Distance,
    Filter,
    FieldCondition,
    FilterSelector,
    HasIdCondition,
    IsEmptyCondition,
    MatchValue,
    PayloadField,
    PayloadSchemaType,
)

from worker.config import settings

client = QdrantClient(
    url=settings.qdrant_url,
    api_key=settings.qdrant_api_key if settings.qdrant_api_key else None,
)

# Same rule as the API (app/schemas/rag.py): IDs end up in collection names
# and MinIO keys.
ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,128}$")


def org_collection(org_id: str) -> str:
    """Each org has its own Qdrant collection: org_{org_id}."""
    if not ID_PATTERN.match(org_id or ""):
        raise ValueError(f"Invalid org id '{org_id}'")
    return f"org_{org_id}"

# Payload fields every retrieval/deletion filters on.
INDEXED_PAYLOAD_FIELDS = ("org_id", "dataset_id", "filename")

_ensured_collections: set[str] = set()


def ensure_collection(collection_name: str, vector_size: int = 4096):
    """Create the Qdrant collection and its payload indexes if missing."""
    if collection_name in _ensured_collections:
        return
    if not client.collection_exists(collection_name):
        print(f"Creating collection {collection_name}...")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=vector_size, distance=Distance.COSINE
            ),
        )
    for field in INDEXED_PAYLOAD_FIELDS:
        client.create_payload_index(
            collection_name=collection_name,
            field_name=field,
            field_schema=PayloadSchemaType.KEYWORD,
        )
    _ensured_collections.add(collection_name)


def point_id(org_id: str, dataset_id: str, filename: str, chunk_index: int) -> str:
    """Deterministic point ID: re-ingesting a document overwrites its points.
    dataset_id is part of the key so the same filename in two datasets
    doesn't collide."""
    return uuid.uuid5(
        uuid.NAMESPACE_URL, f"{org_id}:{dataset_id}:{filename}:{chunk_index}"
    ).hex


def delete_stale_points(
    collection_name: str,
    org_id: str,
    dataset_id: str,
    current_ids_by_filename: dict[str, list[str]],
):
    """After a re-ingest has upserted its new points, delete every other point
    of those documents: the old trailing chunks of a now-shorter document, and
    legacy pre-dataset copies (no dataset_id) of the same file.

    Runs after the upsert (not before) so the document never disappears from
    retrieval mid-job, and a crash leaves the old version rather than nothing.
    """
    ensure_collection(collection_name)
    for filename, current_ids in current_ids_by_filename.items():
        same_doc = [
            FieldCondition(key="org_id", match=MatchValue(value=org_id)),
            FieldCondition(key="filename", match=MatchValue(value=filename)),
        ]
        client.delete(
            collection_name=collection_name,
            points_selector=FilterSelector(
                filter=Filter(
                    must=same_doc
                    + [FieldCondition(key="dataset_id", match=MatchValue(value=dataset_id))],
                    must_not=[HasIdCondition(has_id=current_ids)],
                )
            ),
        )
        client.delete(
            collection_name=collection_name,
            points_selector=FilterSelector(
                filter=Filter(
                    must=same_doc
                    + [IsEmptyCondition(is_empty=PayloadField(key="dataset_id"))],
                )
            ),
        )


def upsert_chunks(
    collection_name: str,
    chunks: list,
    embeddings: list,
    metadata: list,
) -> int:
    """Upsert chunk vectors and their payload into Qdrant.

    Args:
        collection_name: Qdrant collection name.
        chunks: List of text chunk strings.
        embeddings: List of embedding vectors (one per chunk).
        metadata: List of payload dicts (each must include 'org_id',
            'dataset_id', 'filename' and the chunk's position in its
            document as 'chunk_index').

    Returns:
        Number of points upserted.
    """
    points = []
    ensure_collection(collection_name)

    for chunk, vector, meta in zip(chunks, embeddings, metadata):
        if not vector:
            continue

        filename = meta.get("filename", "")
        points.append(
            PointStruct(
                id=point_id(meta["org_id"], meta["dataset_id"], filename, meta["chunk_index"]),
                vector=vector,
                payload={
                    "text": chunk,
                    "org_id": meta["org_id"],
                    "dataset_id": meta["dataset_id"],
                    "filename": filename,
                    "title": meta.get("title", ""),
                    "chunk_index": meta["chunk_index"],
                },
            )
        )

    client.upsert(collection_name=collection_name, points=points)
    return len(points)
