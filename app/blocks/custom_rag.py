from pydantic import BaseModel
from typing import List, Optional, Union, AsyncGenerator
import inspect

from blocks.base_block import BaseBlock
from blocks.query_block import QueryBlock
from blocks.retrieve_block import RetrieveBlock
from app.simple_openrouter_client import OpenRouterClient


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
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        ):
            if 'choices' in chunk:
                for choice in chunk['choices']:
                    if 'delta' in choice and 'content' in choice['delta']:
                        yield choice['delta']['content']


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
        return last_block.run(data)  # Returns async generator (not awaited!)
    
    # Optional: if you want a non-streaming version
    async def run(self, input_data: Union[str, dict]) -> dict:
        """Run synchronously (fully resolve) — not for streaming."""
        data = input_data
        for block in self.blocks:
            data = await block.run(data)
        return data


async def main():
    query_block = QueryBlock(name="QueryBlock1", description="Handles user queries")
    retrieve_block = RetrieveBlock(name="RetrieveBlock1", description="Retrieves relevant documents", top_k=5, index_name="AREA")
    answer_block = AnswerGenerationBlock(name="AnswerBlock1", description="Generates answers", model_name="openai/gpt-3.5-turbo")

    rag_chain = RagChain(name="MyRagChain", description="A simple RAG chain")
    rag_chain.add_block(query_block)
    rag_chain.add_block(retrieve_block)
    rag_chain.add_block(answer_block)

    input_query = {"query": "Explique moi le concept de RAG"}

    # Execute chain -> returns a coroutine that resolves to an async generator
    stream_generator = await rag_chain.execute_chain(input_query)

    # Now stream the tokens
    print("Answer: ", end="", flush=True)
    async for chunk in stream_generator:
        print(chunk, end="", flush=True)
    print()  # New line at end


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())