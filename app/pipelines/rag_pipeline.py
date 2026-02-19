import json
from typing import Any, AsyncGenerator, Dict, Optional, Union

from langfuse import get_client, observe
from pydantic import Field

from app.blocks.answer_block import AnswerGenerationBlock
from app.blocks.base_block import BaseBlock
from app.blocks.query_block import QueryBlock
from app.blocks.retrieve_block import RetrieveBlock

langfuse = get_client()


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

    @observe(name="Pipeline Execution")
    async def execute(
        self, input_data: Union[Dict[str, Any], str]
    ) -> AsyncGenerator[str, None]:
        if not self.blocks:
            raise ValueError("No blocks configured")

        data = input_data

        for block in self.blocks[:-1]:
            data = await block.run(data)

        last_block = self.blocks[-1]
        async for chunk in last_block.run(data):
            yield chunk

        print("Pipeline execution completed")
        # debug information
        import json

        print("Final output:", json.dumps(data, indent=2))

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

    pipeline.add_block(QueryBlock(name="query_block")).add_block(
        RetrieveBlock(
            name="retrieve_block", collection_name=collection_name, top_k=top_k
        )
    ).add_block(AnswerGenerationBlock(name="answer_block", model_name=model_name))

    return pipeline


def create_pipeline_from_json(json_input: Union[str, Dict[str, Any]]) -> RagPipeline:
    if isinstance(json_input, str):
        config = json.loads(json_input)
    else:
        config = json_input

    pipeline_name = config.get("pipeline_name", "rag_pipeline")
    pipeline = RagPipeline(name=pipeline_name)

    blocks_config = config.get("blocks", [])

    for block_config in blocks_config:
        block_type = block_config.get("type", "").lower()
        block_name = block_config.get("name", f"block_{len(pipeline.blocks)}")

        if block_type == "query":
            pipeline.add_block(QueryBlock(name=block_name))

        elif block_type == "retrieve":
            pipeline.add_block(
                RetrieveBlock(
                    name=block_name,
                    collection_name=block_config.get(
                        "collection_name", "genrag_knowledge_base"
                    ),
                    top_k=block_config.get("top_k", 5),
                )
            )

        elif block_type == "answer":
            # Build kwargs only with non-None values to avoid validation errors
            answer_kwargs = {
                "name": block_name,
                "model_name": block_config.get("model", "deepseek/deepseek-v3.2"),
            }
            if block_config.get("temperature") is not None:
                answer_kwargs["temperature"] = block_config["temperature"]
            if block_config.get("max_tokens") is not None:
                answer_kwargs["max_tokens"] = block_config["max_tokens"]
            if block_config.get("system_prompt") is not None:
                answer_kwargs["system_prompt"] = block_config["system_prompt"]

            pipeline.add_block(AnswerGenerationBlock(**answer_kwargs))

    return pipeline


@observe(name="RAG Pipeline Request")
async def execute_query_from_json(
    json_input: Union[str, Dict[str, Any]],
) -> AsyncGenerator[str, None]:
    if isinstance(json_input, str):
        config = json.loads(json_input)
    else:
        config = json_input

    # Update trace metadata with the JSON config
    langfuse.update_current_trace(metadata={"config": config})

    pipeline = create_pipeline_from_json(config.get("pipeline", {}))
    query = config.get("query", "")

    async for chunk in pipeline.execute({"query": query}):
        yield chunk
