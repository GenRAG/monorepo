### RAG-GenRag Project Documentation

This document provides a comprehensive overview of the RAG-GenRag project, covering its core architecture, the end-to-end RAG query execution workflow, and detailed instructions on how to extend its functionality by adding new custom blocks.

---

### 1. Codebase Structure (Low-Level Details)

The RAG query execution engine is designed with a clear separation of concerns, utilizing Python's object-oriented features and the Pydantic library for robust data validation and configuration.

*   **`app/main.py`**:
    *   **Role**: Serves as the FastAPI application's entry point, defining HTTP endpoints.
    *   **Low-Level**: The `/rag/stream` endpoint directly leverages `StreamingResponse` from FastAPI, encapsulating an `AsyncGenerator` returned by `execute_query_from_json`. This enables efficient server-sent events, delivering chunks of the generated answer as they become available.
    ```python
    # app/main.py (snippet)
    from fastapi.responses import StreamingResponse
    from app.pipelines.rag_pipeline import execute_query_from_json
    from app.schemas.rag import RagRequest

    @app.post("/rag/stream")
    async def rag_stream(request: RagRequest):
        json_input = request.model_dump() # Pydantic model_dump() converts to dict
        return StreamingResponse(
            execute_query_from_json(json_input), media_type="text/plain"
        )
    ```

*   **`app/pipelines/rag_pipeline.py`**:
    *   **Role**: Orchestrates pipeline construction and execution.
    *   **Low-Level**:
        *   `RagPipeline` class: Inherits from `BaseBlock` (allowing pipelines to be treated as blocks themselves, though not explicitly used that way here). It maintains an ordered list (`self.blocks`) of `BaseBlock` instances.
        *   `create_pipeline_from_json`: This function is critical for dynamic pipeline assembly. It reads `block_type` strings from the `PipelineConfig` and uses `if/elif` statements to map these strings to concrete `BaseBlock` subclasses (e.g., `"retrieve"` maps to `RetrieveBlock`). Each block is then instantiated with its specific parameters.
        *   `execute_query_from_json`: Parses the incoming raw JSON, validates it against `PipelineConfig`, and calls `create_pipeline_from_json` to build the pipeline. It then invokes `pipeline.execute()` for the actual runtime.
        *   `execute` method: This is an `async generator`. It iterates through `self.blocks`. For `self.blocks[:-1]` (all but the last block), it awaits `block.run(data)`, where `data` (a `Dict[str, Any]`) is transformed and passed to the next block. The `last_block` is handled specially: `async for chunk in last_block.run(data): yield chunk`, allowing the pipeline to stream its final output.

*   **`app/schemas/rag.py`**:
    *   **Role**: Defines the data structures and enforces type validation for all RAG-related configurations and requests.
    *   **Low-Level**: Utilizes Pydantic `BaseModel` for schema definition. `Literal` types (e.g., `type: Literal["query"] = "query"`) are used extensively to create discriminated unions (`Annotated[Union[...], Field(discriminator="type")]`) for `BlockConfig`. This allows Pydantic to automatically infer the correct specific `BlockConfig` subclass based on the `"type"` field in the JSON, providing robust validation of nested configurations at runtime.

*   **`app/blocks/` (and `app/blocks/base_block.py`)**:
    *   **Role**: Contains individual, pluggable units of RAG functionality.
    *   **Low-Level**:
        *   `base_block.py`: Defines the `BaseBlock` abstract base class with an `abstractmethod async run(...)`. This contract forces all concrete blocks to implement an `async run` method, ensuring they are compatible with the pipeline's asynchronous and sequential execution model. It also establishes the `name` attribute for identification and tracing.
        *   `{block_name}_block.py`: Each concrete block (e.g., `RetrieveBlock`) implements its specific logic within its `async run` method. Intermediate blocks typically return a `Dict[str, Any]` (e.g., `RetrieveBlock` returns retrieved documents). Streaming blocks (like `AnswerGenerationBlock`) implement `async run` as an `AsyncGenerator` that `yield`s `str` chunks, aligning with FastAPI's `StreamingResponse`.

---

### 2. Core RAG Engine Workflow

The RAG engine in this project is designed for multi-tenant document processing and retrieval. It can be broken down into two main phases: **Query Execution** and **Document Ingestion**. This document focuses primarily on the **Query Execution** phase.

### 2.1. Query Execution Phase (Payload to Output Workflow - Low-Level Details)

This phase handles user queries, retrieving relevant document chunks, potentially refining the query or results, and generating a coherent answer. All interactions are streamed for real-time responsiveness.

1.  **Request Reception (`app/main.py`):**
    *   **Low-Level**: The FastAPI endpoint receives a JSON body which is automatically parsed into a `RagRequest` Pydantic object. `request.model_dump()` converts this Pydantic object back into a standard Python dictionary (`json_input`), which is then passed to `execute_query_from_json`. This ensures type safety and validation of the incoming request structure before any pipeline logic begins. The `StreamingResponse` wraps the async generator for efficient HTTP streaming.

