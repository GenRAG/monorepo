# Ingestion Module

The ingestion module is responsible for the complete data pipeline that crawls web content, processes it, generates embeddings, and stores it in a vector database for RAG (Retrieval-Augmented Generation) operations.

## Overview

The ingestion pipeline follows these steps:

1. **Data Collection** - Crawl content from sitemaps
2. **Storage** - Store raw content in SQLite database
3. **Processing** - Load documents and split them into chunks
4. **Embedding** - Generate embeddings using a transformer model
5. **Indexing** - Store chunks with embeddings in Qdrant vector database

## Module Structure

### Core Components

#### `loader.py`

**Purpose:** Web crawler for sitemap-based content discovery and retrieval

**Key Class:** `Loader`

- **`__init__(sitemaps)`** - Initialize with a list of sitemap URLs
- **`get_crawlable_urls(url)`** - Parse sitemap XML and extract URLs
- **`store_data(data, store)`** - Save crawled content to SQLite
- **`run_loader()`** - Execute the full crawling process

**Features:**

- Parses XML sitemaps following the sitemap protocol
- Converts HTML content to Markdown format using `markdownify`
- Handles rate limiting with configurable delays
- Stores pages with metadata (URL, title, description, last modified)
- Deduplicates against SQLite database to avoid re-crawling unchanged content

**Example:**

```python
loader = Loader(sitemaps=["https://www.example.com/sitemap.xml"])
loader.run_loader()
```

#### `sqlite_store.py`

**Purpose:** SQLite database abstraction for storing crawled pages

**Key Class:** `SQLiteStore`

- **`upsert_page(page_data)`** - Insert or update page in database
- **`get_documents()`** - Retrieve all documents for processing
- **`get_by_url(url)`** - Fetch a specific page by URL
- **`hash_text(text)`** - Generate SHA256 hash for content deduplication

**Database Schema:**

```sql
pages (
  id INTEGER PRIMARY KEY,
  url TEXT UNIQUE,
  title TEXT,
  description TEXT,
  content_md TEXT,
  content_hash TEXT,
  last_modified TEXT,
  last_crawled TEXT,
  created_at TEXT
)
```

**Features:**

- Content deduplication using SHA256 hashing
- Automatic timestamp tracking
- Efficient upsert operations
- Transaction support for data integrity

#### `late_chunking.py`

**Purpose:** Intelligent document chunking with token-aware splitting

**Key Class:** `LateChunking`

- **`get_adaptive_chunks(tokenizer, text)`** - Split text while preserving markdown structure
- **`document_to_token_embeddings(model, tokenizer, document)`** - Generate token-level embeddings
- **`get_embeddings(token_embeddings, span_annotations)`** - Compute chunk embeddings from token embeddings
- **`sentence_chunker(document)`** - Alternative sentence-based splitting

**Features:**

- Preserves markdown headers at chunk boundaries
- Token-aware chunking using transformer tokenizers
- Configurable chunk size (default: 1000 characters)
- Overlap support to maintain context between chunks
- Late chunking strategy: tokens are embedded first, then chunk embeddings are computed from token embeddings

**Parameters:**

- `chunk_size` - Size of text chunks in characters (default: 1000)
- `overlap_ratio` - Overlap percentage between chunks (default: 0.1)

**Example:**

```python
late_chunking = LateChunking()
chunks, span_annotations = late_chunking.get_adaptive_chunks(tokenizer, markdown_text)
```

#### `indexing.py`

**Purpose:** Main indexing pipeline that generates embeddings and stores chunks

**Key Function:** `run_indexing()`

**Process:**

1. Connects to Qdrant vector database
2. Loads all documents from SQLite
3. Splits documents into chunks using late chunking
4. Generates embeddings using Qwen3-Embedding-8B model
5. Upsets chunks to Qdrant with metadata

**Embedded Model:** `Qwen/Qwen3-Embedding-8B`

**Metadata Stored:**

- `url` - Source document URL
- `title` - Page title
- `description` - Page description
- `last_modified` - When the page was last modified
- `last_crawled` - When the page was last crawled

**Example:**

```python
from app.ingestion.indexing import run_indexing
run_indexing()
```

#### `connection.py`

**Purpose:** Database connection management

**Key Function:** `connect_to_db(qdrant_url, collection_name)`

- Establishes connection to Qdrant
- Ensures the collection exists and is properly initialized
- Handles connection errors gracefully

**Default Values:**

- `qdrant_url` - `http://localhost:6333`
- `collection_name` - `knowledge_base`

#### `pipeline.py`

**Purpose:** Orchestrates the complete ingestion pipeline

**Key Function:** `run_ingestion_pipeline()`

**Pipeline Steps:**

1. Run the loader to crawl and store pages
2. Run indexing to generate embeddings and store in vector DB

**Usage:**

```bash
python -m app.ingestion.pipeline
```

## Usage

### Quick Start

First, install the ingestion dependencies (includes torch for local embeddings):

```bash
uv sync --group ingestion
```

Run the entire ingestion pipeline:

```bash
uv run python -m app.ingestion.pipeline
```

### Run Individual Steps

**Crawl pages only:**

```python
from app.ingestion.loader import Loader
from app.ingestion.sqlite_store import SQLiteStore

loader = Loader(sitemaps=["https://www.nhsinform.scot/illnesses-sitemap.xml"])
loader.run_loader()
```

**Index documents only:**

```python
from app.ingestion.indexing import run_indexing
run_indexing()
```

## Data Flow

```
Sitemaps (XML)
    ↓
Loader (crawler)
    ↓
Web Pages (HTML)
    ↓
SQLite Database
    ↓
Indexing (load & process)
    ↓
Late Chunking (split into chunks)
    ↓
Embedding Generation (Qwen3-Embedding-8B)
    ↓
Qdrant Vector Database
```

## Configuration

### Environment Variables

- `QDRANT_URL` - Qdrant server URL (default: `http://localhost:6333`)
- `COLLECTION_NAME` - Vector collection name (default: `knowledge_base`)

### Chunking Parameters

Edit `indexing.py` or `late_chunking.py` to adjust:

- `chunk_size` - Size of text chunks (characters)
- `overlap_ratio` - Overlap between chunks (0.0 to 1.0)
- `batch_size` - Processing batch size

### Model Selection

Default embedding model: `Qwen/Qwen3-Embedding-8B`

To use a different model, modify the `model_id` in `indexing.py`:

```python
model_id = "your-model-here"  # e.g., "sentence-transformers/all-MiniLM-L6-v2"
```

## Dependencies

Key Python packages:

- `requests` - HTTP requests for web crawling
- `beautifulsoup4` - HTML parsing
- `lxml` - XML parsing for sitemaps
- `markdownify` - Convert HTML to Markdown
- `spacy` - NLP for sentence segmentation
- `transformers` - Loading embedding models
- `torch` - Deep learning backend
- `qdrant-client` - Vector database client

See `pyproject.toml` for complete dependency list.

## Database Files

- **SQLite:** `app/ingestion/data.db` - Stores crawled pages
- **Qdrant:** Located in `qdrant_data/` directory - Vector database

## Qdrant Connection

```bash
docker-compose up -d qdrant
```

## Running pipeline

### Entire Pipeline

```bash
python -m app.ingestion.pipeline
```

### Individual pipeline modules

**Loader:**

```bash
python -m app.ingestion.loader
```

**Indexing:**

```bash
python -m app.ingestion.indexing
```
