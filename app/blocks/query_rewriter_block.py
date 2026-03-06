"""
query_rewriter_block.py

This module defines the `QueryRewriterBlock`, a component of the RAG pipeline
that focuses on optimizing user queries. It uses a language model to rewrite,
expand, or clarify incoming queries, making them more effective for document
retrieval from a knowledge base.
"""

from typing import Any, Dict
from langfuse import observe

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient


class QueryRewriterBlock(BaseBlock): # Block for rewriting and optimizing user queries
    prompt_template: str = """ # Template for instructing the AI on how to rewrite queries
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
    5.  **Preserve Conversational Intent or Clear Questions**: If the user's query is just a conversational greeting (like 'Hello' or 'Thank you') OR if it is already a perfectly clear standalone question, output the original query exactly as is without rewriting it. Do not attempt to over-engineer an already good question or a simple greeting into a search query.

    Here are some examples:

    Original Query: "RAG"
    Rewritten Query: "Retrieval Augmented Generation (RAG) system architecture and components"

    Original Query: "MinIO"
    Rewritten Query: "MinIO S3 compatible storage setup, configuration, and document handling"

    Original Query: "Document processing"
    Rewritten Query: "PDF document ingestion, text extraction, chunking, and embedding generation process"

    Original Query: "{query}"
    Rewritten Query:"""
    model_name: str # The name of the LLM model to use for query rewriting

    @observe(name="QueryRewriterBlock", as_type="generation")
    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]: # Rewrites the input query using an LLM
        query = input_data.get("query", "")
        if not query:
            raise ValueError("Input data must contain a 'query' field")

        chat_history = input_data.get("chat_history", [])
        history_str = ""
        if chat_history:
            history_str = "\n".join([f"{msg.get('role', msg.get('role', 'user'))}: {msg.get('content', '')}" for msg in chat_history])

        system_prompt = self.prompt_template
        user_message_content = query

        if history_str:
            system_prompt += "\n\nConsider the following chat history to resolve any references or context:\n" + history_str
            user_message_content = f"Chat History:\n{history_str}\n\nCurrent Query:\n{query}\n\nRewrite the current query..."


        client = OpenRouterClient()
        try:
            rewritten_query = ""
            # Stream chunks from the LLM to build the rewritten query
            async for chunk in client.chat_completion_stream(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message_content},
                ],
            ):
                rewritten_query += chunk
            return {**input_data, "query": rewritten_query.strip()} # Return input data with the rewritten query

        finally:
            await client.close()
