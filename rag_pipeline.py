import httpx
import json
import asyncio
from typing import List, Dict, Optional, AsyncGenerator
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Loads settings from environment variables or .env file."""
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    OPENROUTER_API_KEY: str
    MINIO_USER: str
    MINIO_PASSWORD: str
    S3_ENDPOINT: str
    BUCKET_NAME: str

try:
    settings = Settings()
    OPENROUTER_API_KEY = settings.OPENROUTER_API_KEY
except Exception as e:
    print("Error loading settings:", e)
    OPENROUTER_API_KEY = ""  # Fallback to empty string

class OpenRouterClient:
    def __init__(self, api_key: str = OPENROUTER_API_KEY):
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1"

    async def chat_completion_stream(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AsyncGenerator[Dict, None]:
        """Streams chat completion from OpenRouter."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "genrag.com",
            "X-Title": "GenRAG App"
        }

        payload = {
            "model": model,
            "messages": messages,
            "stream": True
        }
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=None
            ) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    print(f"Chat Completion Error {response.status_code}: {error_text.decode()}")
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[len("data: "):].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            data_json = json.loads(data_str)
                            yield data_json
                        except json.JSONDecodeError:
                            continue

llm_client = OpenRouterClient()

async def main():
    # Example usage of OpenRouterClient
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, how are you?"}
    ]

    async for chunk in llm_client.chat_completion_stream(
        model="liquid/lfm2-8b-a1b",
        messages=messages,
        temperature=0.7,
        max_tokens=150
    ):
        print(chunk["choices"][0]["delta"].get("content", ""), end="", flush=True)


# if __name__ == "__main__":
#     asyncio.run(main())


from pydantic import BaseModel
from typing import List, Optional, Union
from abc import ABC, abstractmethod

class BaseBlock(BaseModel):
    name: str
    description: Optional[str] = None

    @abstractmethod
    async def run(self, input_data: dict) -> dict:
        raise NotImplementedError("Each block must implement the run method.")
    
class QueryBlock(BaseBlock):
    # Use Qdrant to retrieve relevant documents based on the query
    async def run(self, input_data: dict) -> dict:
        return {"query": input_data.get("query", "")}
    
