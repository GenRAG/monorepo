from fastapi import APIRouter, Query, File, UploadFile, HTTPException
from fastapi.responses import Response, StreamingResponse
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import gpt_4o_complete, openai_embed
from lightrag.utils import EmbeddingFunc, always_get_an_event_loop
from pdfminer.high_level import extract_text
from typing import List
from utils import row_to_text
import asyncio
import inspect
import os
import pandas as pd

rag = LightRAG(
    working_dir="workspace",
    embedding_func=openai_embed,
    llm_model_func=gpt_4o_complete,
    llm_model_max_async=8
)

router_Light_RAG = APIRouter()

"""
Upload csv file to and insert data into lightRAG
"""
@router_Light_RAG.post("/upload")
def upload_document_lightRAG(file: UploadFile = File(...)):
    if file.content_type == "text/csv":
        with open("workspace/data.csv", "wb") as f:
            f.write(file.file.read())

        df = pd.read_csv("workspace/data.csv")
        if 'Horodateur' in df.columns:
            df = df.drop(['Horodateur'], axis=1)

        company_list = []
        for index, row in df.iterrows():
            company_list.append(row_to_text(row))

        rag.insert(company_list)
        os.remove("workspace/data.csv")
        file.file.close()
        return {"message": "Data inserted"}

    elif file.content_type == "application/pdf":
        pdf_miner_text = extract_text(file.file)
        rag.insert([pdf_miner_text])
        return {"message": "PDF inserted"}

    elif file.content_type == "text/plain":
        rag.insert([file.file.read().decode("utf-8")])
        return {"message": "Text inserted"}
    else:
        return {"message": "File type not supported"}

@router_Light_RAG.get("/query")
async def query(query: str):
    result = await rag.aquery(query, param=QueryParam(mode="mix"))
    return Response(content=result, media_type="text/markdown")

async def print_stream(stream):
    async for chunk in stream:
        if chunk:
            yield chunk

@router_Light_RAG.get("/stream/query")
async def stream_query(query: str):
    stream = await rag.aquery(query, param=QueryParam(mode="mix", stream=True))
    return StreamingResponse(print_stream(stream), media_type="text/event-stream")
