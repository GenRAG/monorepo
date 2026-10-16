"""
stream_with_cost.py

Standalone script that calls the OpenRouter API in streaming mode and
captures the cost information returned by OpenRouter.

OpenRouter returns cost data in the `usage` object of the final SSE chunk
(before the [DONE] marker). The `usage` dict contains:
  - prompt_tokens, completion_tokens, total_tokens
  - cost  (total USD cost for the request)

Usage:
    uv run python -m scripts.stream_with_cost
"""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from app.simple_openrouter_client import OpenRouterClient
from app.services.cost_tracker import CostTracker

# ---------------------------------------------------------------------------
# Configuration — tweak these before running
# ---------------------------------------------------------------------------
MODEL = "google/gemini-2.5-flash"  # Change to your desired model
SYSTEM_PROMPT = "You are a helpful assistant."
USER_MESSAGE = "Explain quantum entanglement in 3 paragraphs."
TEMPERATURE = 0.7
MAX_TOKENS = 512


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
async def main():
    client = OpenRouterClient()
    cost_tracker = CostTracker()

    # This will be populated by the callback after the stream ends
    captured_cost_record = None

    async def on_usage(usage: dict, request_id: str = ""):
        """Callback invoked after the stream finishes with the usage dict."""
        nonlocal captured_cost_record
        print(f"\n📊 Raw usage dict from OpenRouter: {usage}")

        # Record the cost using your existing CostTracker
        captured_cost_record = await cost_tracker.record_generation(
            org_id="script-org",
            model=MODEL,
            usage=usage,
            request_id=request_id,
        )
        print(f"✅ Cost record saved: ${captured_cost_record.cost_usd:.6f}")

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": USER_MESSAGE}
    ]

    print(f"🚀 Streaming from model: {MODEL}\n")
    print("--- Response ---")

    full_text = []
    async for chunk in client.chat_completion_stream(
        model=MODEL,
        messages=messages,
        temperature=TEMPERATURE,
        max_tokens=MAX_TOKENS,
        usage_callback=on_usage,
    ):
        print(chunk, end="", flush=True)
        full_text.append(chunk)

    print("\n--- End of Response ---")

    # After the stream, the callback has already fired — print the cost summary
    if captured_cost_record:
        print("\n" + "=" * 50)
        print("💰 COST BREAKDOWN")
        print("=" * 50)
        print(f"  Model:            {captured_cost_record.model}")
        print(f"  Prompt tokens:    {captured_cost_record.prompt_tokens}")
        print(f"  Completion tokens: {captured_cost_record.completion_tokens}")
        print(f"  Total tokens:     {captured_cost_record.total_tokens}")
        print(f"  Total cost (USD): ${captured_cost_record.cost_usd:.6f}")
        print("=" * 50)
    else:
        print(
            "\n⚠️  No cost data received. "
            "OpenRouter may not have returned a `usage` object in the stream."
        )

    await client.close()


if __name__ == "__main__":
    asyncio.run(main())
