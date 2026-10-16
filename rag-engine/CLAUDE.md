# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is RAG-GenRag, a FastAPI-based RAG (Retrieval Augmented Generation) service that ingests documents (PDF, TXT, MD, HTML, DOCX), processes them into chunks, generates embeddings, and stores them in a vector database for retrieval. The service uses a multi-tenant architecture supporting organization-based document isolation.

## Architecture

### Two-Service Architecture
The application is split into two independent containers:

| Container | Role | Dependencies |
|-----------|------|-------------|
| `rag_api` | FastAPI web server — handles HTTP, auth, MinIO storage, Redis job queuing | `fastapi`, `boto3`, `redis`, `qdrant-client` |
| `ingestion_worker` | Background job processor — document parsing, embedding, Qdrant upsert | `markitdown[all]`, `semchunk`, `httpx`, `boto3`, `qdrant-client` |

### Service Layer (`app/services/`)
- `storage.py`: MinIO S3-compatible storage for document files
- `ingestion.py`: **Lightweight** — only file-type extension detection (`is_supported`, `detect_file_type`)
- `embedding.py`: OpenRouter API integration for Qwen embeddings (4096 dimensions) — used by `/retrieve` endpoint
- `vector_db.py`: Qdrant vector database operations with multi-tenancy support
- `redis_job.py`: Redis-backed job state management (`RedisJobManager`)

### Worker Package (`worker/`)
- `main.py`: Entry point — Redis BLPOP listener, job processing loop
- `parse.py`: Document parsing using `markitdown[all]` (unified converter)
- `chunking.py`: Text chunking using `semchunk`
- `loader.py`: Website sitemap crawler using `trafilatura`
- `embedding.py`: Standalone copy of EmbeddingService (OpenRouter, httpx)
- `vector_db.py`: Standalone copy of Qdrant upsert operations
- `storage.py`: Standalone copy of MinIO download/upload operations
- `config.py`: Worker-specific env configuration

### Infrastructure
- **Docker Compose stack**: API service + Worker + Redis + MinIO + Qdrant
- **Message Broker**: Redis (job queue + state storage)
- **Storage**: MinIO for files, Qdrant for vectors
- **AI Provider**: OpenRouter (Qwen 3 embedding model)

### Data Flow
1. `POST /ingest` → API saves file to MinIO, pushes job to Redis queue, returns `{"job_id": "...", "status": "queued"}`
2. Worker pops job from Redis → downloads file from MinIO
3. Worker parses document via `markitdown[all]` (PDF, DOCX, HTML, TXT, MD, and more)
4. Worker chunks text via `semchunk`
5. Worker generates embeddings via OpenRouter API (Qwen 3, 4096d)
6. Worker upserts vectors to Qdrant with `org_id` payload
7. Worker updates Redis job state to `completed` (or `failed`)
8. `GET /job/{job_id}/status` → API reads job state from Redis

## Development Commands

### Local Development
```bash
# Install API dependencies (requires uv)
uv sync

# Install worker dependencies
uv sync --file pyproject.worker.toml --directory .

# Run all services locally with Docker
docker-compose up -d

# Run FastAPI development server (without Docker)
uv run fastapi run app/main.py --host 0.0.0.0 --port 8000

# Run the ingestion worker (standalone, without Docker)
uv run python -m worker.main
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
REDIS_URL=redis://redis:6379/0
```

## Key Technical Details

### Multi-tenancy & Datasets
- **One Qdrant collection per org**: `org_{org_id}`, created by the worker on the org's first ingestion. The collection name is always derived server-side from `org_id` — requests can't choose it (`collection_name` is no longer accepted)
- Inside an org's collection, documents are grouped into **datasets** (`dataset_id`, required on `/ingest` and `/ingest/website`); every point carries `org_id` + `dataset_id` payload (keyword-indexed, along with `filename`)
- The `retrieve` block takes `datasetIds` to search several datasets at once (one combined ranking); omitted = all datasets of the org, `[]` = none
- `org_id` is required on `/rag/stream` and validated (`[A-Za-z0-9_-]{1,128}`, same rule as `dataset_id`)
- MinIO storage uses `{org_id}/{dataset_id}/{filename}` (docs) and `{org_id}/{dataset_id}/websites/{sha256(url)}.json` (scraped pages)
- `DELETE /documents` takes `org_id` + `dataset_id` + `filename`; `DELETE /datasets/{dataset_id}` (body `{org_id}`) removes a whole dataset; `DELETE /orgs/{org_id}` drops the org's collection and files
- Legacy data (shared `genrag_knowledge_base` collection, no datasets): `uv run python scripts/migrate_to_datasets.py --org-id ORG --dataset-id DATASET [--dry-run] [--delete-source]`
- End-to-end test against a running stack: `uv run python scripts/test_datasets.py [--keep]`

