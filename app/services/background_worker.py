import asyncio
from typing import Dict, Any
import traceback

from app.services.job_manager import job_manager, JobStatus
from app.services.storage import upload_file
from app.services.ingestion import parse_pdf, chunk_text
from app.services.embedding import EmbeddingService
from app.services.vector_db import upsert_chunks

class BackgroundWorker:
    def __init__(self):
        self.embedder = EmbeddingService()
        self.job_queue = asyncio.Queue()
        self.running = False

    async def add_job(self, job_id: str, file_bytes: bytes, file_obj, filename: str, org_id: str):
        """Add a job to the processing queue."""
        job_data = {
            "job_id": job_id,
            "file_bytes": file_bytes,
            "file_obj": file_obj,
            "filename": filename,
            "org_id": org_id
        }
        await self.job_queue.put(job_data)
        print(f"Job {job_id} added to queue")

    async def start_worker(self):
        """Start the background worker loop."""
        if self.running:
            return

        self.running = True
        print("Background worker started")

        while self.running:
            try:
                # Get job from queue (wait up to 1 second)
                job_data = await asyncio.wait_for(self.job_queue.get(), timeout=1.0)
                await self.process_job(job_data)
                self.job_queue.task_done()
            except asyncio.TimeoutError:
                # No jobs in queue, continue loop
                continue
            except Exception as e:
                print(f"Worker error: {e}")

    async def stop_worker(self):
        """Stop the background worker."""
        self.running = False
        print("Background worker stopped")

    async def process_job(self, job_data: Dict[str, Any]):
        """Process an ingestion job end-to-end."""
        job_id = job_data["job_id"]
        file_bytes = job_data["file_bytes"]
        file_obj = job_data["file_obj"]
        filename = job_data["filename"]
        org_id = job_data["org_id"]

        print(f"Processing job {job_id} for {filename}")

        try:
            job_manager.update_job_status(job_id, JobStatus.PROCESSING)

            # Upload to storage
            upload_file(file_obj, f"{org_id}/{filename}")

            # Parse PDF content
            raw_text = parse_pdf(file_bytes)
            if not raw_text:
                job_manager.update_job_status(job_id, JobStatus.FAILED, "PDF text extraction failed")
                return

            # Generate chunks
            chunks = chunk_text(raw_text)
            total_chunks = len(chunks)
            job_manager.update_job_progress(job_id, 0, total_chunks)
            print(f"Job {job_id}: Created {total_chunks} chunks")

            # Generate embeddings
            print(f"Job {job_id}: Processing embeddings for {total_chunks} chunks")
            vectors = self.embedder.process_chunks_in_batches(chunks)

            # Update progress
            job_manager.update_job_progress(job_id, total_chunks, total_chunks)

            # Insert into vector database
            count = upsert_chunks(
                collection_name="genrag_knowledge_base",
                chunks=chunks,
                embeddings=vectors,
                metadata={"org_id": org_id, "filename": filename}
            )

            # Finalize job
            result = {
                "status": "success",
                "filename": filename,
                "chunks_processed": count,
                "message": "Document processed and indexed"
            }

            job_manager.set_job_result(job_id, result)
            job_manager.update_job_status(job_id, JobStatus.COMPLETED)
            print(f"Job {job_id} completed successfully")

        except Exception as e:
            error_msg = f"Processing failed: {str(e)}"
            job_manager.update_job_status(job_id, JobStatus.FAILED, error_msg)
            print(f"Job {job_id} failed: {error_msg}")
            print(traceback.format_exc())

# Global worker instance
background_worker = BackgroundWorker()