# simple_open-router_client.py

import httpx
import json
import asyncio
from typing import List, Dict, Optional, AsyncGenerator
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
import dotenv
import os

dotenv.load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

class Settings(BaseSettings):
    """Loads settings from environment variables or .env file."""
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    OPENROUTER_API_KEY: str
    MINIO_USER: str
    MINIO_PASSWORD: str
    S3_ENDPOINT: str
    BUCKET_NAME: str

# Load settings
try:
    settings = Settings()
except Exception as e: # Catch potential errors like missing .env or key
    print(f"Error loading settings: {e}")
    # You might want to exit here or handle the missing key differently
    # For now, we'll let the client constructor handle the missing key error
    settings = None # Or a default Settings() if key is optional initially

class OpenRouterClient:
    """
    Optimized asynchronous client for the OpenRouter API using httpx.
    Designed for performance with concurrent requests.
    """
    def __init__(self, api_key: str = OPENROUTER_API_KEY, base_url: str = "https://openrouter.ai/api/v1"):
        """
        Initializes the OpenRouter client.

        Args:
            api_key: Your OpenRouter API key. If not provided, it will attempt
                     to load from the OPENROUTER_API_KEY environment variable.
            base_url: The base URL for the OpenRouter API.
        """
        self.api_key = api_key or (settings.OPENROUTER_API_KEY if settings else None)
        if not self.api_key:
            raise ValueError(
                "OpenRouter API key not found. Please provide it directly or "
                "set the OPENROUTER_API_KEY environment variable."
            )
        
        self.base_url = base_url.rstrip('/ ')
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "X-Title": "GenRAG", # Optional: Identify the app
                # "HTTP-Referer": "", # Optional: app's URL
            },
        )

    async def get_models(self) -> List[str]:
        """
        Fetches a list of available model IDs from OpenRouter.

        Returns:
            A list of model ID strings (excluding free-tier models).

        Raises:
            httpx.HTTPError: For network issues or HTTP errors from the API.
            ValueError: If the response format is unexpected.
        """
        try:
            response = await self.client.get("/models")
            response.raise_for_status()
            data = response.json()
            
            if 'data' not in data:
                raise ValueError("Unexpected response format: 'data' field missing")
            
            # Filter out free models which have lower rate limits
            return [model['id'] for model in data['data'] if not model['id'].endswith(':free')]
        except httpx.HTTPError:
            # Re-raise HTTP errors for the caller to handle
            raise
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            raise ValueError(f"Error processing models response: {e}")

    async def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Sends a non-streaming chat completion request to the OpenRouter API.

        Args:
            model: The model ID to use.
            messages: A list of message dictionaries (e.g., [{"role": "user", "content": "Hello"}]).
            temperature: (Optional) Sampling temperature.
            top_p: (Optional) Nucleus sampling parameter.
            max_tokens: (Optional) Maximum number of tokens to generate.

        Returns:
            The full response text from the assistant.

        Raises:
            httpx.HTTPError: For network issues or HTTP errors from the API.
            ValueError: If the response format is unexpected.
        """
        payload = {
            "model": model,
            "messages": messages,
        }
        # Add optional parameters only if they are explicitly provided
        if temperature is not None:
            payload["temperature"] = temperature
        if top_p is not None:
            payload["top_p"] = top_p
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        # Ensure stream is False or omitted for non-streaming

        try:
            response = await self.client.post("/chat/completions", json=payload)
            response.raise_for_status()
            data = response.json()
            # Extract the content
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPError:
            # Re-raise HTTP errors
            raise
        except (json.JSONDecodeError, KeyError, IndexError, TypeError) as e:
            raise ValueError(f"Error processing chat completion response: {e}")

    async def chat_completion_stream(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Sends a streaming chat completion request to the OpenRouter API.

        Args:
            model: The model ID to use.
            messages: A list of message dictionaries.
            temperature: (Optional) Sampling temperature.
            top_p: (Optional) Nucleus sampling parameter.
            max_tokens: (Optional) Maximum number of tokens to generate.

        Yields:
            Chunks of the response text as they are generated.

        Raises:
            httpx.HTTPError: For network issues or HTTP errors from the API.
            ValueError: If the response format is unexpected during streaming.
        """
        payload = {
            "model": model,
            "messages": messages,
            "stream": True
        }
        # Add optional parameters only if they are explicitly provided
        if temperature is not None:
            payload["temperature"] = temperature
        if top_p is not None:
            payload["top_p"] = top_p
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        # Use streaming context manager
        async with self.client.stream("POST", "/chat/completions", json=payload) as response:
            response.raise_for_status()
            
            # Iterate over the response lines
            async for line in response.aiter_lines():
                # Check for the data prefix
                if line.startswith("data: "):
                    # Extract the JSON data part
                    data_str = line[len("data: "):].strip()
                    # Check for the end of the stream
                    if data_str == "[DONE]":
                        break
                    try:
                        # Parse the JSON chunk
                        chunk_data = json.loads(data_str)
                        # Extract the content delta, if present
                        # content might be missing or empty in some chunks (e.g., role announcements)
                        content = chunk_data["choices"][0]["delta"].get("content", "")
                        if content: # Only yield non-empty content strings
                            yield content
                    except (json.JSONDecodeError, KeyError, IndexError, TypeError) as e:
                        # Handle potential errors in parsing stream chunks
                        # Depending on requirements, you might log, skip, or raise
                        # Raising here stops the stream; logging/skipping allows it to continue
                        # print(f"Warning: Error parsing stream chunk: {e}") # Example: log and continue
                        pass # Silently skip problematic chunks

    async def close(self):
        """Closes the underlying HTTP client."""
        await self.client.aclose()


