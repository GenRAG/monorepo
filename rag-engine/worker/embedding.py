"""
worker/embedding.py

Embedding service using OpenRouter API (Qwen 3 embedding model).
Generates vector embeddings for text chunks in batches.
"""

import asyncio
from typing import List, Tuple, Optional

import httpx

from worker.config import settings


class EmbeddingService:
    def __init__(self):
        self.api_key = settings.openrouter_api_key
        self.base_url = "https://openrouter.ai/api/v1/embeddings"
        self.model = "qwen/qwen3-embedding-8b"
        self.batch_size = 100
        self.semaphore = asyncio.Semaphore(10)

    async def get_embedding_batch(
        self, client: httpx.AsyncClient, texts: List[str]
    ) -> Tuple[List[List[float]], Optional[dict]]:
        """Return (embeddings, usage_dict_or_None) for a batch of texts."""
        if not texts:
            return [], None

        async with self.semaphore:
            response = await client.post(
                self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "genrag.com",
                    "X-Title": "GenRAG App",
                },
                json={"model": self.model, "input": texts},
                timeout=60.0,
            )

        if response.status_code == 200:
            data = response.json()
            usage = data.get("usage")
            embeddings = [
                item["embedding"]
                for item in sorted(data["data"], key=lambda x: x["index"])
            ]
            return embeddings, usage
        else:
            print(f"Embedding error {response.status_code}: {response.text}")
            return [[] for _ in texts], None

    async def process_chunks_concurrently(
        self,
        chunks: List[str],
    ) -> List[List[float]]:
        """Process all chunks through the embedding API in concurrent batches.

        Args:
            chunks: List of text strings to embed.

        Returns:
            List of embedding vectors (one per chunk).
        """
        async with httpx.AsyncClient() as client:
            tasks = []
            for i in range(0, len(chunks), self.batch_size):
                batch = chunks[i : i + self.batch_size]
                tasks.append(self.get_embedding_batch(client, batch))
            results = await asyncio.gather(*tasks)

            # Flatten results (each item is (embeddings_list, usage_or_None))
            all_vectors = []
            for batch_vectors, _ in results:
                all_vectors.extend(batch_vectors)
            return all_vectors