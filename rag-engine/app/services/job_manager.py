import uuid
from typing import Dict, Optional
from datetime import datetime
from enum import Enum


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class JobInfo:
    def __init__(self, job_id: str, filename: str, org_id: str, job_type: str = "pdf"):
        self.job_id = job_id
        self.filename = filename
        self.org_id = org_id
        self.job_type = job_type
        self.status = JobStatus.PENDING
        self.created_at = datetime.now()
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None
        self.progress = 0  # 0-100
        self.total_chunks = 0
        self.processed_chunks = 0
        self.error_message: Optional[str] = None
        self.result: Optional[Dict] = None


class JobManager:
    def __init__(self):
        self.jobs: Dict[str, JobInfo] = {}
        self.worker_running = False

    def create_job(self, filename: str, org_id: str, job_type: str = "pdf") -> str:
        """Create a new job and return ID."""
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = JobInfo(job_id, filename, org_id, job_type=job_type)
        print(f"Created job {job_id} for {filename}")
        return job_id

    def get_job(self, job_id: str) -> Optional[JobInfo]:
        """Gets job info by ID."""
        return self.jobs.get(job_id)

    def update_job_status(
        self, job_id: str, status: JobStatus, error_message: str = None
    ):
        """Updates job status."""
        if job_id in self.jobs:
            job = self.jobs[job_id]
            job.status = status
            if status == JobStatus.PROCESSING and not job.started_at:
                job.started_at = datetime.now()
            elif status in [JobStatus.COMPLETED, JobStatus.FAILED]:
                job.completed_at = datetime.now()
            if error_message:
                job.error_message = error_message

    def update_job_progress(
        self, job_id: str, processed_chunks: int, total_chunks: int
    ):
        """Updates job progress."""
        if job_id in self.jobs:
            job = self.jobs[job_id]
            job.processed_chunks = processed_chunks
            job.total_chunks = total_chunks
            job.progress = (
                int((processed_chunks / total_chunks) * 100) if total_chunks > 0 else 0
            )

    def set_job_result(self, job_id: str, result: Dict):
        """Sets job result when completed."""
        if job_id in self.jobs:
            self.jobs[job_id].result = result


# Global job manager instance
job_manager = JobManager()
