import asyncio
import httpx

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
        "org_id": "test_org",
    }

    print(f"Sending request to {url}...")

    async with httpx.AsyncClient(timeout=60.0) as client:
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
        "org_id": "test_org",
    }

    print(f"Sending request to {url}...")

    async with httpx.AsyncClient(timeout=60.0) as client:
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


if __name__ == "__main__":
    print("Running RAG pipeline test with reranking...")
    asyncio.run(test_streaming_rag_rerank())
    print("\nRunning RAG pipeline test without reranking...")
    asyncio.run(test_streaming_rag())
