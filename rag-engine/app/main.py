import asyncio
import io
import os
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator, List, Optional

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile, Depends
from fastapi.responses import StreamingResponse
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel, field_validator

from app.pipelines.rag_pipeline import execute_query_from_json
from app.schemas.rag import RagRequest, validate_dataset_id, validate_org_id
from app.services.embedding import EmbeddingService
from app.services.redis_job import redis_job_manager
from app.services.storage import (
    ensure_bucket_exists,
    delete_file,
    delete_dataset_prefix,
    delete_org_prefix,
    document_key,
    upload_file,
)
from app.services.vector_db import (
    build_retrieval_filter,
    client as qdrant_client,
    delete_chunks_by_dataset,
    delete_chunks_by_filename,
    delete_org_collection,
    org_collection,
)
from app.services.ingestion import is_supported, SUPPORTED_DESCRIPTION
from app.config import settings
from app.dependencies import verify_api_key

embedding_service = EmbeddingService()


class DeleteDocumentRequest(BaseModel):
    """Request body for deleting a document from the RAG system."""
    org_id: str
    dataset_id: str
    filename: str

    _validate_org_id = field_validator("org_id")(validate_org_id)
    _validate_dataset_id = field_validator("dataset_id")(validate_dataset_id)


class DeleteDatasetRequest(BaseModel):
    """Request body for deleting a whole dataset (all its documents/pages)."""
    org_id: str

    _validate_org_id = field_validator("org_id")(validate_org_id)


