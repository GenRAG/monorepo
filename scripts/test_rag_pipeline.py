import asyncio
import os
import httpx
import dotenv

dotenv.load_dotenv()

API_KEY = os.getenv("RAG_ENGINE_API_KEY")

async def test_streaming_rag_rerank():
    url = "http://localhost:8000/rag/stream"

    payload = {
        "pipeline": {
            "pipeline_name": "test_rag_rerank",
            "blocks": [
                {"type": "query", "name": "query"},
                {
                    "type": "retrieve",
                    "name": "retrieve",
                    "collection_name": "genrag_knowledge_base",
                    "top_k": 5,
                },
                {
                    "type": "rerank",
                    "name": "rerank",
                    "provider": "zeroentropy",
                    "model": "zerank-2",
                    "top_k": 3,
                },
                {
                    "type": "answer",
                    "name": "answer",
                    "model": "google/gemini-2.5-flash",
                },
            ],
        },
        "query": "What is this document about? Please cite the filenames of the sources you are using.",
        "org_id": "string",
    }

    print(f"Sending request to {url}...")

    async with httpx.AsyncClient(timeout=60.0, headers={"X-API-Key": API_KEY}) as client:
        try:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code != 200:
                    print(f"Error: {response.status_code}")
                    print(await response.aread())
                    return

                print("Response stream:")
                async for chunk in response.aiter_text():
                    print(chunk, end="", flush=True)
                print("\n\nStream finished.")
        except Exception as e:
            print(f"An error occurred: {e}")

async def test_streaming_rag():
    url = "http://localhost:8000/rag/stream"

    payload = {
        "pipeline": {
            "pipeline_name": "test_rag",
            "blocks": [
                {"type": "query", "name": "query"},
                {
                    "type": "retrieve",
                    "name": "retrieve",
                    "collection_name": "genrag_knowledge_base",
                    "top_k": 3,
                },
                {
                    "type": "answer",
                    "name": "answer",
                    "model": "google/gemini-2.5-flash"
                },
            ],
        },
        "query": "What is this document about? Please cite the filenames of the sources you are using.",
        "org_id": "string",
    }

    print(f"Sending request to {url}...")

    async with httpx.AsyncClient(timeout=60.0, headers={"X-API-Key": API_KEY}) as client:
        try:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code != 200:
                    print(f"Error: {response.status_code}")
                    print(await response.aread())
                    return

                print("Response stream:")
                async for chunk in response.aiter_text():
                    print(chunk, end="", flush=True)
                print("\n\nStream finished.")
        except Exception as e:
            print(f"An error occurred: {e}")



async def test_missing_api_key():
    url = "http://localhost:8000/ingest"
    print(f"\nTesting ingest endpoint without API key to expect 401 Unauthorized for {url}...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, headers={}, files={"file": ("test.pdf", b"pdf_content", "application/pdf")}, data={"org_id": "string"})
            if response.status_code == 401:
                print(f"Success: Received expected 401 Unauthorized for missing API key: {response.text}")
            else:
                print(f"Error: Expected 401 Unauthorized but got {response.status_code}: {response.text}")
        except Exception as e:
            print(f"An error occurred during missing API key test: {e}")

async def test_invalid_api_key():
    url = "http://localhost:8000/ingest"
    print(f"\nTesting ingest endpoint with invalid API key to expect 401 Unauthorized for {url}...")
    headers = {"X-API-Key": "invalid_key"}
    async with httpx.AsyncClient(timeout=60.0, headers=headers) as client:
        try:
            response = await client.post(url, files={"file": ("test.pdf", b"pdf_content", "application/pdf")}, data={"org_id": "string"})
            if response.status_code == 401:
                print(f"Success: Received expected 401 Unauthorized for invalid API key: {response.text}")
            else:
                print(f"Error: Expected 401 Unauthorized but got {response.status_code}: {response.text}")
        except Exception as e:
            print(f"An error occurred during invalid API key test: {e}")

async def test_streaming_rag_query_rewrite():
    url = "http://localhost:8000/rag/stream"

    payload = {
        "pipeline": {
            "pipeline_name": "test_rag_query_rewrite",
            "blocks": [
                {"type": "query", "name": "query"},
                {
                    "type": "query_rewrite",
                    "name": "query_rewrite",
                    "model_name": "google/gemini-2.5-flash",
                },
                {
                    "type": "retrieve",
                    "name": "retrieve",
                    "collection_name": "genrag_knowledge_base",
                    "top_k": 5,
                },
                {
                    "type": "rerank",
                    "name": "rerank",
                    "provider": "zeroentropy",
                    "model": "zerank-2",
                    "top_k": 3,
                },
                {
                    "type": "answer",
                    "name": "answer",
                    "model": "google/gemini-2.5-flash",
                },
            ],
        },
        "query": "What is GenRAG?",
        "org_id": "test",
    }

    print(f"Sending query rewrite request to {url}...")

    async with httpx.AsyncClient(timeout=60.0, headers={"X-API-Key": API_KEY}) as client:
        try:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code != 200:
                    print(f"Error: {response.status_code}")
                    print(await response.aread())
                    return

                print("Response stream for query rewrite:")
                async for chunk in response.aiter_text():
                    print(chunk, end="", flush=True)
                print("\n\nStream finished for query rewrite.")
        except Exception as e:
            print(f"An error occurred during query rewrite test: {e}")


if __name__ == "__main__":
    # print("Running RAG pipeline test with reranking...")
    # asyncio.run(test_streaming_rag_rerank())
    # print("\nRunning RAG pipeline test without reranking...")
    # asyncio.run(test_streaming_rag())
    print("\nRunning RAG pipeline test with query rewriting...")
    asyncio.run(test_streaming_rag_query_rewrite())