# --- Example Usage ---
# This section runs only if the script is executed directly.
async def main():
    """Example demonstrating how to use the OpenRouterClient."""
    # Initialize the client
    # Ensure OPENROUTER_API_KEY is set in your environment or .env file
    try:
        client = OpenRouterClient()
    except ValueError as e:
        print(f"Client initialization error: {e}")
        return # Exit if client can't be created

    try:
        print("--- Fetching Models ---")
        models = await client.get_models()
        print(f"Found {len(models)} non-free models.")
        print("First 5 models:", models[:5])

        if not models:
            print("No models available.")
            return

        # Select a model for the example
        selected_model = models[0]
        print(f"\n--- Using Model: {selected_model} ---")

        # Prepare messages for the chat
        example_messages = [
            {"role": "system", "content": "You are a helpful and concise assistant."},
            {"role": "user", "content": "What are the advantages of using asynchronous programming in Python for web APIs?"}
        ]

        # --- Non-Streaming Request ---
        print("\n--- Non-Streaming Chat Completion ---")
        try:
            response_text = await client.chat_completion(
                model=selected_model,
                messages=example_messages,
                # You can add temperature, top_p, max_tokens here if needed
            )
            print("Response:")
            print(response_text)
        except ValueError as e:
            print(f"Error processing non-streaming response: {e}")
        except httpx.HTTPError as e:
            print(f"HTTP error during non-streaming request: {e}")


        # --- Streaming Request ---
        print("\n--- Streaming Chat Completion ---")
        stream_messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Count from 1 to 10, listing each number on a new line."}
        ]
        try:
            print("Streaming response:")
            async for chunk in client.chat_completion_stream(
                model=selected_model,
                messages=stream_messages,
                # Optional parameters can be added here
            ):
                # Print chunks as they arrive, without adding extra newlines
                print(chunk, end="", flush=True)
            print("\n--- End of Stream ---")
        except ValueError as e:
            print(f"\nError processing streaming response: {e}")
        except httpx.HTTPError as e:
            print(f"\nHTTP error during streaming request: {e}")


    except httpx.HTTPError as e:
        print(f"An HTTP error occurred: {e}")
    except ValueError as e:
        print(f"A value error occurred: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        # Ensure the client is closed to free up resources
        await client.close()
        print("\nClient closed.")

# Entry point for the script
if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
