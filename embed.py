import requests
import dotenv

dotenv.load_dotenv()

OPENROUTER_API_KEY = dotenv.get_key(dotenv.find_dotenv(), "OPENROUTER_API_KEY")

print("OpenRouter Key Loaded:", OPENROUTER_API_KEY is not None)

MODEL_NAME = "qwen/qwen3-embedding-8b"
EMBEDDING_URL = f"https://openrouter.ai/api/v1/embeddings/{MODEL_NAME}"

import requests
import json

response = requests.post(
  url="https://openrouter.ai/api/v1/embeddings",
  headers={
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "gen-rag.com", 
    "X-Title": "GenRAG Application"
  },
  data=json.dumps({
    "model": "qwen/qwen3-embedding-8b",
    "input": "Your text string goes here",
    "encoding_format": "float"
  })
)
if response.status_code == 200:
    embeddings = response.json()
    print("Embeddings:", embeddings)
else:
    print("Error:", response.status_code, response.text)

