import asyncio
import os
from contextlib import asynccontextmanager

import dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from qdrant_client import QdrantClient

from app.pipelines.rag_pipeline import execute_query_from_json
from app.schemas.rag import RagRequest
from app.services.background_worker import background_worker
from app.services.embedding import EmbeddingService
from app.services.job_manager import JobStatus, job_manager
from app.services.storage import ensure_bucket_exists
from app.services.vector_db import ensure_collection

dotenv.load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")

client = QdrantClient(url=QDRANT_URL)
embedding_service = EmbeddingService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        ensure_bucket_exists()
    except Exception as e:
        print(f"Warning: Could not connect to MinIO during startup: {e}")
        print("Bucket will be created when first document is processed")

    # Qwen embedding size is 4096 dimensions
    try:
        ensure_collection("genrag_knowledge_base", vector_size=4096)
    except Exception as e:
        print(f"Warning: Could not connect to Qdrant during startup: {e}")
        print("Collection will be created when first document is processed")

    # Start background worker
    worker_task = asyncio.create_task(background_worker.start_worker())

    yield

    # Stop background worker
    await background_worker.stop_worker()
    worker_task.cancel()


app = FastAPI(lifespan=lifespan)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/ingest")
async def ingest_document(file: UploadFile = File(...), org_id: str = Form(...)):
    """Upload a PDF for processing. Returns immediately with job ID."""
    print(f"Starting ingestion for: {file.filename}")

    file_bytes = await file.read()

    job_id = job_manager.create_job(file.filename, org_id)

    file.file.seek(0)
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


@app.get("/job/{job_id}/status")
async def get_job_status(job_id: str):
    """Get the status of a processing job."""
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


@app.get("/job/{job_id}/result")
async def get_job_result(job_id: str):
    """Get the final result of a completed job."""
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != JobStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail=f"Job is not completed. Current status: {job.status}",
        )

    return job.result or {"error": "No result available"}


@app.post("/retrieve")
async def retrieve_documents(
    query: str, top_k: int = 5, index_name: str = "genrag_knowledge_base"
):
    query_vector = await embedding_service.get_embedding(query)

    search_results = client.query_points(
        collection_name=index_name,
        query=query_vector,
        limit=top_k,
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


@app.post("/rag/stream")
async def rag_stream(request: RagRequest):
    """Execute RAG query with streaming response based on JSON pipeline config."""
    json_input = request.model_dump()
    return StreamingResponse(
        execute_query_from_json(json_input), media_type="text/plain"
    )
