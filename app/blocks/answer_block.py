"""
answer_block.py

This module implements the `AnswerGenerationBlock`, a crucial part of the RAG pipeline
responsible for generating coherent and contextually relevant answers based on a user query
and retrieved documents. It utilizes an LLM for text generation with streaming support.
"""

from typing import Union, Dict, Any, AsyncGenerator, Optional
from pydantic import Field
from langfuse import observe

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient


class AnswerGenerationBlock(BaseBlock): # Block for generating answers using an LLM
    model_name: str # The name of the language model to use
    temperature: Optional[float] = Field(default=0.7) # Controls randomness in generation
    max_tokens: Optional[int] = Field(default=500) # Maximum tokens for the generated answer
    system_prompt: str = Field(
        default="You are a helpful assistant. Use the provided documents to answer the question."
    ) # Instruction for the LLM

    @observe(name="AnswerGenerationBlock", as_type="generation")
    async def run(
        self, input_data: Union[Dict[str, Any], str]
    ) -> AsyncGenerator[str, None]: # Generates and streams answers based on query and docs
        # Extract query and retrieved documents from input data
        if isinstance(input_data, dict):
            query = input_data.get("query", "")
            original_query = input_data.get("original_query", query)  # Use original_query if available
            retrieved_docs = input_data.get("retrieved_documents", [])
        else:
            query = str(input_data)
            original_query = query # If input is string, it's the original query
            retrieved_docs = []

        # Construct messages for the LLM chat completion
        messages = [
            {"role": "system", "content": self.system_prompt},
            {
                "role": "user",
                "content": f"Question: {query}\n\nDocuments: {self._format_documents(retrieved_docs)}\n\nAnswer:",
            },
        ]

        client = OpenRouterClient()
        try:
            # Stream chunks from the LLM chat completion
            async for chunk in client.chat_completion_stream(
                model=self.model_name,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
            ):
                yield chunk
        finally:
            await client.close()

    def _format_documents(self, documents: list) -> str: # Formats retrieved documents into a single string
        if not documents:
            return "No relevant documents found"

        formatted = []
        for doc in documents:
            text = doc.get("text", "")
            filename = doc.get("filename", "Unknown Source")
            formatted.append(f"Source: {filename}\nContent: {text}")
        return "\n\n".join(formatted)
