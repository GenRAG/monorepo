# RAG-GenRag

A FastAPI-based RAG (Retrieval Augmented Generation) service that ingests PDF documents, processes them into chunks, generates embeddings, and stores them in a vector database for retrieval. Features multi-tenant architecture supporting organization-based document isolation.

## Architecture

### Core Components

- **FastAPI application** (`app/main.py`): Single `/ingest` endpoint for document processing
- **Service layer** (`app/services/`): Modular services for different capabilities
  - `storage.py`: MinIO S3-compatible storage for document files
  - `ingestion.py`: PDF parsing and text chunking
  - `embedding.py`: OpenRouter API integration for Qwen embeddings (4096 dimensions)
  - `vector_db.py`: Qdrant vector database operations with multi-tenancy support
- **Configuration** (`app/config.py`): Environment-based configuration management

### Infrastructure

- **Docker Compose stack**: API service + MinIO + Qdrant
- **Storage**: MinIO for files, Qdrant for vectors
- **AI Provider**: OpenRouter (Qwen 3 embedding model)

### Data Flow

1. PDF upload via `/ingest` endpoint with `org_id` for multi-tenancy → **immediate job ID response**
2. Background processing: File storage in MinIO under `{org_id}/{filename}` structure
3. Background processing: PDF text extraction and chunking
4. Background processing: Embedding generation via OpenRouter API
5. Background processing: Vector storage in Qdrant with payload indexing on `org_id`
6. Progress tracking via `/job/{job_id}/status` endpoint

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.9+
- uv (for dependency management)

### Setup

1. Clone the repository and navigate to it:
```bash
git clone <repository-url>
cd RAG-GenRag
```

2. Create a `.env` file with your configuration:
```bash
OPENROUTER_API_KEY=your_key_here
MINIO_USER=minioadmin
MINIO_PASSWORD=minioadmin
BUCKET_NAME=genrag-documents
QDRANT_URL=http://localhost:6333
S3_ENDPOINT=http://localhost:9000
```

3. Install dependencies:
```bash
uv sync
```

4. Start the services:
```bash
docker-compose up -d
```

5. Run the FastAPI development server:
```bash
uv run fastapi run app/main.py --host 0.0.0.0 --port 8000
```

## API Endpoints

### Background Job System

#### `POST /ingest`
Upload a PDF document for processing.

**Request Body:**
- `file`: PDF file (multipart/form-data)
- `org_id`: Organization ID for multi-tenancy (form field)

**Response:**
```json
{
  "job_id": "uuid",
  "status": "accepted"
}
```

#### `GET /job/{job_id}/status`
Check the processing progress and status of a job.

**Response (Processing):**
```json
{
  "status": "processing",
  "progress": 45,
  "chunks_processed": 45,
  "total_chunks": 100
}
```

**Response (Completed):**
```json
{
  "status": "completed",
  "result": {
    "document_id": "uuid",
    "filename": "document.pdf",
    "org_id": "org123",
    "chunks_processed": 100,
    "total_chunks": 100,
    "uploaded_at": "2024-01-01T00:00:00Z",
    "processing_time_ms": 5000
  }
}
```

#### `GET /job/{job_id}/result`
Get the final results when processing is completed.

## Key Technical Details

### Multi-tenancy
- Documents are isolated by `org_id` parameter
- Qdrant payload index on `org_id` field enables efficient tenant filtering
- MinIO storage uses `{org_id}/{filename}` key structure

### Vector Database
- Collection: `genrag_knowledge_base` (created automatically)
- Dimensions: 4096 (Qwen 3 embedding model)
- Distance metric: Cosine similarity
- Payload indexing on `org_id` for multi-tenant performance

### Embedding Service
- Provider: OpenRouter
- Model: `qwen/qwen3-embedding-8b`
- Batch processing: 10 chunks per API call (configurable)

## Services Ports

| Service | Port |
|---------|------|
| FastAPI | 8000 |
| MinIO API | 9000 |
| MinIO Console | 9001 |
| Qdrant | 6333 |

## Development

### Database Setup
```bash
# Initialize Qdrant collection and indexes
python init_db.py
```

### Testing
```bash
# Test embedding service (requires OPENROUTER_API_KEY in .env)
python embed.py
```

### Clean up
```bash
# Remove all Docker containers, images, and volumes
docker system prune -a --volumes -f
```

## Performance Optimizations

- ✅ **Batch Embedding**: Processes 10 chunks per API call (reduces API calls by ~90%)
- ✅ **Background Jobs**: Non-blocking uploads with immediate response
- ✅ **Progress Tracking**: Real-time status updates during processing

## Production Considerations

- Point IDs in vector DB use simple incrementing integers (should use UUIDs in production)
- Job storage is in-memory (should use Redis/database for persistence)
- No authentication/authorization beyond org_id parameter
- Batch size of 10 chunks (configurable via `EmbeddingService.batch_size`)

## License

MIT
