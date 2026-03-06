import asyncio
import os
import httpx
import dotenv

dotenv.load_dotenv()

API_KEY = os.getenv("RAG_ENGINE_API_KEY")
URL = "http://localhost:8000/rag/stream"
ORG_ID = "string"

async def chat():
    print("Welcome to GenRAG Terminal Chat!")
    print("Type 'quit' or 'exit' to stop.")
    print("-" * 50)

    chat_history = []

    async with httpx.AsyncClient(timeout=120.0, headers={"X-API-Key": API_KEY}) as client:
        while True:
            try:
                user_input = input("\nYou: ")
                if user_input.lower() in ["quit", "exit"]:
                    print("Goodbye!")
                    break
                if not user_input.strip():
                    continue

                payload = {
                    "pipeline": {
                        "pipeline_name": "terminal_chat_pipeline",
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
                                "type": "answer",
                                "name": "answer",
                                "model": "google/gemini-2.5-flash",
                            },
                        ],
                    },
                    "query": user_input,
                    "chat_history": chat_history,
                    "org_id": ORG_ID,
                }

                print("GenRAG: ", end="", flush=True)

                full_response = ""
                async with client.stream("POST", URL, json=payload) as response:
                    if response.status_code != 200:
                        error_msg = await response.aread()
                        print(f"\n[Error: {response.status_code}] {error_msg.decode('utf-8')}")
                        continue

                    async for chunk in response.aiter_text():
                        print(chunk, end="", flush=True)
                        full_response += chunk

                print() # Print a newline when the stream is fully finished

                # Append the newly completed conversation turn to the history
                chat_history.append({"role": "user", "content": user_input})
                chat_history.append({"role": "assistant", "content": full_response})

            except KeyboardInterrupt:
                print("\nGoodbye!")
                break
            except Exception as e:
                print(f"\nAn error occurred: {e}")

if __name__ == "__main__":
    if not API_KEY:
        print("Warning: RAG_ENGINE_API_KEY environment variable is not set. API calls might fail if authentication is required.")

    asyncio.run(chat())
