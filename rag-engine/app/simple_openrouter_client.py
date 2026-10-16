# app/simple_openrouter_client.py

import httpx
import json
import os
from typing import Callable, List, Dict, Optional, AsyncGenerator, Awaitable

# Updated to accept both usage dict and optional request_id
UsageCallback = Optional[Callable[[dict, str], Awaitable[None]]]
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
            # Explicit timeout/pool limits: default httpx settings (5s connect timeout,
            # 100 max connections) get exhausted fast when several /rag/stream requests
            # each spin up their own short-lived client concurrently, surfacing as
            # spurious ConnectTimeout errors under load.
            timeout=httpx.Timeout(60.0, connect=10.0),
            limits=httpx.Limits(max_connections=200, max_keepalive_connections=50),
        )

    async def get_models(self) -> List[str]: # Fetches available model IDs from OpenRouter
        try:
            response = await self.client.get("/models")
            response.raise_for_status()
            data = response.json()

            if "data" not in data:
                raise ValueError("Unexpected response format")

            return data
        except Exception as e:
            raise ValueError(f"Error fetching models: {e}")
        
    async def get_rerank_models(self) -> List[str]: # Fetches available reranking model IDs from OpenRouter
        try:
            response = await self.client.get("/models?output_modalities=rerank")
            response.raise_for_status()
            data = response.json()

            if "data" not in data:
                raise ValueError("Unexpected response format")

            return data
        except Exception as e:
            raise ValueError(f"Error fetching reranking models: {e}")
        
    async def get_embeddings_models(self) -> List[str]: # Fetches available embedding model IDs from OpenRouter
        try:
            response = await self.client.get("/models?output_modalities=embeddings")
            response.raise_for_status()
            data = response.json()

            if "data" not in data:
                raise ValueError("Unexpected response format")

            return data
        except Exception as e:
            raise ValueError(f"Error fetching embedding models: {e}")

    async def find_model_with_catalog(self, model_id: str) -> tuple[Dict, List[Dict]]: # Fetches one model plus the full catalog (for market-relative scoring)
        catalog = await self.get_models()
        models = catalog["data"]
        for model in models:
            if model["id"] == model_id:
                return model, models
        raise ValueError(f"Model not found in OpenRouter catalog: {model_id}")

    async def get_throughput_ranking(self) -> List[Dict]: # Fetches all text models pre-sorted by throughput server-side (rank only, no raw tok/s value -- but that's all a percentile needs)
        try:
            response = await self.client.get(
                "/models", params={"sort": "throughput-high-to-low", "output_modalities": "text"}
            )
            response.raise_for_status()
            data = response.json()
            if "data" not in data:
                raise ValueError("Unexpected response format")
            return data["data"]
        except Exception as e:
            raise ValueError(f"Error fetching throughput ranking: {e}")

    async def get_gpqa_benchmarks(self) -> List[Dict]: # Fetches OpenRouter's own GPQA Diamond accuracy scores (much broader coverage than Artificial Analysis)
        try:
            response = await self.client.get(
                "/benchmarks", params={"source": "openrouter", "benchmark_type": "gpqa_diamond"}
            )
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
        except Exception as e:
            raise ValueError(f"Error fetching GPQA benchmarks: {e}")

    async def get_usage_rankings(self) -> List[Dict]: # Fetches monthly token-usage totals per model (real production adoption signal)
        try:
            response = await self.client.get("/datasets/rankings-daily?period=month")
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
        except Exception as e:
            raise ValueError(f"Error fetching usage rankings: {e}")

    async def get_model_endpoints(self, details_path: str) -> List[Dict]: # Fetches per-provider throughput/latency/pricing for one model
        # `details_path` comes back from OpenRouter as "/api/v1/models/.../endpoints",
        # but self.client's base_url already ends in "/api/v1" -- strip the
        # duplicated prefix so httpx doesn't request "/api/v1/api/v1/...".
        path = details_path
        if path.startswith("/api/v1"):
            path = path[len("/api/v1"):]
        try:
            response = await self.client.get(path)
            response.raise_for_status()
            data = response.json()
            return data.get("data", {}).get("endpoints", [])
        except Exception as e:
            raise ValueError(f"Error fetching model endpoints: {e}")

    async def chat_completion( # Performs a non-streaming chat completion request
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, str]] = None,
        usage_callback: UsageCallback = None,
    ) -> str:
        payload = {"model": model, "messages": messages}
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if response_format is not None:
            payload["response_format"] = response_format

        try:
            response = await self.client.post("/chat/completions", json=payload)
            response.raise_for_status()
            data = response.json()

            # Capture usage and request_id if callback provided
            if usage_callback:
                request_id = data.get("id", "")
                if "usage" in data:
                    await usage_callback(data["usage"], request_id)

            return data["choices"][0]["message"]["content"]
        except Exception as e:
            raise ValueError(f"Chat completion error: {e}")

    async def chat_completion_stream( # Streams chat completion responses chunk by chunk
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        usage_callback: UsageCallback = None,
    ) -> AsyncGenerator[str, None]:
        payload = {"model": model, "messages": messages, "stream": True}
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        usage_data = None
        request_id = ""
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

                        # OpenRouter sends usage in the final content chunk before [DONE]
                        # IMPORTANT: Check for usage BEFORE trying to parse content,
                        # because the final chunk might have empty choices
                        if "usage" in chunk_data and chunk_data.get("usage"):
                            usage_data = chunk_data["usage"]
                            # Also capture the request ID if present
                            if "id" in chunk_data:
                                request_id = chunk_data["id"]

                        # Safely extract content
                        choices = chunk_data.get("choices", [])
                        if choices:
                            delta = choices[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue

        # After the stream ends, invoke the callback with captured usage and request_id
        if usage_callback and usage_data:
            await usage_callback(usage_data, request_id)

    async def close(self): # Closes the underlying HTTP client session
        await self.client.aclose()
