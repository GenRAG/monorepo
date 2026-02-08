from blocks.base_block import BaseBlock
from qdrant_client import QdrantClient
from qdrant_client.http import models
import json
import numpy as np
from typing import List, Optional
import dotenv
import requests
import os

dotenv.load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def get_embedding(text: str):
    """Sends text to OpenRouter and returns a vector list."""
    print("Getting embedding for text:", text)
    # if not text or not text.strip():
    #     return []

    response = requests.post(
        url="https://openrouter.ai/api/v1/embeddings",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "genrag.com",
            "X-Title": "GenRAG App"
        },
        data=json.dumps({
            "model": "qwen/qwen3-embedding-8b",
            "input": text
        })
    )
    
    if response.status_code == 200:
        data = response.json()
        # OpenRouter returns: {"data": [{"embedding": [...]}]}
        return data["data"][0]["embedding"]
    else:
        print(f"Embedding Error {response.status_code}: {response.text}")
        return [] 

class RetrieveBlock(BaseBlock):
    top_k: int = 5
    index_name: str # Required field for the index name


    async def run(self, input_data: dict) -> dict:
        # Use the retrieval_query from input_data if available
        query = input_data.get("query", "")
        query = str(query)
        if not query:
            raise ValueError("Input data must contain a 'query' field.")
        
        client = QdrantClient(url="http://localhost:6333")

        embedding = get_embedding(query)

        search_results = client.query_points(
            collection_name=self.index_name,
            query=embedding,
            limit=self.top_k,
        )

        print(f"Retrieved {len(search_results.points)} documents from Qdrant.")
        print([hit.payload for hit in search_results.points])

        return {**input_data, "retrieved_documents": [hit.payload for hit in search_results.points]}
    