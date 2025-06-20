from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from langchain_pinecone import PineconeEmbeddings, PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
import time
from router_VectorRAG.router_Vector_RAG import router_Vector_RAG
from router_LightRAG.router_Light_RAG import router_Light_RAG
from router_customRAG.router_custom_RAG import router_custom_RAG
from router_documents.router_documents import router_documents
# from router_deployment.router_deployment import router_deployment

app = FastAPI()

origins = ["*"] #TODO : change this to the frontend URL

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) #TODO : update it in the final version

@app.get("/")
async def welcome():
    return {"Welcome to the POC-N-RAG API"}

# Include routers to enable each part to be splited into multiples dedicated routers
app.include_router(router_Vector_RAG, prefix="/VectorRAG", tags=["VectorRag"])
app.include_router(router_Light_RAG, prefix="/LightRAG", tags=["LightRag"])
app.include_router(router_custom_RAG, prefix="/CustomRAG", tags=["CustomRag"])
app.include_router(router_documents, prefix="/Documents", tags=["Documents"])

# app.include_router(router_deployment, prefix="/Deployment", tags=["Deployment"])
