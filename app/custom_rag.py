"""
CLI test script for RAG pipeline.

Run this script to test the RAG pipeline from the command line:
    uv run python -m app.custom_rag
"""
from app.pipelines.rag_pipeline import execute_query_from_json


async def main():
    json_input = {
        "pipeline": {
            "pipeline_name": "custom_rag",
            "blocks": [
                {"type": "query", "name": "query"},
                {"type": "retrieve", "name": "retrieve", "collection_name": "genrag_knowledge_base", "top_k": 5},
                {"type": "answer", "name": "answer", "model": "deepseek/deepseek-v3.2", "temperature": 0.7, "max_tokens": 500}
            ]
        },
        "query": "Explique moi le concept de RAG"
    }

    print("Answer: ", end="", flush=True)
    async for chunk in execute_query_from_json(json_input):
        print(chunk, end="", flush=True)
    print()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
