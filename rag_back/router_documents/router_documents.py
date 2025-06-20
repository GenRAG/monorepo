from fastapi import APIRouter, Query, File, UploadFile, HTTPException
from fastapi.responses import Response, StreamingResponse
from router_LightRAG.router_Light_RAG import upload_document_lightRAG
from router_VectorRAG.router_Vector_RAG import upload_document_vectorRAG

router_documents = APIRouter()

@router_documents.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    await upload_document_vectorRAG(file)
    await upload_document_lightRAG(file)
    return {"message": "Data inserted"}
