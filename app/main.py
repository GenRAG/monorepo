from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from contextlib import asynccontextmanager
import asyncio

# Import our new services
from app.services.storage import ensure_bucket_exists
from app.services.vector_db import ensure_collection
from app.services.job_manager import job_manager, JobStatus
from app.services.background_worker import background_worker

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_bucket_exists()
    # Qwen embedding size is 4096 dimensions
    ensure_collection("genrag_knowledge_base", vector_size=4096)

    # Start background worker
    worker_task = asyncio.create_task(background_worker.start_worker())

    yield

    # Stop background worker
    await background_worker.stop_worker()
    worker_task.cancel()

app = FastAPI(lifespan=lifespan)

@app.post("/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    org_id: str = Form(...)
):
    """Upload a PDF for processing. Returns immediately with job ID."""
    print(f"🚀 Starting ingestion for: {file.filename}")

    # 1. READ FILE (Into memory for now)
    file_bytes = await file.read()

    # 2. CREATE JOB
    job_id = job_manager.create_job(file.filename, org_id)

    # 3. RESET FILE CURSOR AND ADD TO BACKGROUND QUEUE
    file.file.seek(0)
    await background_worker.add_job(
        job_id=job_id,
        file_bytes=file_bytes,
        file_obj=file.file,
        filename=file.filename,
        org_id=org_id
    )

    # 4. RETURN IMMEDIATELY
    return {
        "job_id": job_id,
        "status": "accepted",
        "filename": file.filename,
        "message": "File upload accepted. Processing started in background.",
        "status_url": f"/job/{job_id}/status"
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
        raise HTTPException(status_code=400, detail=f"Job is not completed. Current status: {job.status}")

    return job.result or {"error": "No result available"}