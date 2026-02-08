from qdrant_client import QdrantClient
import httpx
import dotenv
import os
import json
import requests

dotenv.load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant:6333")

client = QdrantClient(url=QDRANT_URL)

def get_embedding(text: str):
    """Sends text to OpenRouter and returns a vector list."""
    print("Getting embedding for text:", text)
    if not text or not text.strip():
        return []

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

query = "What did you do during your internship?"
query_vector = get_embedding(query)

search_results = client.query_points(
    collection_name="genrag_knowledge_base",
    query=query_vector,
    limit=5,
)

for point in search_results.points:
    print("Retrieved point ID:", point.id)
    print("Payload:", point.payload)
    print("Vector:", point.vector)