def _checked_dataset_id(dataset_id: str) -> str:
    """Validates a dataset id coming from a form/path param, as a 422."""
    try:
        return validate_dataset_id(dataset_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


def _checked_org_id(org_id: str) -> str:
    """Validates an org id coming from a form/query/path param, as a 422."""
    try:
        return validate_org_id(org_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


async def mock_rag_stream(query: str) -> AsyncGenerator[str, None]:
    """Generate mock streaming response matching the new NDJSON format.
    Yields structured events: status, sources, token, citation_check, cost_summary."""
    import json

    # Simulate query block
    yield json.dumps({"type": "status", "data": "Running block: query"}) + "\n"
    await asyncio.sleep(0.05)
    yield json.dumps({"type": "status", "data": "query completed"}) + "\n"

    # Simulate retrieve block
    yield json.dumps({"type": "status", "data": "Running block: retrieve"}) + "\n"
    await asyncio.sleep(0.1)
    yield json.dumps({"type": "sources", "data": [
        {"index": 1, "title": "document_rag_overview.pdf", "score": 0.92, "text_preview": "Retrieval Augmented Generation (RAG) is a technique that combines... This approach allows LLMs to access external knowledge bases..."},
        {"index": 2, "title": "genrag_architecture.pdf", "score": 0.87, "text_preview": "GenRAG is a fully customisable RAG engine that supports multi-tenant document isolation, Qdrant vector storage, and streaming responses."},
        {"index": 3, "title": "getting_started.md", "score": 0.76, "text_preview": "To get started with RAG, you need to ingest your documents via the /ingest endpoint, then query them through the /rag/stream endpoint."},
    ]}) + "\n"
    yield json.dumps({"type": "status", "data": "retrieve completed"}) + "\n"

    # Simulate answer block
    yield json.dumps({"type": "status", "data": "Running block: answer"}) + "\n"
    yield json.dumps({"type": "status", "data": "Generating answer..."}) + "\n"

    mock_response = (
        f"Based on the retrieved documents [1][2], here is the answer to: '{query}'. "
        "This is a mock response that simulates the new NDJSON streaming format. "
        "Each event type allows the frontend to render different components appropriately."
    )
    words = mock_response.split()
    for word in words:
        yield json.dumps({"type": "token", "data": word + " "}) + "\n"
        await asyncio.sleep(0.03)
    await asyncio.sleep(0.05)

    # Simulate which of the announced sources were actually cited
    yield json.dumps({"type": "citation_check", "data": {
        "cited_indices": [1, 2],
        "invalid_indices": [],
        "cited_sources": [
            {"index": 1, "title": "document_rag_overview.pdf", "score": 0.92, "text_preview": "Retrieval Augmented Generation (RAG) is a technique that combines... This approach allows LLMs to access external knowledge bases..."},
            {"index": 2, "title": "genrag_architecture.pdf", "score": 0.87, "text_preview": "GenRAG is a fully customisable RAG engine that supports multi-tenant document isolation, Qdrant vector storage, and streaming responses."},
        ],
    }}) + "\n"

    # Simulate cost summary
    yield json.dumps({"type": "cost_summary", "data": {
        "total_cost_usd": 0.00123,
        "total_prompt_tokens": 245,
        "total_completion_tokens": 87,
        "total_tokens": 332,
        "block_costs": [
            {"block_name": "query", "cost_usd": 0.0},
            {"block_name": "retrieve", "cost_usd": 0.00005},
            {"block_name": "answer", "cost_usd": 0.00118},
        ],
    }}) + "\n"


@asynccontextmanager  # Manages application startup and shutdown
async def lifespan(app: FastAPI):
    # Default asyncio executor caps at min(32, cpu_count+4) threads — too few
    # for ~50 concurrent users each firing several blocking Qdrant/MinIO calls
    # (via asyncio.to_thread) per request. Widen it per worker process.
    from concurrent.futures import ThreadPoolExecutor

    asyncio.get_event_loop().set_default_executor(
        ThreadPoolExecutor(max_workers=64)
    )

    # Ensure MinIO bucket exists; warnings if not connecting immediately
    try:
        ensure_bucket_exists()
    except Exception as e:
        print(f"Warning: Could not connect to MinIO during startup: {e}")
        print("Bucket will be created when first document is processed")

    # Qdrant collections are per org (org_{org_id}) and created by the worker
    # on an org's first ingestion — nothing to create at startup.

    yield  # Application starts here

    # Cleanup: nothing to shut down (worker runs independently)


app = FastAPI(lifespan=lifespan)
app.title = "GenRAG API"
app.description = "GenRAG — a fully customisable RAG engine API"
app.version = "1.0.0"

# Public endpoints that don't require API key auth
PUBLIC_PATHS = {("/health", "get"), ("/rag/stream/mock", "post")}


def custom_openapi():
    """Generate OpenAPI schema with API Key security scheme.
    Protected endpoints show a 🔒 lock in Swagger; public ones don't."""
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title or "GenRAG API",
        version="1.0.0",
        description="GenRAG — a fully customisable RAG engine API",
        routes=app.routes,
    )

    # Define the API Key security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "Enter your RAG engine API key",
        }
    }

    # Apply security to all paths except public ones
    for path, methods in openapi_schema["paths"].items():
        for method in methods:
            # Skip public endpoints
            if (path, method) not in PUBLIC_PATHS:
                methods[method]["security"] = [{"ApiKeyAuth": []}]
                # Remove the duplicate X-API-Key header parameter added by
                # Depends(verify_api_key), since the security scheme handles it.
                params = methods[method].get("parameters", [])
                methods[method]["parameters"] = [
                    p for p in params
                    if not (p.get("in") == "header" and p.get("name") == "X-API-Key")
                ]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


@app.get("/health")  # Health check endpoint
async def health_check():  # Checks if the API is running
    return {"status": "ok"}


