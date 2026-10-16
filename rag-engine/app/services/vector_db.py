import uuid
from typing import Optional, Sequence
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance, Filter, FieldCondition, MatchValue, MatchAny, FilterSelector, PayloadSchemaType
from app.config import settings
from app.schemas.rag import validate_org_id

client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key if settings.qdrant_api_key else None)

# Pre-"collection per org" shared collection — only read by the migration script.
LEGACY_COLLECTION = "genrag_knowledge_base"

# Payload fields every retrieval/deletion filters on — keyword-indexed so
# dataset filtering stays fast. org_id is still stored and filtered on inside
# each org's collection as defense in depth.
INDEXED_PAYLOAD_FIELDS = ("org_id", "dataset_id", "filename")


def org_collection(org_id: str) -> str:
    """Each org has its own Qdrant collection. The name is always derived from
    a validated org_id server-side — never taken from the request."""
    return f"org_{validate_org_id(org_id)}"


def ensure_collection(collection_name: str, vector_size: int = 4096):
    if not client.collection_exists(collection_name):
        print(f"Creating collection {collection_name}...")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )
    # Idempotent: Qdrant is a no-op when the index already exists.
    for field in INDEXED_PAYLOAD_FIELDS:
        client.create_payload_index(
            collection_name=collection_name,
            field_name=field,
            field_schema=PayloadSchemaType.KEYWORD,
        )


def build_retrieval_filter(org_id: str, dataset_ids: Optional[Sequence[str]] = None) -> Filter:
    """Tenant filter for retrieval: always scoped to org_id, and to the given
    datasets when provided (None = every dataset of the org)."""
    if not org_id:
        raise ValueError("org_id is required for retrieval")
    must = [FieldCondition(key="org_id", match=MatchValue(value=org_id))]
    if dataset_ids is not None:
        must.append(FieldCondition(key="dataset_id", match=MatchAny(any=list(dataset_ids))))
    return Filter(must=must)

def _build_filename_filter(org_id: str, dataset_id: str, filename: str) -> Filter:
    """Build a Qdrant Filter that matches points for one document of a dataset."""
    return Filter(
        must=[
            FieldCondition(key="org_id", match=MatchValue(value=org_id)),
            FieldCondition(key="dataset_id", match=MatchValue(value=dataset_id)),
            FieldCondition(key="filename", match=MatchValue(value=filename)),
        ]
    )


def _build_dataset_filter(org_id: str, dataset_id: str) -> Filter:
    """Build a Qdrant Filter that matches all points of one dataset."""
    return Filter(
        must=[
            FieldCondition(key="org_id", match=MatchValue(value=org_id)),
            FieldCondition(key="dataset_id", match=MatchValue(value=dataset_id)),
        ]
    )


def _count_points(collection_name: str, filter_obj: Filter) -> int:
    """Count points matching a filter. Returns 0 on error."""
    try:
        result = client.count(
            collection_name=collection_name,
            count_filter=filter_obj,
            exact=True,
        )
        return result.count
    except Exception as e:
        print(f"Failed to count points: {e}")
        return 0


def _delete_by_filter(collection_name: str, filter_obj: Filter, label: str) -> int:
    """Delete all points matching filter_obj. Returns the number deleted."""
    if not client.collection_exists(collection_name):
        print(f"No collection {collection_name} for {label}")
        return 0
    count_before = _count_points(collection_name, filter_obj)
    if count_before == 0:
        print(f"No points found for {label}")
        return 0
    try:
        client.delete(
            collection_name=collection_name,
            points_selector=FilterSelector(filter=filter_obj),
        )
        print(f"Deleted {count_before} chunks for {label}")
        return count_before
    except Exception as e:
        print(f"Failed to delete chunks for {label}: {e}")
        return 0


def delete_chunks_by_dataset(org_id: str, dataset_id: str) -> int:
    """Delete all Qdrant points of a dataset (org_id + dataset_id)."""
    return _delete_by_filter(
        org_collection(org_id),
        _build_dataset_filter(org_id, dataset_id),
        f"org='{org_id}', dataset='{dataset_id}'",
    )


def delete_chunks_by_filename(org_id: str, dataset_id: str, filename: str) -> int:
    """Delete all Qdrant points for a given document (org_id + dataset_id + filename).

    Returns the number of actually deleted points.
    """
    return _delete_by_filter(
        org_collection(org_id),
        _build_filename_filter(org_id, dataset_id, filename),
        f"org='{org_id}', dataset='{dataset_id}', filename='{filename}'",
    )


def delete_org_collection(org_id: str) -> int:
    """Drop an org's whole collection (every dataset). Returns the number of
    points it held, 0 if it didn't exist."""
    collection_name = org_collection(org_id)
    if not client.collection_exists(collection_name):
        return 0
    count = client.count(collection_name=collection_name, exact=True).count
    client.delete_collection(collection_name)
    print(f"Dropped collection {collection_name} ({count} points)")
    return count
