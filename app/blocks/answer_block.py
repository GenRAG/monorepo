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
        default=(
            "You are an expert, friendly, and highly capable AI assistant for a Retrieval-Augmented Generation (RAG) system. "
            "Your goal is to help the user explore documents, extract insights, and answer questions. "
            "Rules: "
            "1. When answering factual inquiries, rely exclusively on the provided documents and the chat history. "
            "2. When the user initiates a greeting or conversational remark, respond warmly and naturally. "
            "NEVER use robotic disclaimers like 'As an AI...'. "
            "3. Do NOT force a greeting (like 'I'm doing great') if the user is asking a follow-up question or continuing the conversation. "
            "4. Pay close attention to the chat history to accurately answer questions about past interactions in this conversation."
        )
    ) # Instruction for the LLM

    @observe(name="AnswerGenerationBlock", as_type="generation")
    async def run(
        self, input_data: Union[Dict[str, Any], str]
    ) -> AsyncGenerator[str, None]: # Generates and streams answers based on query and docs
        # Extract query and retrieved documents from input data
        if isinstance(input_data, dict):
            # When answering we want to answer the final rewritten query if one exists,
            # but sometimes users ask highly specific questions like "can you repeat the last sentence"
            # which might have been garbled by the rewriter. For now we use the `query` provided
            # by the pipeline (likely rewritten). We also extract the original query.
            query = input_data.get("query", "")
            original_query = input_data.get("original_query", query)
            retrieved_docs = input_data.get("retrieved_documents", [])
            chat_history = input_data.get("chat_history", [])
        else:
            query = str(input_data)
            original_query = query
            retrieved_docs = []
            chat_history = []

        # Construct messages for the LLM chat completion
        messages = [
            {"role": "system", "content": self.system_prompt},
        ]

        for msg in chat_history:
            # OpenRouter / most LLMs expect role and content.
            # Convert system messages in history to basic user/assistant format if needed,
            # but assuming standard user/assistant roles from your app.
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

        messages.append({
            "role": "user",
            "content": f"Based on the documents below and the chat history above, please answer this question: {original_query}\n\nDocuments: {self._format_documents(retrieved_docs)}\n\nAnswer:",
        })

        print("Messages sent to LLM for answer generation:")
        print(messages)

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
