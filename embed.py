import requests
import dotenv

dotenv.load_dotenv()

OPENROUTER_API_KEY = dotenv.get_key(dotenv.find_dotenv(), "OPENROUTER_API_KEY")

print("OpenRouter Key Loaded:", OPENROUTER_API_KEY is not None)

MODEL_NAME = "qwen/qwen3-embedding-8b"
EMBEDDING_URL = f"https://openrouter.ai/api/v1/embeddings/{MODEL_NAME}"

import requests
import json

# response = requests.post(
#   url="https://openrouter.ai/api/v1/embeddings",
#   headers={
#     "Authorization": f"Bearer {OPENROUTER_API_KEY}",
#     "Content-Type": "application/json",
#     "HTTP-Referer": "gen-rag.com", 
#     "X-Title": "GenRAG Application"
#   },
#   data=json.dumps({
#     "model": "qwen/qwen3-embedding-8b",
#     "input": "Your text string goes here",
#     "encoding_format": "float"
#   })
# )
# if response.status_code == 200:
#     embeddings = response.json()
#     print("Embeddings:", embeddings)
# else:
#     print("Error:", response.status_code, response.text)

def get_embedding(text: str):
    """Sends text to OpenRouter and returns a vector list."""
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
    
# print("Test Embedding:", get_embedding("Hello, world!"))


from qdrant_client import QdrantClient

client = QdrantClient(url="http://localhost:6333")

import asyncio
from typing import List

# retrive chunks based on a query embedding
async def retrieve_chunks(index_name: str, query_embedding: List[float], top_k:
    int) -> List[dict]:
    search_results = await client.search(
        collection_name=index_name,
        query_vector=query_embedding,
        limit=top_k,
    )
    return [hit.payload for hit in search_results]

# now we can test retrieval
if __name__ == "__main__":
    import asyncio

    async def test_retrieval(input_query: str):
        query_embedding = get_embedding(input_query)
        results = await retrieve_chunks("my_index", query_embedding, top_k=5)
        print("Retrieved Chunks:", results)

    asyncio.run(test_retrieval("What is the capital of France?"))