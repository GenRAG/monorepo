from typing import Union, Dict, Any, AsyncGenerator, Optional
from pydantic import Field

from app.blocks.base_block import BaseBlock
from app.blocks.query_block import QueryBlock
from app.blocks.retrieve_block import RetrieveBlock
from app.simple_openrouter_client import OpenRouterClient


class AnswerGenerationBlock(BaseBlock):
    model_name: str
    temperature: Optional[float] = Field(default=0.7)
    max_tokens: Optional[int] = Field(default=500)
    system_prompt: str = Field(
        default="You are a helpful assistant. Use the provided documents to answer the question."
    )

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
            return "No relevant documents found."

        formatted = []
        for i, doc in enumerate(documents, 1):
            text = doc.get("text", "")
            formatted.append(f"[Document {i}]: {text[:500]}...")
        return "\n\n".join(formatted)


class RagPipeline(BaseBlock):
    blocks: list[BaseBlock] = Field(default_factory=list)

    def add_block(self, block: BaseBlock) -> "RagPipeline":
        self.blocks.append(block)
        return self

    def remove_block(self, block_name: str) -> "RagPipeline":
        self.blocks = [b for b in self.blocks if b.name != block_name]
        return self

    def get_block(self, block_name: str) -> Optional[BaseBlock]:
        for block in self.blocks:
            if block.name == block_name:
                return block
        return None

    def list_blocks(self) -> list[str]:
        return [block.name for block in self.blocks]

    def clear_blocks(self) -> "RagPipeline":
        self.blocks.clear()
        return self

    async def execute(self, input_data: Union[Dict[str, Any], str]) -> AsyncGenerator[str, None]:
        if not self.blocks:
            raise ValueError("No blocks configured")

        data = input_data

        for block in self.blocks[:-1]:
            data = await block.run(data)

        last_block = self.blocks[-1]
        async for chunk in last_block.run(data):
            yield chunk

    async def run(self, input_data: Union[Dict[str, Any], str]) -> Dict[str, Any]:
        if not self.blocks:
            raise ValueError("No blocks configured")

        data = input_data
        for block in self.blocks:
            data = await block.run(data)
        return data


def create_simple_pipeline(
    collection_name: str = "genrag_knowledge_base",
    model_name: str = "deepseek/deepseek-v3.2",
    top_k: int = 5,
) -> RagPipeline:
    pipeline = RagPipeline(name="simple_rag_pipeline")

    pipeline.add_block(
        QueryBlock(name="query_block")
    ).add_block(
        RetrieveBlock(
            name="retrieve_block",
            collection_name=collection_name,
            top_k=top_k
        )
    ).add_block(
        AnswerGenerationBlock(
            name="answer_block",
            model_name=model_name
        )
    )

    return pipeline


def create_custom_pipeline(
    blocks: list[Dict[str, Any]],
    collection_name: str = "genrag_knowledge_base"
) -> RagPipeline:
    pipeline = RagPipeline(name="custom_rag_pipeline")

    for block_config in blocks:
        block_type = block_config.get("type", "").lower()
        block_name = block_config.get("name", f"block_{len(pipeline.blocks)}")

        if block_type == "query":
            pipeline.add_block(
                QueryBlock(name=block_name)
            )

        elif block_type == "retrieve":
            pipeline.add_block(
                RetrieveBlock(
                    name=block_name,
                    collection_name=block_config.get("collection_name", collection_name),
                    top_k=block_config.get("top_k", 5)
                )
            )

        elif block_type == "answer":
            pipeline.add_block(
                AnswerGenerationBlock(
                    name=block_name,
                    model_name=block_config.get("model", "deepseek/deepseek-v3.2"),
                    temperature=block_config.get("temperature"),
                    max_tokens=block_config.get("max_tokens"),
                    system_prompt=block_config.get("system_prompt")
                )
            )

    return pipeline


async def main():
    pipeline = create_simple_pipeline(
        collection_name="genrag_knowledge_base",
        model_name="deepseek/deepseek-v3.2",
        top_k=5
    )

    test_query = {"query": "Explique moi le concept de RAG"}

    print("Answer: ", end="", flush=True)
    async for chunk in pipeline.execute(test_query):
        print(chunk, end="", flush=True)
    print()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
