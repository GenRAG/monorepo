from typing import Any, Dict

from langfuse import observe

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient


class QueryRewriterBlock(BaseBlock):
    prompt_template: str = """
    You are a helpful AI assistant. Your task is to rewrite the user's query to make it more effective for retrieving relevant documents from a knowledge base. If the query does not require rewriting, return it as is. Do not add any conversational elements or pleasantries. Only return the rewritten query.

    Original Query: {query}
    Rewritten Query:
    """
    model_name: str

    @observe(name="QueryRewriterBlock", as_type="generation")
    async def run(self, input_data: Dict[str, Any]) -> str:
        query = input_data.get("query", "")
        if not query:
            raise ValueError("Input data must contain a 'query' field")

        prompt = self.prompt_template.format(query=query)

        client = OpenRouterClient()
        try:
            rewritten_query = ""
            async for chunk in client.chat_completion_stream(
                model=self.model_name,
                messages=[{"role": "system", "content": prompt}],
            ):
                rewritten_query += chunk
            return {**input_data, "query": rewritten_query.strip()}
            
        finally:
            await client.close()
