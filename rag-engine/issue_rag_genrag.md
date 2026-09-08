# Linear Issues - RAG-GenRag Detailed Breakdown

This file lists all project tasks, ordered chronologically by implementation, with their current completion status.

---

### Phase 1: Initial Project Setup
* **GENRAG-27.1: Bootstrap FastAPI Service** - [Done]
    - Description: Scaffold the FastApi application skeleton.
* **GENRAG-27.2: Configuration Management** - [Done]
    - Description: Implement environment-based configuration management.
* **GENRAG-27.3: Service Architecture Scaffold** - [Done]
    - Description: Establish service layer directory (`app/services/`).

### Phase 2: Core Infrastructure
* **GENRAG-28.1: MinIO Storage Integration** - [Done]
    - Description: Configure S3-compatible storage.
* **GENRAG-28.2: Qdrant Vector DB Setup** - [Done]
    - Description: Initialize vector database environment.
* **GENRAG-28.3: Embedding API Integration** - [Done]
    - Description: Implement OpenRouter API wrapper for Qwen embeddings.

### Phase 3: Background Processing & Ingestion
* **GENRAG-29.1: Background Worker System** - [Done]
    - Description: Implement robust async task processing.
* **GENRAG-29.2: Job Management Infrastructure** - [Done]
    - Description: Track job state (accepted/processing/completed).
* **GENRAG-29.3: PDF Parsing Logic** - [Done]
    - Description: Extract raw text from uploaded PDF files.
* **GENRAG-29.4: Semantic Chunking** - [Done]
    - Description: Optimize text partitioning for RAG quality.

### Phase 4: RAG Orchestration & DevOps
* **GENRAG-30.1: Docker Multi-Stage Optimization** - [Done]
    - Description: Streamline CI/CD and deployment environments.
* **GENRAG-30.2: Base Pipeline Abstractions** - [Done]
    - Description: Implement reusable `BaseBlock` architecture.
* **GENRAG-30.3: System Health Monitoring** - [Done]
    - Description: Monitor resource and service availability.

### Phase 5: Streaming & Pipeline Intelligence
* **GENRAG-31.1: Schema Definition** - [Done]
    - Description: Centralize Pydantic data models for API communication.
* **GENRAG-31.2: Answer Generation Stream** - [Done]
    - Description: Implement token-by-token streaming LLM response.
* **GENRAG-31.3: Import Path Refactoring** - [Done]
    - Description: Normalize absolute imports.

### Phase 6: Operational & Testing
* **GENRAG-32.1: Initialization Scripts** - [Done]
    - Description: Automate dev-environment setup.
* **GENRAG-32.2: Observability Decorators** - [Done]
    - Description: Inject diagnostic logging into pipeline blocks.
* **GENRAG-32.3: Pipeline Integration Testing** - [Done]
    - Description: Verify end-to-end functionality of complex pipelines.

### Phase 7: Advanced Retrieval & Intelligence
* **GENRAG-33.1: Query Rewriting** - [Done]
    - Description: Implement user-intent interpretation.
* **GENRAG-33.2: Reranking Integration** - [Done]
    - Description: Refine top-k results prioritization.

### Phase 8: Multi-Tenancy & Production Hardening
* **GENRAG-21.1: API Authentication Middleware** - [Done]
    - Description: Protect sensitive endpoints.
* **GENRAG-21.2: Qdrant Multi-tenancy Isolation** - [Done]
    - Description: Ensure strict client data segmentation.
* **GENRAG-21.3: Storage Namespacing** - [Done]
    - Description: Partition MinIO S3 buckets by tenant.

### Phase 9: New Capability (Website Ingestion)
* **GENRAG-22.1: Website Scraper Integration** - [In Progress]
    - Description: Scalable content ingestion from web URLs.
* **GENRAG-22.2: Crawler-to-Worker Integration** - [In Progress]
    - Description: Async handling of sitemap crawling and ingestion.

### Phase 10: Conversational Memory
* **GENRAG-25.1: Conversational State** - [Done]
    - Description: Persist chat dialogue across turns.
* **GENRAG-25.2: Gemini Query Context** - [Done]
    - Description: Enhance intent detection with historical context.

### Phase 11: Documentation
* **GENRAG-26.1: Zero-SQL Baseline Documentation** - [Pending]
    - Description: Document the removal of SQLite in favor of MinIO/Qdrant.
