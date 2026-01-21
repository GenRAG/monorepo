import os
import requests
import json

class EmbeddingService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1/embeddings"
        self.model = "qwen/qwen3-embedding-8b"
        
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
                "X-Title": "GenRAG App"
            },
            data=json.dumps({
                "model": self.model,
                "input": text
            })
        )
        
        if response.status_code == 200:
            data = response.json()
            # OpenRouter returns: {"data": [{"embedding": [...]}]}
            return data["data"][0]["embedding"]
        else:
            print(f"❌ Embedding Error {response.status_code}: {response.text}")
            return []