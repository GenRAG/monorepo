# app/simple_openrouter_client.py

import httpx
import json
import os
from typing import List, Dict, Optional, AsyncGenerator
from pydantic_settings import BaseSettings, SettingsConfigDict
import dotenv

dotenv.load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )
    OPENROUTER_API_KEY: str
    MINIO_USER: str
    MINIO_PASSWORD: str
    S3_ENDPOINT: str
    BUCKET_NAME: str


try:
    settings = Settings()
except Exception as e:
    print(f"Error loading settings: {e}")
    settings = None


class OpenRouterClient: # Client for interacting with the OpenRouter API for chat completions
    def __init__( # Initializes the OpenRouter client with API key and base URL
        self,
        api_key: str = OPENROUTER_API_KEY,
        base_url: str = "https://openrouter.ai/api/v1",
    ):
        self.api_key = api_key or (settings.OPENROUTER_API_KEY if settings else None)
        if not self.api_key:
            raise ValueError("OpenRouter API key not found")

        self.base_url = base_url.rstrip("/ ")
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "X-Title": "GenRAG",
            },
        )

    async def get_models(self) -> List[str]: # Fetches available model IDs from OpenRouter
        try:
            response = await self.client.get("/models")
            response.raise_for_status()
            data = response.json()

            if "data" not in data:
                raise ValueError("Unexpected response format")

            return [
                model["id"]
                for model in data["data"]
                if not model["id"].endswith(":free")
            ]
        except Exception as e:
            raise ValueError(f"Error fetching models: {e}")

    async def chat_completion( # Performs a non-streaming chat completion request
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        payload = {"model": model, "messages": messages}
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        try:
            response = await self.client.post("/chat/completions", json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            raise ValueError(f"Chat completion error: {e}")

    async def chat_completion_stream( # Streams chat completion responses chunk by chunk
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        payload = {"model": model, "messages": messages, "stream": True}
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        async with self.client.stream(
            "POST", "/chat/completions", json=payload
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data_str = line[len("data: ") :].strip()
                    if data_str == "[DONE]":
                        break
                    try:
                        chunk_data = json.loads(data_str)
                        content = chunk_data["choices"][0]["delta"].get("content", "")
                        if content:
                            yield content
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue

    async def close(self): # Closes the underlying HTTP client session
        await self.client.aclose()