@app.post("/ingest", dependencies=[Depends(verify_api_key)])  # Endpoint for uploading documents for processing
async def ingest_document(  # Uploads document into a dataset, queues background processing
    file: UploadFile = File(...),
    org_id: str = Form(...),
    dataset_id: str = Form(...),
):
    org_id = _checked_org_id(org_id)
    dataset_id = _checked_dataset_id(dataset_id)
    # Strip any client-supplied directory components so the filename can't
    # escape the {org_id}/{dataset_id}/ prefix in MinIO.
    filename = os.path.basename((file.filename or "").replace("\\", "/"))
    print(f"Starting ingestion for: {filename} for org_id: {org_id}, dataset_id: {dataset_id}")

    # Validate file type early
    if not is_supported(filename):
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type. Supported formats: {SUPPORTED_DESCRIPTION}",
        )

    file_bytes = await file.read()

    # Save file to MinIO immediately. boto3 is synchronous, so offload it to a
    # thread — otherwise an upload blocks the event loop for every other
    # request on this worker for as long as the transfer takes.
    s3_path = document_key(org_id, dataset_id, filename)
    uploaded = await asyncio.to_thread(upload_file, io.BytesIO(file_bytes), s3_path)
    if not uploaded:
        raise HTTPException(status_code=502, detail="Failed to store file")
    print(f"File saved to MinIO: {s3_path}")

    # Create job and push to Redis queue
    job_id = str(uuid.uuid4())
    await redis_job_manager.push_job(
        job_id=job_id,
        org_id=org_id,
        dataset_id=dataset_id,
        filename=filename,
        s3_path=s3_path,
        job_type="pdf",
    )

    return {
        "job_id": job_id,
        "status": "queued",
        "filename": filename,
        "dataset_id": dataset_id,
        "message": "File upload accepted. Processing in queue.",
        "status_url": f"/job/{job_id}/status",
    }


@app.post("/ingest/website", dependencies=[Depends(verify_api_key)])  # Endpoint for website/sitemap ingestion
async def ingest_website(
    url: str = Form(...),
    org_id: str = Form(...),
    dataset_id: str = Form(...),
    max_pages: int = Form(100),
):
    org_id = _checked_org_id(org_id)
    dataset_id = _checked_dataset_id(dataset_id)
    print(f"Starting website ingestion for: {url} for org_id: {org_id}, dataset_id: {dataset_id}")

    job_id = str(uuid.uuid4())
    await redis_job_manager.push_job(
        job_id=job_id,
        org_id=org_id,
        dataset_id=dataset_id,
        filename=url,
        s3_path=url,  # For website jobs, s3_path stores the URL
        job_type="website",
        max_pages=max_pages,
    )

    return {
        "job_id": job_id,
        "status": "queued",
        "url": url,
        "dataset_id": dataset_id,
        "message": "Website ingestion accepted. Processing in queue.",
        "status_url": f"/job/{job_id}/status",
    }


