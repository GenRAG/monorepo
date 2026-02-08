from pydantic import BaseModel
from typing import List, Optional, Union, AsyncGenerator
import inspect

from blocks.base_block import BaseBlock
from blocks.query_block import QueryBlock
from blocks.retrieve_block import RetrieveBlock
from simple_openrouter_client import OpenRouterClient


class AnswerGenerationBlock(BaseBlock):
    model_name: str
    temperature: float = None
    max_tokens: int = None

    async def run(self, input_data: dict) -> AsyncGenerator[str, None]:
        query = input_data.get("query", "") if isinstance(input_data, dict) else input_data
        
        retrieved_docs = input_data.get("retrieved_documents", [])
        
        client = OpenRouterClient()

        messages = [
            {"role": "system", "content": "You are a helpful assistant. Use the provided documents to answer the question."},
            {"role": "user", "content": f"Question: {query}\n\nDocuments: {retrieved_docs}\n\nAnswer:"}
        ]

        async for chunk in client.chat_completion_stream(
            model=self.model_name,
            messages=messages,
            temperature=self.temperature or 0.7,
            max_tokens=self.max_tokens or 150
        ):
            yield chunk["choices"][0]["delta"].get("content", "")
            


class RagChain(BaseBlock):
    blocks: List[BaseBlock] = []

    def add_block(self, block: BaseBlock):
        self.blocks.append(block)

    def remove_block(self, block_name: str):
        self.blocks = [block for block in self.blocks if block.name != block_name]

    def get_block(self, block_name: str) -> Optional[BaseBlock]:
        for block in self.blocks:
            if block.name == block_name:
                return block
        return None
    
    def list_blocks(self) -> List[str]:
        return [block.name for block in self.blocks]
    
    def clear_blocks(self):
        self.blocks = []

    async def execute_chain(self, input_data: Union[str, dict]) -> AsyncGenerator[str, None]:
        data = input_data

        # Run all blocks except the last
        for block in self.blocks[:-1]:
            print(f"Executing block: {block.name}")
            data = await block.run(data)

        # Last block: return its async generator directly
        last_block = self.blocks[-1]
        print(f"Executing block: {last_block.name}")
        async for chunk in last_block.run(data):
            yield chunk
    
    # Optional: if you want a non-streaming version
    async def run(self, input_data: Union[str, dict]) -> dict:
        """Run synchronously (fully resolve) — not for streaming."""
        data = input_data
        for block in self.blocks:
            data = await block.run(data)
        return data


async def main():
    query_block = QueryBlock(name="QueryBlock1", description="Handles user queries")
    retrieve_block = RetrieveBlock(name="RetrieveBlock1", description="Retrieves relevant documents", top_k=5, index_name="genrag_knowledge_base")
    answer_block = AnswerGenerationBlock(name="AnswerBlock1", description="Generates answers", model_name="deepseek/deepseek-v3.2")

    rag_chain = RagChain(name="MyRagChain", description="A simple RAG chain")
    rag_chain.add_block(query_block)
    rag_chain.add_block(retrieve_block)
    rag_chain.add_block(answer_block)

    input_query = {"query": "Explique moi le concept de RAG"}

    # Execute chain -> returns a coroutine that resolves to an async generator
    stream_generator = rag_chain.run(input_query)

    # Now stream the tokens
    print("Answer: ", end="", flush=True)
    async for chunk in stream_generator:
        print(chunk, end="", flush=True)
    print()  # New line at end


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())