2.  **Pipeline Construction (`app/pipelines/rag_pipeline.py`):**
    *   **Low-Level**:
        *   `execute_query_from_json` first calls `PipelineConfig.model_validate(config.get("pipeline", {}))` to parse and validate the embedded pipeline configuration from the request JSON.
        *   Then, `create_pipeline_from_json` dynamically builds a `RagPipeline` instance. It iterates through `pipeline_config.blocks`. Each `block_config.type` (e.g., `"query"`, `"retrieve"`) is matched to a concrete block class (e.g., `QueryBlock`, `RetrieveBlock`) using a series of `elif` statements.
        *   `assert isinstance(block_config, SpecificBlockConfig)` ensures that the specific configuration type (e.g., `RetrieveBlockConfig`) is correctly applied, allowing access to its unique parameters (e.g., `collection_name`, `top_k`) for instantiation. This is Python's runtime mechanism for type-safe polymorphic handling of block configurations. The instantiated blocks are added to `pipeline.blocks`.

3.  **Pipeline Execution (`app/pipelines/rag_pipeline.py` and `app/blocks/`):**
    *   **Low-Level**:
        *   `pipeline.execute({"query": query})` initiates the flow. The `data` dictionary (initially `{"query": ...}`) is passed from block to block.
        *   For intermediate blocks (`self.blocks[:-1]`), `await block.run(data)` is called. Each `run` method performs its operation (e.g., query rewriting, retrieval) and returns a *modified `data` dictionary*, which becomes the input for the *next* block. This explicit passing and transformation of a central `data` dictionary is how state is managed and communicated across pipeline stages.
        *   For the `last_block`, `async for chunk in last_block.run(data): yield chunk` is invoked. This means the final block's `run` method must be an `AsyncGenerator` that `yield`s `str` (text chunks). These chunks are then immediately `yield`ed by `pipeline.execute` itself, propagating through the FastAPI `StreamingResponse` to the client.

4.  **Streaming Output (`app/main.py`):**
    *   **Low-Level**: The `StreamingResponse` in `app/main.py` directly consumes the `AsyncGenerator` returned by `execute_query_from_json`. FastAPI handles the asynchronous iteration over this generator, sending each `yield`ed string chunk as part of a multi-part HTTP response. This allows the client to receive and display parts of the answer as they are generated, improving perceived performance.

### 2.2. Document Ingestion Phase (Low-Level Details)

*Note: This section is currently being maintained and updated by a teammate. The primary focus of this document is on the RAG Query Execution phase and extending its functionality.*

This phase is responsible for taking raw PDF documents, extracting their content, converting it into a machine-readable format (embeddings), and storing it efficiently for later retrieval.

1.  **Upload and Job Creation (`app/main.py: /ingest`)**:
    *   **What happens**: A user uploads a PDF document along with an `org_id` (organization ID) via the `/ingest` API endpoint. The system immediately returns a `job_id` (a UUID).
    *   **Why**: The `job_manager.create_job` function is called to register the new job, and `background_worker.add_job` pushes the actual processing task onto an `asyncio.Queue`. This non-blocking approach ensures the API remains highly responsive while complex tasks run concurrently in the background. The `org_id` passed here dictates all subsequent multi-tenancy filtering.

2.  **Background Processing & Storage**:
    *   **What happens**: The uploaded PDF's bytes are written to MinIO (an S3-compatible object storage) using `minio_client.put_object`. The object key is `{org_id}/{filename}`.
    *   **Why**: This file path structure directly enforces multi-tenancy at the storage layer. Subsequent operations only access objects within their designated `org_id` prefix, ensuring data isolation and preventing cross-tenant data leakage.

3.  **Content Extraction and Chunking (`app/services/ingestion.py`)**:
    *   **What happens**: `pypdf.PdfReader` is used to extract textual content from the PDF. This raw text is then processed by a `RecursiveCharacterTextSplitter` (from `langchain_text_splitters`) to create smaller, overlapping chunks.
    *   **Why**: Recursive splitting with overlap is crucial. Large language models have token limits, so chunks must be small enough to fit. Overlapping chunks ensure that semantic context isn't lost at chunk boundaries, improving the chance of retrieving complete thoughts or sentences relevant to a query. Relevant chunks, when retrieved, provide richer context, leading to more accurate answers.

4.  **Embedding Generation (`app/services/embedding.py`)**:
    *   **What happens**: `EmbeddingService.get_embedding` sends batches of text chunks to the OpenRouter API, specifically using the `qwen/qwen3-embedding-8b` model, to obtain 4096-dimensional vector embeddings.
    *   **Why**: Batching is a key performance optimization. Instead of making one API call per chunk, multiple chunks are sent in a single request, drastically reducing network overhead and API call latency for large documents.

