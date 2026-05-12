import os
import httpx
import asyncio
from typing import List
from app.config import settings

class EmbeddingService:
    def __init__(self):
        self.api_key = settings.openrouter_api_key
        self.base_url = "https://openrouter.ai/api/v1/embeddings"
        self.model = "qwen/qwen3-embedding-8b"
        self.batch_size = 100
        self.semaphore = asyncio.Semaphore(10) # Allow 10 concurrent batch requests

    async def get_embedding_batch(self, client: httpx.AsyncClient, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

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
            data = response.json()["data"]
            # Ensure order matches
            return [item["embedding"] for item in sorted(data, key=lambda x: x["index"])]
        else:
            print(f"Embedding error {response.status_code}: {response.text}")
            return [[] for _ in texts]

    async def process_chunks_concurrently(self, chunks: List[str]) -> List[List[float]]:
        async with httpx.AsyncClient() as client:
            tasks = []
            for i in range(0, len(chunks), self.batch_size):
                batch = chunks[i : i + self.batch_size]
                tasks.append(self.get_embedding_batch(client, batch))
            results = await asyncio.gather(*tasks)
            # Flatten results
            return [vec for batch_results in results for vec in batch_results]
