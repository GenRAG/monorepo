from typing import Union, Dict, Any, AsyncGenerator, Optional
from pydantic import Field
from langfuse import observe

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient


class AnswerGenerationBlock(BaseBlock):
    model_name: str
    temperature: Optional[float] = Field(default=0.7)
    max_tokens: Optional[int] = Field(default=500)
    system_prompt: str = Field(
        default="You are a helpful assistant. Use the provided documents to answer the question."
    )

    @observe(name="AnswerGenerationBlock", as_type="generation")
    async def run(self, input_data: Union[Dict[str, Any], str]) -> AsyncGenerator[str, None]:
        if isinstance(input_data, dict):
            query = input_data.get("query", "")
            retrieved_docs = input_data.get("retrieved_documents", [])
        else:
            query = str(input_data)
            retrieved_docs = []

        messages = [
            {"role": "system", "content": self.system_prompt},
            {
                "role": "user",
                "content": f"Question: {query}\n\nDocuments: {self._format_documents(retrieved_docs)}\n\nAnswer:"
            }
        ]

        client = OpenRouterClient()
        try:
            async for chunk in client.chat_completion_stream(
                model=self.model_name,
                messages=messages,
                temperature=self.temperature or 0.7,
                max_tokens=self.max_tokens or 150,
            ):
                yield chunk
        finally:
            await client.close()

    def _format_documents(self, documents: list) -> str:
        if not documents:
            return "No relevant documents found"

        formatted = []
        for i, doc in enumerate(documents, 1):
            text = doc.get("text", "")
            formatted.append(f"[Doc {i}]: {text[:500]}...")
        return "\n\n".join(formatted)
