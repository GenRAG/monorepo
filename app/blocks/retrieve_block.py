from typing import Union, Dict, Any, Optional
from pydantic import Field
import requests
from langfuse import observe

from .base_block import BaseBlock
from app.config import settings


class RetrieveBlock(BaseBlock):
    top_k: int = Field(default=5)
    collection_name: str
    org_id: Optional[str] = None

    @observe(name="RetrieveBlock")
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

        client = QdrantClient(url=settings.qdrant_url)
        query_filter = None
        if self.org_id:
            query_filter = {"must": [{"key": "org_id", "match": {"value": self.org_id}}] }

        search_results = client.query_points(
            collection_name=self.collection_name,
            query=embedding,
            limit=self.top_k,
            query_filter=query_filter
        )

        retrieved_docs = [hit.payload for hit in search_results.points]
        return {**input_data, "retrieved_documents": retrieved_docs}

    async def _get_embedding(self, text: str) -> list[float]:
        if not text or not text.strip():
            return []

        url = "https://openrouter.ai/api/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "genrag.com",
            "X-Title": "GenRAG",
        }
        data = {"model": "qwen/qwen3-embedding-8b", "input": text}

        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            result = response.json()
            return result["data"][0]["embedding"]
        return []
