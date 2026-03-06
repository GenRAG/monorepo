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


class RagPipeline(BaseBlock): # Orchestrates the execution of RAG pipeline blocks
    blocks: list[BaseBlock] = Field(default_factory=list) # Ordered list of blocks in the pipeline

    def add_block(self, block: BaseBlock) -> "RagPipeline": # Adds a block to the pipeline
        self.blocks.append(block)
        return self

    def remove_block(self, block_name: str) -> "RagPipeline": # Removes a block from the pipeline by name
        self.blocks = [b for b in self.blocks if b.name != block_name]
        return self

    def get_block(self, block_name: str) -> Optional[BaseBlock]: # Retrieves a block by its name
        for block in self.blocks:
            if block.name == block_name:
                return block
        return None

    def list_blocks(self) -> list[str]: # Lists the names of all blocks in order
        return [block.name for block in self.blocks]

    def clear_blocks(self) -> "RagPipeline": # Clears all blocks from the pipeline
        self.blocks.clear()
        return self

    @observe(name="Pipeline Execution")
    async def execute( # Executes the RAG pipeline with streaming output
        self, input_data: Union[Dict[str, Any], str]
    ) -> AsyncGenerator[str, None]:
        if not self.blocks:
            raise ValueError("No blocks configured")

        data = input_data
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                data = {"query": data} # Assume string is a query if not JSON

        # Run all blocks except the last one; they transform data
        for block in self.blocks[:-1]:
            print(f"Running block: {block.name}")
            data = await block.run(data)

        # The last block is expected to be a streaming block
        last_block = self.blocks[-1]
        print(f"Running last block: {last_block.name} (streaming)")
        async for chunk in last_block.run(data):
            yield chunk

        print("Pipeline execution completed")
        # Final output print commented as streaming handles this, tracing should capture overall state
        # print("Final output:", json.dumps(data, indent=2))

    async def run(self, input_data: Union[Dict[str, Any], str]) -> Dict[str, Any]: # Executes pipeline as a non-streaming block
        if not self.blocks:
            raise ValueError("No blocks configured")

        data = input_data
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                data = {"query": data} # Assume string is a query if not JSON

        # Run all blocks sequentially, passing data along
        for block in self.blocks:
            data = await block.run(data)
        return data


def create_pipeline_from_json(pipeline_config: PipelineConfig, org_id: Optional[str] = None) -> RagPipeline: # Creates a RagPipeline from configuration
    pipeline_name = pipeline_config.pipeline_name
    pipeline = RagPipeline(name=pipeline_name)

    # Instantiate blocks dynamically based on their type in the config
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
                    org_id=org_id,
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
            # Add optional parameters only if provided in config
            if block_config.temperature is not None:
                answer_kwargs["temperature"] = block_config.temperature
            if block_config.max_tokens is not None:
                answer_kwargs["max_tokens"] = block_config.max_tokens
            if block_config.system_prompt is not None:
                answer_kwargs["system_prompt"] = block_config.system_prompt

            pipeline.add_block(AnswerGenerationBlock(**answer_kwargs))

    return pipeline


@observe(name="RAG Pipeline Request")
async def execute_query_from_json( # Main entry for executing RAG pipeline from JSON config
    json_input: Union[str, Dict[str, Any]],
) -> AsyncGenerator[str, None]:
    if isinstance(json_input, str):
        config = json.loads(json_input)
    else:
        config = json_input

    org_id = config.get("org_id")

    # Update tracing metadata with the pipeline configuration
    langfuse.update_current_trace(metadata={"config": config})

    # Validate and build the pipeline
    pipeline_config = PipelineConfig.model_validate(config.get("pipeline", {}))
    pipeline = create_pipeline_from_json(pipeline_config, org_id)
    query = config.get("query", "")
    chat_history = config.get("chat_history", [])
    original_query = query # Store the original query

    # Execute the pipeline and yield streaming output
    async for chunk in pipeline.execute({"query": query, "org_id": org_id, "original_query": original_query, "chat_history": chat_history}):
        yield chunk
