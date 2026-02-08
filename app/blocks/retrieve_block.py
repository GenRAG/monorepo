from typing import Union, Dict, Any
from pydantic import Field
import requests

from .base_block import BaseBlock
from app.config import Config


class RetrieveBlock(BaseBlock):
    top_k: int = Field(default=5)
    collection_name: str

    async def run(self, input_data: Union[Dict[str, Any], str]) -> Dict[str, Any]:
        from qdrant_client import QdrantClient

        if isinstance(input_data, dict):
            query = input_data.get("query", "")
        else:
            query = str(input_data)

        if not query:
            raise ValueError("Query cannot be empty")

        embedding = await self._get_embedding(query)
        if not embedding:
            raise ValueError("Failed to generate embedding")

        client = QdrantClient(url=Config.QDRANT_URL)
        search_results = client.query_points(
            collection_name=self.collection_name,
            query=embedding,
            limit=self.top_k,
        )

        retrieved_docs = [hit.payload for hit in search_results.points]
        return {**input_data, "retrieved_documents": retrieved_docs}

    async def _get_embedding(self, text: str) -> list[float]:
        if not text or not text.strip():
            return []

        url = "https://openrouter.ai/api/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {Config.OPENROUTER_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "genrag.com",
            "X-Title": "GenRAG App"
        }
        data = {
            "model": "qwen/qwen3-embedding-8b",
            "input": text
        }

        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            result = response.json()
            return result["data"][0]["embedding"]
        return []