@app.get("/job/{job_id}/status")  # Endpoint to get the status of an ingestion job
async def get_job_status(job_id: str):  # Retrieves the current status and progress of a job from Redis
    job = await redis_job_manager.get_job_status(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return job


@app.get("/job/{job_id}/result")  # Endpoint to get the result of a completed ingestion job
async def get_job_result(job_id: str):  # Retrieves the final result of a completed job from Redis
    result = await redis_job_manager.get_job_result(job_id)

    if result is None:
        # Check if job exists at all
        status = await redis_job_manager.get_job_status(job_id)
        if status is None:
            raise HTTPException(status_code=404, detail="Job not found")
        raise HTTPException(
            status_code=400,
            detail=f"Job is not completed. Current status: {status.get('status')}",
        )

    return result


@app.post("/retrieve", dependencies=[Depends(verify_api_key)])  # Endpoint for direct vector-based document retrieval
async def retrieve_documents(  # Fetches relevant documents from Qdrant based on query embedding
    query: str,
    org_id: str,
    top_k: int = Query(5, ge=1, le=100),
    dataset_ids: Optional[List[str]] = Query(None, alias="datasetIds"),
):
    collection_name = org_collection(_checked_org_id(org_id))
    if dataset_ids is not None:
        dataset_ids = [_checked_dataset_id(d) for d in dataset_ids]
    if not await asyncio.to_thread(qdrant_client.collection_exists, collection_name):
        return {"query": query, "dataset_ids": dataset_ids, "top_k": top_k, "results": []}
    query_vector = await embedding_service.get_embedding(query)  # Get embedding for the input query

    # qdrant-client is synchronous under the hood; running it inline would block
    # the event loop and stall every other in-flight request on this worker.
    search_results = await asyncio.to_thread(
        qdrant_client.query_points,
        collection_name=collection_name,
        query=query_vector,
        limit=top_k,
        query_filter=build_retrieval_filter(org_id, dataset_ids),
    )

    return {
        "query": query,
        "dataset_ids": dataset_ids,
        "top_k": top_k,
        "results": search_results,
    }


@app.post("/rag/stream", dependencies=[Depends(verify_api_key)])  # Endpoint for streaming RAG pipeline execution
async def rag_stream(request: RagRequest):  # Executes dynamic RAG pipeline and streams response
    # Check if mock mode is enabled via environment variable
    mock_mode = os.getenv("MOCK_RAG_STREAM", "false").lower() == "true"

    if mock_mode:
        # Return mock streaming response without API calls
        return StreamingResponse(
            mock_rag_stream(request.query), media_type="application/x-ndjson"
        )

    # Real implementation
    json_input = request.model_dump()  # Convert Pydantic model to a dictionary
    return StreamingResponse(
        execute_query_from_json(json_input), media_type="application/x-ndjson"
    )


@app.post("/rag/stream/mock")  # Explicit mock endpoint that doesn't require API key
async def rag_stream_mock(request: RagRequest):  # Mock RAG stream for testing without costs
    """Mock endpoint for testing RAG streaming without API calls.
    No API key required - perfect for frontend testing.
    Output format matches the real endpoint exactly (raw text streaming)."""
    return StreamingResponse(
        mock_rag_stream(request.query), media_type="application/x-ndjson"
    )


EXCLUDED_VARIANT_SUFFIXES = (":free", ":batch")


def _exclude_free_variants(models_response: dict) -> dict:
    """Drops ":free" and ":batch" variants from a /models-shaped response.
    Free variants have aggressive rate limits and aren't usable for
    production clients. Batch variants are OpenRouter/OpenAI's async batch
    API (results delivered up to 24h later) -- selecting one for /rag/stream
    would silently stall the streaming response, so neither should be
    offered as a selectable option in the first place."""
    data = models_response.get("data", [])
    filtered = [
        m for m in data
        if not m.get("id", "").endswith(EXCLUDED_VARIANT_SUFFIXES)
    ]
    return {**models_response, "data": filtered, "total_count": len(filtered)}


@app.get("/models", dependencies=[Depends(verify_api_key)])  # Endpoint to list available models from OpenRouter
async def list_models():
    from app.simple_openrouter_client import OpenRouterClient

    client = OpenRouterClient()
    try:
        models = await client.get_models()
        return {"models": _exclude_free_variants(models)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/rerank", dependencies=[Depends(verify_api_key)])  # Endpoint to list available reranking models from OpenRouter
async def list_rerank_models():
    from app.simple_openrouter_client import OpenRouterClient

    client = OpenRouterClient()
    try:
        models = await client.get_rerank_models()
        return {"rerank_models": _exclude_free_variants(models)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/embeddings", dependencies=[Depends(verify_api_key)])  # Endpoint to list available embedding models from OpenRouter
async def list_embedding_models():
    from app.simple_openrouter_client import OpenRouterClient

    client = OpenRouterClient()
    try:
        models = await client.get_embedding_models()
        return {"embedding_models": _exclude_free_variants(models)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models/{model_id:path}/info", dependencies=[Depends(verify_api_key)])  # Endpoint to get the SMART/FAST/CHEAP badge + quality/speed/economy scores for one model
async def get_model_info(model_id: str):
    from app.simple_openrouter_client import OpenRouterClient
    from app.services.model_metrics import compute_model_metrics

    client = OpenRouterClient()
    try:
        try:
            model, catalog = await client.find_model_with_catalog(model_id)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

        endpoints = await client.get_model_endpoints(model["links"]["details"])
        try:
            gpqa_benchmarks = await client.get_gpqa_benchmarks()
        except ValueError:
            gpqa_benchmarks = []
        try:
            usage_rankings = await client.get_usage_rankings()
        except ValueError:
            usage_rankings = []
        try:
            throughput_ranking = await client.get_throughput_ranking()
        except ValueError:
            throughput_ranking = []
        # gpqa_benchmarks/usage_rankings/throughput_ranking are all fallback
        # or scoring-only signals -- don't fail the whole request if any
        # fetch fails, just score without that signal available.
        return compute_model_metrics(
            model, endpoints, catalog, gpqa_benchmarks, usage_rankings, throughput_ranking
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await client.close()


@app.delete("/documents", dependencies=[Depends(verify_api_key)])  # Endpoint to delete a document from the RAG system
async def delete_document(request: DeleteDocumentRequest):  # Deletes a document from both MinIO and Qdrant
    org_id = request.org_id
    dataset_id = request.dataset_id
    filename = request.filename

    if not org_id or not filename:
        raise HTTPException(status_code=422, detail="org_id and filename are required")

    # Qdrant and boto3 clients are blocking — keep them off the event loop.
    deleted_chunks = await asyncio.to_thread(
        delete_chunks_by_filename, org_id, dataset_id, filename
    )
    deleted_file = await asyncio.to_thread(delete_file, org_id, dataset_id, filename)

    if deleted_chunks == 0 and not deleted_file:
        raise HTTPException(
            status_code=404,
            detail=f"No document found for org='{org_id}', dataset='{dataset_id}' with filename='{filename}'",
        )

    return {
        "status": "deleted",
        "org_id": org_id,
        "dataset_id": dataset_id,
        "filename": filename,
        "chunks_deleted": deleted_chunks,
        "file_deleted": deleted_file,
        "message": f"Document '{filename}' deleted successfully.",
    }


@app.delete("/datasets/{dataset_id}", dependencies=[Depends(verify_api_key)])  # Endpoint to delete a whole dataset
async def delete_dataset(dataset_id: str, request: DeleteDatasetRequest):  # Deletes every chunk and file of a dataset
    dataset_id = _checked_dataset_id(dataset_id)
    org_id = request.org_id
    if not org_id:
        raise HTTPException(status_code=422, detail="org_id is required")

    deleted_chunks = await asyncio.to_thread(
        delete_chunks_by_dataset, org_id, dataset_id
    )
    deleted_files = await asyncio.to_thread(delete_dataset_prefix, org_id, dataset_id)

    if deleted_chunks == 0 and deleted_files == 0:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for org='{org_id}', dataset='{dataset_id}'",
        )

    return {
        "status": "deleted",
        "org_id": org_id,
        "dataset_id": dataset_id,
        "chunks_deleted": deleted_chunks,
        "files_deleted": deleted_files,
    }


@app.delete("/orgs/{org_id}", dependencies=[Depends(verify_api_key)])  # Endpoint to delete an org entirely
async def delete_org(org_id: str):  # Drops the org's Qdrant collection and all its MinIO files
    org_id = _checked_org_id(org_id)
    deleted_chunks = await asyncio.to_thread(delete_org_collection, org_id)
    deleted_files = await asyncio.to_thread(delete_org_prefix, org_id)

    if deleted_chunks == 0 and deleted_files == 0:
        raise HTTPException(status_code=404, detail=f"No data found for org='{org_id}'")

    return {
        "status": "deleted",
        "org_id": org_id,
        "chunks_deleted": deleted_chunks,
        "files_deleted": deleted_files,
    }
