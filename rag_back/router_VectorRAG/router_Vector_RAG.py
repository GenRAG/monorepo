from constants import PINECONE_INDEX_NAME, PINECONE_NAMESPACE, PINECONE_API_KEY, PINECONE_CLOUD, PINECONE_REGION, EMBEDDINGS_MODEL_NAME, PINECONE_TOP_K, COHERE_RERANKER_TOP_K, COHERE_API_KEY
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import Response, StreamingResponse
from langchain_experimental.text_splitter import SemanticChunker
from langchain_pinecone import PineconeEmbeddings, PineconeVectorStore
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from pdfminer.high_level import extract_text
from pinecone import Pinecone, ServerlessSpec
from utils import row_to_text
import cohere
import os
import pandas as pd
import uuid
from fastapi import HTTPException

text_splitter = SemanticChunker(OpenAIEmbeddings())

router_Vector_RAG = APIRouter()

def init_pinecone():
    if PINECONE_INDEX_NAME not in pc.list_indexes().names():
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=embeddings.dimension,
            metric="cosine",
            spec=spec
        )

pc = Pinecone(api_key=PINECONE_API_KEY)
spec = ServerlessSpec(cloud=PINECONE_CLOUD, region=PINECONE_REGION)
co = cohere.Client(COHERE_API_KEY)

embeddings = PineconeEmbeddings(
    model=EMBEDDINGS_MODEL_NAME,
    pinecone_api_key=PINECONE_API_KEY
)
if PINECONE_INDEX_NAME not in pc.list_indexes().names():
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=embeddings.dimension,
        metric="cosine",
        spec=spec
    )

custom_template = """Tu es un assistant chargé de répondre au questions des utilisateurs en te basant sur le contexte que tu as reçu. Si tu ne connais pas la réponse, tu peux dire que tu ne sais pas. Essaye toujours de fournir la meilleure réponse possible. Toujours vérifier que le contexte est pertinent à la question.
Question: {question}
Context: {context}
Answer:"""
# custom_template = """Tu es un assistant qui répond aux questions sur les entreprises qui integrent de l'IA Générative. Consulte les informations suivantes "What's the name of your company?", "Website: ", "Where are you based? ", "Describe your activity related to GenAI: " pour répondre à la question. Dans le contexte de la question, tu auras les entreprises qui correspondent le mieux à la question, il peut y avoir des erreurs de selections d'enreprises, donc si l'une des entreprises ne correspond pas à la question, tu pourras l'ignorer de cette liste. Si tu ne connais pas la réponse, tu peux dire que tu ne sais pas. Essaye toujours de fournir la meilleure réponse possible. Toujours vérifier que le contexte est pertinent à la question.
# Question: {question}
# Context: {context}
# Answer:"""

custom_prompt = PromptTemplate.from_template(custom_template)

llm = ChatOpenAI(
    openai_api_key=os.environ.get('OPENAI_API_KEY'),
    model_name='gpt-4o-mini',
    temperature=0.5,
)

@router_Vector_RAG.post("/uploadfile/")
async def upload_document_vectorRAG(file: UploadFile = File(...)):
    bulk_data = []
    if file.content_type == "text/csv":
        df = pd.read_csv(file.file)
        if 'Horodateur' in df.columns:
            df = df.drop(['Horodateur'], axis=1)

        for index, row in df.iterrows():
            bulk_data.append(row_to_text(row))

    elif file.content_type == "application/pdf":
        pdf_miner_text = extract_text(file.file)
        docs = text_splitter.create_documents([pdf_miner_text])
        print(docs[0].page_content)

        for doc in docs:
            bulk_data.append(doc.page_content)
        # bulk_data.append(pdf_miner_text)

    elif file.content_type == "text/plain":
        bulk_data.append(file.file.read().decode("utf-8"))

    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    vectors_to_upsert = []

    for data in bulk_data:
        embedding = embeddings.embed_query(data)

        vector = {
            "id": str(uuid.uuid4()),
            "values": embedding,
            "metadata": {
                "text": data
            }
        }
        vectors_to_upsert.append(vector)

    pc.Index(PINECONE_INDEX_NAME).upsert(vectors_to_upsert, namespace="default")
    return {"message": "Data inserted"}

def get_documents(query : str, top_k=PINECONE_TOP_K):
    query_embedding = pc.inference.embed(
        model="multilingual-e5-large",
        inputs=[query],
        parameters={
            "input_type": "query"
        }
    )

    results = pc.Index(PINECONE_INDEX_NAME).query(
        namespace=PINECONE_NAMESPACE,
        vector=query_embedding[0].values,
        top_k=top_k,
        include_metadata=True
    )

    documents = [
        {
            "text": x["metadata"]["text"],
        }
        for x in results.matches
    ]

    return documents

def documents_list_to_RAG_context(documents):
    return [
        {
            "text": doc["text"]
        }
        for doc in documents
    ]

async def print_stream(stream):
    async for chunk in stream:
        if chunk:
            yield chunk

import asyncio

@router_Vector_RAG.post("/query/")
async def query(query: str):
    documents = get_documents(query, top_k=PINECONE_TOP_K)

    rerank_documents_row = co.rerank(query=query, documents=documents, model="rerank-v3.5")
    reranked_ids = [rerank_documents_row.results[i].index for i in range(COHERE_RERANKER_TOP_K)]

    rerank_documents = []
    for id in reranked_ids:
        rerank_documents.append(documents[id])

    messages = custom_prompt.invoke({"question": query, "context": documents_list_to_RAG_context(rerank_documents)})


    async def generate():
        for chunk in llm.stream(messages):
            if chunk.content:
                asyncio.sleep(0.001)
                yield chunk.content

    return StreamingResponse(generate(), media_type="text/plain")