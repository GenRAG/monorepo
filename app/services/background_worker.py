import asyncio
from typing import Dict, Any
import traceback

from app.ingestion.loader import Loader
from app.ingestion.sqlite_store import SQLiteStore
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

    async def add_job(
        self, job_id: str, file_bytes: bytes, file_obj, filename: str, org_id: str
    ):
        """Add a job to the processing queue."""
        job_data = {
            "job_id": job_id,
            "file_bytes": file_bytes,
            "file_obj": file_obj,
            "filename": filename,
            "org_id": org_id,
        }
        await self.job_queue.put(job_data)
        print(f"Job {job_id} added to queue")

    async def add_website_job(self, job_id: str, url: str, org_id: str, max_pages: int):
        """Add a website ingestion job to the queue."""
        job_data = {
            "job_id": job_id,
            "url": url,
            "org_id": org_id,
            "max_pages": max_pages,
        }
        await self.job_queue.put(job_data)
        print(f"Website job {job_id} added to queue")

    async def start_workers(self, num_workers: int = 3):
        """Start multiple background worker loops."""
        if self.running:
            return

        self.running = True
        print(f"Starting {num_workers} background workers")

        # Run multiple worker tasks
        self.tasks = [asyncio.create_task(self.worker_loop()) for _ in range(num_workers)]

    async def worker_loop(self):
        """Main worker loop."""
        while self.running:
            try:
                # Get job from queue (wait up to 1 second)
                job_data = await asyncio.wait_for(self.job_queue.get(), timeout=1.0)
                await self.process_job(job_data)
                self.job_queue.task_done()
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print(f"Worker error: {e}")

    async def stop_worker(self):
        """Stop the background worker."""
        self.running = False
        print("Stopping background workers")
        for task in self.tasks:
            task.cancel()

    async def process_job(self, job_data: Dict[str, Any]):
        """Process an ingestion job end-to-end."""
        job_id = job_data["job_id"]
        org_id = job_data["org_id"]
        job_info = job_manager.get_job(job_id)
        job_type = getattr(job_info, "job_type", "pdf")

        print(f"Processing job {job_id}, type={job_type}")

        try:
            job_manager.update_job_status(job_id, JobStatus.PROCESSING)

            if job_type == "pdf":
                file_bytes = job_data["file_bytes"]
                file_obj = job_data["file_obj"]
                filename = job_data["filename"]

                # Upload to storage
                # Create a new BytesIO object from the bytes to avoid closed file issues
                import io
                upload_file(io.BytesIO(file_bytes), f"{org_id}/{filename}")
                raw_text = parse_pdf(file_bytes)
                if not raw_text:
                    job_manager.update_job_status(job_id, JobStatus.FAILED, "PDF text extraction failed")
                    return
                chunks = chunk_text(raw_text)
                metadata = [{"org_id": org_id, "filename": filename} for _ in chunks]

            elif job_type == "website":
                url = job_data["url"]
                max_pages = job_data.get("max_pages", 100)

                loader = Loader(sitemaps=[url], max_pages=max_pages, interactive=False)
                store = loader.run_loader()
                docs = store.get_documents()

                chunks = []
                metadata = []
                for doc in docs:
                    doc_chunks = chunk_text(doc["content_md"])
                    chunks.extend(doc_chunks)
                    for _ in doc_chunks:
                        metadata.append({"org_id": org_id, "filename": doc["url"], "title": doc["title"]})

            else:
                raise ValueError(f"Unknown job type: {job_type}")

            total_chunks = len(chunks)
            job_manager.update_job_progress(job_id, 0, total_chunks)

            # Generate embeddings
            print(f"Job {job_id}: Processing embeddings for {total_chunks} chunks in batches...")

            # Process in small batches and upsert to Qdrant immediately
            final_chunks = []
            final_vectors = []
            final_metadata = []

            for i in range(0, total_chunks, 100):
                batch_chunks = chunks[i : i + 100]
                batch_metadata = metadata[i : i + 100] if isinstance(metadata, list) else [metadata for _ in batch_chunks]

                print(f"Job {job_id}: Processing embedding batch {i // 100 + 1}/{(total_chunks + 99) // 100}")
                batch_vectors = await self.embedder.process_chunks_concurrently(batch_chunks)

                # Filter valid
                valid_indices = [j for j, v in enumerate(batch_vectors) if v]
                valid_chunks = [batch_chunks[j] for j in valid_indices]
                valid_vectors = [batch_vectors[j] for j in valid_indices]
                valid_metadata = [batch_metadata[j] for j in valid_indices]

                # Upsert immediately
                upsert_chunks(
                    collection_name="genrag_knowledge_base",
                    chunks=valid_chunks,
                    embeddings=valid_vectors,
                    metadata=valid_metadata,
                )

                job_manager.update_job_progress(job_id, i + len(valid_chunks), total_chunks)

            result = {
                "status": "success",
                "message": f"Processed {total_chunks} chunks",
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