5.  **Vector Storage (`app/services/vector_db.py`)**:
    *   **What happens**: The generated embeddings are upserted into Qdrant using `qdrant_client.upsert`. Each point includes the vector (`embedding`), the original `chunk_text`, and metadata (`payload`) containing `org_id`, `filename`, and `chunk_id`. A payload index on the `org_id` field (`client.recreate_collection` with `field_indexes`) ensures fast filtering.
    *   **Why**: The `org_id` within the payload and its corresponding index allow Qdrant to apply pre-filtering during complex vector searches (`client.search` with `query_filter`), meaning only vectors belonging to the specified `org_id` are considered for similarity comparison, guaranteeing strict multi-tenant data isolation and efficient queries.

---

### 3. Guide: Adding a New Custom Block to the RAG-GenRag Workflow

To extend the RAG pipeline with new functionality, you need to create a custom block and integrate it into the existing framework. Follow these three main steps:

**Step 1: Define the New Block's Schema (`app/schemas/rag.py`)**

1.  **Create a new Pydantic configuration class** for your block, inheriting from `BaseBlockConfig`.
    *   **Key Detail**: Set `type: Literal["your_block_type_name"] = "your_block_type_name"` to enable Pydantic's discriminated union for `BlockConfig`. This allows the system to automatically identify and validate your block's specific configuration based on the `"type"` field in the JSON request.
    *   **Parameters**: Define any custom parameters your block will need as attributes within this class (e.g., `message: str = "Hello"` for a `GreetingBlockConfig`). These will be validated when your pipeline configuration is loaded.

    _Example (`app/schemas/rag.py` adding a `GreetingBlockConfig`):_
    ```python
    from pydantic import BaseModel, Field
    from typing import Literal, Dict, Any, Union, Annotated
    from app.schemas.rag import BaseBlockConfig # Assuming BaseBlockConfig is here or imported

    # ... existing imports and classes ...

    class GreetingBlockConfig(BaseBlockConfig):
        type: Literal["greeting"] = "greeting"
        message: str = "Hello from GreetingBlock!" # Your custom parameter
    ```

**Step 2: Implement the New Block Class (`app/blocks/your_block_name_block.py`)**

1.  **Create a new Python file** for your block (e.g., `greeting_block.py`) within the `app/blocks/` directory.
2.  **Define your block class**, inheriting from `BaseBlock`.
    *   **Contract**: Your class *must* implement the `async run(self, input_data: Dict[str, Any])` method. This fulfills the `abstractmethod` contract established by `BaseBlock`.
    *   **Logic**:
        *   Access current pipeline state using the `input_data` dictionary (e.g., `input_data.get("query", "")`).
        *   Implement your block's specific logic.
        *   **For non-streaming blocks**: Modify `input_data` (or create a new dictionary) and `return updated_input`. This dictionary will be passed as input to the next block in the pipeline.
        *   **For streaming blocks**: Your `async run` method should be an `AsyncGenerator` (declared `async def run(...) -> AsyncGenerator[str, None]`) that `yield`s `str` chunks. These chunks are then streamed directly to the client.

    _Example (`app/blocks/greeting_block.py`):_
    ```python
    from typing import Dict, Any, AsyncGenerator
    from app.blocks.base_block import BaseBlock

    class GreetingBlock(BaseBlock):
        def __init__(self, name: str, message: str = "Hello"):
            super().__init__(name)
            self.message = message

        async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
            print(f"[{self.name}] Input: {input_data.get("query")}, Message: {self.message}")
            # This is a non-streaming block, it modifies input_data and returns it
            input_data["greeting_output"] = self.message + " " + input_data.get("query", "")
            return input_data
            # For a streaming block, it would be:
            # async for chunk in some_streaming_source: yield chunk
    ```

**Step 3: Update Pipeline Factory (`app/pipelines/rag_pipeline.py`)**

1.  **Add Imports**:
    *   Import your new block class: `from app.blocks.greeting_block import GreetingBlock`
    *   Import its configuration schema: `from app.schemas.rag import GreetingBlockConfig`
2.  **Add Dynamic Instantiation Logic**:
    *   Locate the `create_pipeline_from_json` function.
    *   Add an `elif` condition to check for your block's `block_type`.
    *   Inside the `elif` block:
        *   Use `assert isinstance(block_config, GreetingBlockConfig)` to confirm the specific config type.
        *   Instantiate your block and add it to the pipeline: `pipeline.add_block(GreetingBlock(name=block_name, message=block_config.message))` (passing any custom parameters from `block_config`).

    _Example (`app/pipelines/rag_pipeline.py` snippet for `create_pipeline_from_json`):_
    ```python
    # ... existing imports ...
    from app.blocks.greeting_block import GreetingBlock # Add this import
    from app.schemas.rag import GreetingBlockConfig    # Add this import

    # ... in create_pipeline_from_json function ...
        elif block_type == "greeting":
            assert isinstance(block_config, GreetingBlockConfig)
            pipeline.add_block(GreetingBlock(name=block_name, message=block_config.message))
    # ... rest of the function ...
    ```