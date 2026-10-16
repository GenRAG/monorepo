"""
test_stream.py

Quick script to test the RAG pipeline and display cost with FULL precision.

Usage:
    uv run python -m scripts.test_stream
"""

import os
import sys
import json
import dotenv
import requests

dotenv.load_dotenv()

API_KEY = os.getenv("RAG_ENGINE_API_KEY", "test-key")
BASE_URL = "http://localhost:8000"


def test_rag_pipeline():
    """Send a test request and display cost with full precision."""
    print("=" * 60)
    print("  RAG Pipeline Stream Test (Full Cost Precision)")
    print("=" * 60)

    payload = {
        "org_id": "lepetitcoin",
        "query": "What do you know about payment terms?",
        "pipeline": {
            "pipeline_name": "test_stream",
            "blocks": [
                {"type": "query", "name": "query"},
                {
                    "type": "retrieve",
                    "name": "retrieve",
                    "collection_name": "genrag_knowledge_base",
                    "top_k": 5
                },
                {
                    "type": "answer",
                    "name": "answer",
                    "model": "google/gemini-2.5-flash",
                    "temperature": 0.7,
                    "max_tokens": 256
                }
            ]
        }
    }

    print(f"\n📤 Sending request to {BASE_URL}/rag/stream...")
    print(f"   Query: {payload['query']}")
    print(f"   Model: {payload['pipeline']['blocks'][2]['model']}")
    print()

    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/rag/stream",
            json=payload,
            headers=headers,
            stream=True,
            timeout=60
        )
        response.raise_for_status()

        print("📥 Streaming response...\n")
        print("-" * 60)

        full_response = ""
        for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
            if chunk:
                print(chunk, end="", flush=True)
                full_response += chunk

        print("\n" + "-" * 60)

        # Extract and display COST_SUMMARY with full precision
        if "COST_SUMMARY" in full_response:
            print("\n" + "=" * 60)
            print("  COST SUMMARY (FULL PRECISION)")
            print("=" * 60)

            # Extract the COST_SUMMARY JSON
            import re
            match = re.search(r'COST_SUMMARY: (.+?) -->', full_response)
            if match:
                cost_json_str = match.group(1)
                try:
                    cost_data = json.loads(cost_json_str)
                    data = cost_data.get("data", {})

                    print(f"\n  💰 Total cost (float): ${data.get('total_cost_usd', 0):.10f}")
                    print(f"  💰 Total cost (raw string): ${data.get('total_cost_usd_raw', 'N/A')}")

                    print(f"\n  📊 By model:")
                    for model, cost in data.get('by_model', {}).items():
                        print(f"     - {model}: ${cost}")

                    print(f"\n  📊 By type:")
                    for cost_type, cost in data.get('by_type', {}).items():
                        print(f"     - {cost_type}: ${cost}")

                    # Show raw JSON for billing
                    print(f"\n  📋 Full JSON (for billing):")
                    print(f"     {json.dumps(cost_data, indent=2)}")

                except json.JSONDecodeError as e:
                    print(f"  ⚠️  Error parsing cost JSON: {e}")

            print("=" * 60)
        else:
            print("\n⚠️  No COST_SUMMARY found in response")

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is it running on port 8000?")
        print(f"   Try: uv run fastapi run app/main.py --host 0.0.0.0 --port 8000")
        sys.exit(1)
    except requests.exceptions.Timeout:
        print("❌ Request timed out after 60 seconds")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    test_rag_pipeline()
