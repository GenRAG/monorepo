from typing import Any, Dict

from langfuse import observe

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient


class QueryRewriterBlock(BaseBlock):
    prompt_template: str = """
    You are a query rewriting AI assistant. Your purpose is to
    optimize user queries for a document retrieval system.
    Specifically, you should:

    1.  **Expand and Clarify as a Coherent Question**: If the query is vague or too short,
        rewrite it as a more expanded, descriptive, and clear standalone question.
    2.  **Enrich with Context and Keywords**: Incorporate additional context or relevant keywords,
        integrating them naturally to form a better question for document retrieval from
        a knowledge base.
    3.  **Maintain Original Intent**: Ensure the rewritten query accurately
        reflects the core intent of the user's original question.
    4.  **Produce Only the Rewritten Question**: Your output must be *only* the rewritten question.
        Do not include any conversational filler, explanations, or pleasantries.

    Here are some examples:

    Original Query: "RAG"
    Rewritten Query: "Retrieval Augmented Generation (RAG) system architecture and components"

    Original Query: "MinIO"
    Rewritten Query: "MinIO S3 compatible storage setup, configuration, and document handling"

    Original Query: "Document processing"
    Rewritten Query: "PDF document ingestion, text extraction, chunking, and embedding generation process"

    Original Query: "{query}"
    Rewritten Query:"""
    model_name: str

    @observe(name="QueryRewriterBlock", as_type="generation")
    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        query = input_data.get("query", "")
        if not query:
            raise ValueError("Input data must contain a 'query' field")


        client = OpenRouterClient()
        try:
            rewritten_query = ""
            async for chunk in client.chat_completion_stream(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self.prompt_template},
                    {"role": "user", "content": query},
                ],
            ):
                rewritten_query += chunk
            return {**input_data, "query": rewritten_query.strip()}
            
        finally:
            await client.close()