### Vector Database
- Collections: `org_{org_id}`, one per org (created automatically; `scripts/init_db.py --org-id ORG` creates one manually)
- Dimensions: 4096 (Qwen 3 embedding model)
- Distance metric: Cosine similarity
- Payload indexing on `org_id`, `dataset_id`, `filename` (created automatically by `ensure_collection`)

### Embedding Service
- Provider: OpenRouter
- Model: `qwen/qwen3-embedding-8b`
- Synchronous processing (production would batch requests)

## Services Ports
- FastAPI (rag_api): 8000
- MinIO API: 9010
- MinIO Console: 9011
- Qdrant: 6333
- Redis: 6379

## API Endpoints

### Background Job System
- `POST /ingest` - Upload PDF, returns immediate job ID
- `GET /job/{job_id}/status` - Check processing progress and status
- `GET /job/{job_id}/result` - Get final results when completed

### Retrieval and RAG Stream Endpoints Security
The `/retrieve` and `/rag/stream` endpoints now require an `org_id` parameter to enforce multi-tenancy. This `org_id` is implicitly trusted from the calling backend and is used to filter all Qdrant retrieval operations, ensuring users only access documents associated with their organization.

### Job Status Flow
1. Upload → `{"job_id": "uuid", "status": "queued"}` (file saved to MinIO, job pushed to Redis)
2. Processing → `{"status": "processing", "progress": 45, "chunks_processed": 45, "total_chunks": 100}` (worker processing)
3. Completed → `{"status": "completed", "result": {...}}` (worker finished, result in Redist)

## Performance Optimizations
- **✅ Batch Embedding**: Configurable via `EmbeddingService.batch_size`
- **✅ Microservice Isolation**: Heavy parsing runs in the `ingestion_worker` container, keeping the API responsive
- **✅ Redis-backed Persistence**: Job state survives container restarts (unlike the old in-memory JobManager)
- **✅ Non-blocking Uploads**: File saved to MinIO immediately, job queued — 200 response in milliseconds
- **✅ Progress Tracking**: Real-time status updates via Redis during worker processing
- **✅ Trafilatura Scraping**: Efficient main-content extraction (worker-side)
- **✅ Semantic Chunking**: Improved context with token-based chunking (worker-side)
- **✅ Unified Parsing**: `markitdown[all]` handles all formats with a single code path

## Future Roadmap / Planned Improvements
- **Hybrid Search**: Implementation of Sparse Vectors (Lexical Search) using FastEmbed/SPLADE.
    - *Plan*: Integrate `fastembed` for generating SPLADE sparse embeddings during the ingestion phase and update Qdrant upsert logic to populate the `sparse_text` vector.
- **Contextual Ingestion**: Future move towards Contextual Chunking (prepending chunk summaries) to improve retrieval quality.
- **✅ Web Storage**: Migrated from local SQLite storage of scraped pages to direct MinIO bucket storage for better scalability.
- **Re-embedding Strategy**: Avoid re-embedding unchanged pages when re-crawling a website.
    - *Plan*: Store content hash alongside each page in MinIO. Before embedding, compare hashes against Qdrant payload metadata — skip chunks that haven't changed instead of re-embedding the entire site.

### API Key Authentication
To secure sensitive endpoints, the RAG engine uses API Key authentication.
- **Header**: The API key must be passed in the `X-API-Key` HTTP header.
- **Protected Endpoints**:
  - `POST /ingest`
  - `POST /retrieve`
  - `POST /rag/stream`
- **Configuration**: Set the `RAG_ENGINE_API_KEY` environment variable in your `.env` file.

### Mock Mode for Testing (No API Costs)
For testing without incurring API costs, you can enable mock mode for the `/rag/stream` endpoint:
- **Environment Variable**: Set `MOCK_RAG_STREAM=true` in your `.env` file
- **Behavior**: When enabled, `/rag/stream` returns mock streaming responses without calling OpenRouter
- **Explicit Mock Endpoint**: `POST /rag/stream/mock` - No API key required, always returns mock data
- **Use Case**: Perfect for frontend/backend integration testing without API costs