from fastapi import FastAPI, UploadFile, File, Form
from contextlib import asynccontextmanager

# Import our new services
from app.services.storage import upload_file, ensure_bucket_exists
from app.services.ingestion import parse_pdf, chunk_text
from app.services.embedding import EmbeddingService
from app.services.vector_db import ensure_collection, upsert_chunks

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_bucket_exists()
    # Qwen embedding size is 4096 dimensions
    ensure_collection("genrag_knowledge_base", vector_size=4096)
    yield

app = FastAPI(lifespan=lifespan)
embedder = EmbeddingService() # Initialize once

@app.post("/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    org_id: str = Form(...)
):
    print(f"🚀 Starting ingestion for: {file.filename}")

    # 1. READ FILE (Into memory for now)
    file_bytes = await file.read()
    
    # 2. SAVE TO STORAGE (MinIO)
    # Reset cursor before upload because file.read() moved it to the end
    file.file.seek(0) 
    upload_file(file.file, f"{org_id}/{file.filename}")
    
    # 3. PARSE PDF
    raw_text = parse_pdf(file_bytes)
    if not raw_text:
        return {"error": "Could not extract text from PDF"}
        
    # 4. CHUNK TEXT
    chunks = chunk_text(raw_text)
    print(f"📄 Generated {len(chunks)} chunks")
    
    # 5. EMBED (This part is slow!)
    vectors = []
    for chunk in chunks:
        # Note: In production, we'd batch this (send 10 chunks at once)
        vec = embedder.get_embedding(chunk)
        vectors.append(vec)
        
    # 6. SAVE TO QDRANT
    count = upsert_chunks(
        collection_name="genrag_knowledge_base",
        chunks=chunks,
        embeddings=vectors,
        metadata={"org_id": org_id, "filename": file.filename}
    )
    
    return {
        "status": "success", 
        "filename": file.filename, 
        "chunks_processed": count,
        "message": "File is now searchable!"
    }