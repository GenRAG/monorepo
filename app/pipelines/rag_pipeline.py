import json
from typing import Any, AsyncGenerator, Dict, Optional, Union

from langfuse import get_client, observe
from pydantic import Field

from app.blocks.answer_block import AnswerGenerationBlock
from app.blocks.base_block import BaseBlock
from app.blocks.query_block import QueryBlock
from app.blocks.retrieve_block import RetrieveBlock
from app.blocks.rerank_block import RerankBlock
from app.blocks.query_rewriter_block import QueryRewriterBlock

from app.schemas.rag import (
    BlockConfig,
    QueryBlockConfig,
    QueryRewriterBlockConfig,
    RetrieveBlockConfig,
    RerankBlockConfig,
    AnswerGenerationBlockConfig,
    PipelineConfig,
)


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
            print(f"Running block: {block.name}")
            data = await block.run(data)

        last_block = self.blocks[-1]
        print(f"Running block: {last_block.name}")
        async for chunk in last_block.run(data):
            yield chunk

        print("Pipeline execution completed")
        import json

        print("Final output:", json.dumps(data, indent=2))

    async def run(self, input_data: Union[Dict[str, Any], str]) -> Dict[str, Any]:
        if not self.blocks:
            raise ValueError("No blocks configured")

        data = input_data
        for block in self.blocks:
            data = await block.run(data)
        return data


def create_pipeline_from_json(pipeline_config: PipelineConfig) -> RagPipeline:
    pipeline_name = pipeline_config.pipeline_name
    pipeline = RagPipeline(name=pipeline_name)

    for block_config in pipeline_config.blocks:
        block_type = block_config.type
        block_name = block_config.name

        if block_type == "query":
            pipeline.add_block(QueryBlock(name=block_name))

        elif block_type == "retrieve":
            assert isinstance(block_config, RetrieveBlockConfig)
            pipeline.add_block(
                RetrieveBlock(
                    name=block_name,
                    collection_name=block_config.collection_name,
                    top_k=block_config.top_k,
                )
            )

        elif block_type == "rerank":
            assert isinstance(block_config, RerankBlockConfig)
            pipeline.add_block(
                RerankBlock(
                    name=block_name,
                    provider=block_config.provider,
                    model=block_config.model,
                    top_k=block_config.top_k,
                )
            )

        elif block_type == "query_rewrite":
            assert isinstance(block_config, QueryRewriterBlockConfig)
            pipeline.add_block(
                QueryRewriterBlock(
                    name=block_name,
                    model_name=block_config.model_name,
                )
            )

        elif block_type == "answer":
            assert isinstance(block_config, AnswerGenerationBlockConfig)
            answer_kwargs = {
                "name": block_name,
                "model_name": block_config.model,
            }
            if block_config.temperature is not None:
                answer_kwargs["temperature"] = block_config.temperature
            if block_config.max_tokens is not None:
                answer_kwargs["max_tokens"] = block_config.max_tokens
            if block_config.system_prompt is not None:
                answer_kwargs["system_prompt"] = block_config.system_prompt

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

    pipeline_config = PipelineConfig.model_validate(config.get("pipeline", {}))
    pipeline = create_pipeline_from_json(pipeline_config)
    query = config.get("query", "")

    async for chunk in pipeline.execute({"query": query}):
        yield chunk
