import asyncio
import os
from contextlib import asynccontextmanager

import dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Depends
from fastapi.responses import StreamingResponse
from qdrant_client import QdrantClient

from app.pipelines.rag_pipeline import execute_query_from_json
from app.schemas.rag import RagRequest
from app.services.background_worker import background_worker
from app.services.embedding import EmbeddingService
from app.services.job_manager import JobStatus, job_manager
from app.services.storage import ensure_bucket_exists
from app.services.vector_db import ensure_collection
from app.config import settings
from app.dependencies import verify_api_key

client = QdrantClient(url=settings.qdrant_url)
embedding_service = EmbeddingService()


@asynccontextmanager # Manages application startup and shutdown
async def lifespan(app: FastAPI):
    # Ensure MinIO bucket exists; warnings if not connecting immediately
    try:
        ensure_bucket_exists()
    except Exception as e:
        print(f"Warning: Could not connect to MinIO during startup: {e}")
        print("Bucket will be created when first document is processed")

    # Ensure Qdrant collection exists for RAG knowledge base; warnings if not connecting
    try:
        ensure_collection("genrag_knowledge_base", vector_size=4096) # Qwen embedding size is 4096 dimensions
    except Exception as e:
        print(f"Warning: Could not connect to Qdrant during startup: {e}")
        print("Collection will be created when first document is processed")

    # Start background worker for ingestion job processing
    worker_task = asyncio.create_task(background_worker.start_worker())

    yield # Application starts here

    # Stop background worker gracefully on shutdown
    await background_worker.stop_worker()
    worker_task.cancel()


app = FastAPI(lifespan=lifespan)


@app.get("/health") # Health check endpoint
async def health_check(): # Checks if the API is running
    return {"status": "ok"}


@app.post("/ingest", dependencies=[Depends(verify_api_key)]) # Endpoint for uploading PDFs for processing
async def ingest_document(file: UploadFile = File(...), org_id: str = Form(...)): # Uploads PDF, starts background processing
    print(f"Starting ingestion for: {file.filename} for org_id: {org_id}")

    file_bytes = await file.read()

    job_id = job_manager.create_job(file.filename, org_id, job_type="pdf")

    file.file.seek(0) # Reset file pointer for background worker
    await background_worker.add_job(
        job_id=job_id,
        file_bytes=file_bytes,
        file_obj=file.file,
        filename=file.filename,
        org_id=org_id,
    )

    return {
        "job_id": job_id,
        "status": "accepted",
        "filename": file.filename,
        "message": "File upload accepted. Processing started in background.",
        "status_url": f"/job/{job_id}/status",
    }


@app.post("/ingest/website", dependencies=[Depends(verify_api_key)]) # Endpoint for website/sitemap ingestion
async def ingest_website(url: str = Form(...), org_id: str = Form(...), max_pages: int = Form(100)):
    print(f"Starting website ingestion for: {url} for org_id: {org_id}")

    job_id = job_manager.create_job(url, org_id, job_type="website")

    await background_worker.add_website_job(
        job_id=job_id,
        url=url,
        org_id=org_id,
        max_pages=max_pages,
    )

    return {
        "job_id": job_id,
        "status": "accepted",
        "url": url,
        "message": "Website ingestion accepted. Processing started in background.",
        "status_url": f"/job/{job_id}/status",
    }


@app.get("/job/{job_id}/status") # Endpoint to get the status of an ingestion job
async def get_job_status(job_id: str): # Retrieves the current status and progress of a job
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    response = {
        "job_id": job.job_id,
        "filename": job.filename,
        "org_id": job.org_id,
        "status": job.status,
        "progress": job.progress,
        "created_at": job.created_at.isoformat(),
    }

    if job.started_at:
        response["started_at"] = job.started_at.isoformat()

    if job.completed_at:
        response["completed_at"] = job.completed_at.isoformat()

    if job.total_chunks > 0:
        response["chunks_processed"] = job.processed_chunks
        response["total_chunks"] = job.total_chunks

    if job.status == JobStatus.FAILED and job.error_message:
        response["error"] = job.error_message

    if job.status == JobStatus.COMPLETED and job.result:
        response["result"] = job.result

    return response


@app.get("/job/{job_id}/result") # Endpoint to get the result of a completed ingestion job
async def get_job_result(job_id: str): # Retrieves the final result of a completed job
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != JobStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail=f"Job is not completed. Current status: {job.status}",
        )

    return job.result or {"error": "No result available"}


@app.post("/retrieve", dependencies=[Depends(verify_api_key)]) # Endpoint for direct vector-based document retrieval
async def retrieve_documents( # Fetches relevant documents from Qdrant based on query embedding
    query: str, org_id: str, top_k: int = 5, index_name: str = "genrag_knowledge_base"
):
    query_vector = await embedding_service.get_embedding(query) # Get embedding for the input query

    search_results = client.query_points(
        collection_name=index_name,
        query=query_vector,
        limit=top_k,
        query_filter={
            "must": [
                {"key": "org_id", "match": {"value": org_id}}
            ]
        },
    )

    for point in search_results.points:
        print("Retrieved point ID:", point.id)
        print("Payload:", point.payload)
        print("Vector:", point.vector)

    return {
        "query": query,
        "index_name": index_name,
        "top_k": top_k,
        "results": search_results,
    }


@app.post("/rag/stream", dependencies=[Depends(verify_api_key)]) # Endpoint for streaming RAG pipeline execution
async def rag_stream(request: RagRequest): # Executes dynamic RAG pipeline and streams response
    json_input = request.model_dump() # Convert Pydantic model to a dictionary
    return StreamingResponse(
        execute_query_from_json(json_input), media_type="text/plain"
    )
