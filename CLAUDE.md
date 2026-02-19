# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is RAG-GenRag, a FastAPI-based RAG (Retrieval Augmented Generation) service that ingests PDF documents, processes them into chunks, generates embeddings, and stores them in a vector database for retrieval. The service uses a multi-tenant architecture supporting organization-based document isolation.

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

## Development Commands

### Local Development
```bash
# Install dependencies (requires uv)
uv sync

# Run services locally with Docker
docker-compose up -d

# Run FastAPI development server
uv run fastapi run app/main.py --host 0.0.0.0 --port 8000
```

### Database Setup
```bash
# Initialize Qdrant collection and indexes
python scripts/init_db.py
```

### Testing
```bash
# Test the RAG pipeline streaming endpoint
uv run python scripts/test_rag_pipeline.py
```

## Environment Configuration

Required `.env` file:
```
OPENROUTER_API_KEY=your_key_here
MINIO_USER=minioadmin
MINIO_PASSWORD=minioadmin
BUCKET_NAME=genrag-documents
QDRANT_URL=http://localhost:6333
S3_ENDPOINT=http://localhost:9000
```

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
- Synchronous processing (production would batch requests)

## Services Ports
- FastAPI: 8000
- MinIO API: 9000
- MinIO Console: 9001
- Qdrant: 6333

## API Endpoints

### Background Job System
- `POST /ingest` - Upload PDF, returns immediate job ID
- `GET /job/{job_id}/status` - Check processing progress and status
- `GET /job/{job_id}/result` - Get final results when completed

### Job Status Flow
1. Upload → `{"job_id": "uuid", "status": "accepted"}`
2. Processing → `{"status": "processing", "progress": 45, "chunks_processed": 45, "total_chunks": 100}`
3. Completed → `{"status": "completed", "result": {...}}`

## Performance Optimizations
- **✅ Batch Embedding**: Processes 10 chunks per API call (reduces API calls by ~90%)
- **✅ Background Jobs**: Non-blocking uploads with immediate response
- **✅ Progress Tracking**: Real-time status updates during processing

## Production Considerations
- Point IDs in vector DB use simple incrementing integers (should use UUIDs in production)
- Job storage is in-memory (should use Redis/database for persistence)
- No authentication/authorization beyond org_id parameter
- Batch size of 10 chunks (configurable via `EmbeddingService.batch_size`)