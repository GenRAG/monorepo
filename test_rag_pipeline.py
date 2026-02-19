import asyncio
import httpx
import json

async def test_streaming_rag():
    url = "http://localhost:8000/rag/stream"

    payload = {
        "pipeline": {
            "pipeline_name": "test_rag",
            "blocks": [
                {"type": "query", "name": "query"},
                {"type": "retrieve", "name": "retrieve", "collection_name": "genrag_knowledge_base", "top_k": 3},
                {"type": "answer", "name": "answer", "model": "google/gemini-3-flash-preview"}
            ]
        },
        "query": "What is this document about? Please cite the filenames of the sources you are using.",
        "org_id": "test_org"
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
    asyncio.run(test_streaming_rag())
