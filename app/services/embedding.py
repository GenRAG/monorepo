import os
import requests
import json
from typing import List


class EmbeddingService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1/embeddings"
        self.model = "qwen/qwen3-embedding-8b"
        self.batch_size = 10  # Process 10 chunks at once

    def get_embedding(self, text: str):
        """Sends text to OpenRouter and returns a vector list."""
        if not text or not text.strip():
            return []

        response = requests.post(
            url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "genrag.com",
                "X-Title": "GenRAG App",
            },
            data=json.dumps({"model": self.model, "input": text}),
        )

        if response.status_code == 200:
            data = response.json()
            return data["data"][0]["embedding"]
        else:
            print(f"Embedding error {response.status_code}: {response.text}")
            return []

    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts in a single request."""
        if not texts:
            return []

        valid_texts = [text for text in texts if text and text.strip()]
        if not valid_texts:
            return []

        try:
            response = requests.post(
                url=self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "genrag.com",
                    "X-Title": "GenRAG App",
                },
                data=json.dumps({"model": self.model, "input": valid_texts}),
            )

            if response.status_code == 200:
                data = response.json()
                embeddings = [item["embedding"] for item in data["data"]]
                print(f"Generated {len(embeddings)} embeddings in batch")
                return embeddings
            else:
                print(f"Batch embedding error {response.status_code}: {response.text}")
                return []

        except Exception as e:
            print(f"Batch embedding exception: {e}")
            return []

    def process_chunks_in_batches(self, chunks: List[str]) -> List[List[float]]:
        """Process a list of chunks in optimized batches."""
        all_embeddings = []

        for i in range(0, len(chunks), self.batch_size):
            batch = chunks[i : i + self.batch_size]
            print(
                f"Processing batch {i // self.batch_size + 1}/{(len(chunks) + self.batch_size - 1) // self.batch_size} ({len(batch)} chunks)"
            )

            batch_embeddings = self.get_batch_embeddings(batch)

            if len(batch_embeddings) == len(batch):
                all_embeddings.extend(batch_embeddings)
            else:
                print("Batch embedding failed, falling back to sequential processing")
                for chunk in batch:
                    embedding = self.get_embedding(chunk)
                    all_embeddings.append(embedding)

        return all_embeddings
