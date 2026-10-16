import json
import re
import uuid
from typing import Any, AsyncGenerator, Dict, Optional, Union

from langfuse import get_client, observe, propagate_attributes
from pydantic import Field

from app.blocks.answer_block import AnswerGenerationBlock
from app.blocks.base_block import BaseBlock
from app.blocks.query_block import QueryBlock
from app.blocks.retrieve_block import RetrieveBlock
from app.blocks.rerank_block import RerankBlock
from app.blocks.query_rewriter_block import QueryRewriterBlock
from app.blocks.refusal_block import RefusalBlock
from app.blocks.verified_answer_block import VerifiedAnswerBlock
from app.blocks.hyde_block import HydeBlock

from app.schemas.rag import (
    BlockConfig,
    QueryBlockConfig,
    QueryRewriterBlockConfig,
    RetrieveBlockConfig,
    RerankBlockConfig,
    AnswerGenerationBlockConfig,
    RefusalBlockConfig,
    VerifiedAnswerBlockConfig,
    HydeBlockConfig,
    PipelineConfig,
)
from app.services.cost_tracker import cost_tracker, CapturingCostTracker


langfuse = get_client()


def _build_sources(documents: list) -> list[Dict[str, Any]]:
    """Groups retrieved chunks by source file and assigns each unique document a
    stable citation index (1..N), so what the model can cite matches 1:1 with
    what the client displays as "sources" — never a per-chunk or Qdrant-ID number.
    Keyed on (dataset_id, filename): the same filename in two datasets is two sources.
    """
    sources: list[Dict[str, Any]] = []
    by_filename: Dict[tuple, Dict[str, Any]] = {}

    for doc in documents:
        filename = doc.get("filename", "Source inconnue")
        key = (doc.get("dataset_id"), filename)
        entry = by_filename.get(key)
        if entry is None:
            entry = {
                "index": len(sources) + 1,
                "title": filename,
                "dataset_id": doc.get("dataset_id"),
                "score": doc.get("confidence_score", doc.get("score")),
                "text_preview": (doc.get("text", "") or "")[:200],
                "chunks": [],
            }
            by_filename[key] = entry
            sources.append(entry)
        else:
            # Keep the highest score seen across this document's chunks.
            new_score = doc.get("confidence_score", doc.get("score"))
            if new_score is not None and (entry["score"] is None or new_score > entry["score"]):
                entry["score"] = new_score
        entry["chunks"].append(doc.get("text", ""))

    return sources


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
            yield json.dumps({"type": "status", "data": f"Running block: {block.name}"}) + "\n"
            data = await block.run(data)
            yield json.dumps({"type": "status", "data": f"{block.name} completed"}) + "\n"

        # Deduplicate retrieved documents by source file and assign each unique
        # document a stable, code-controlled citation index (1..N). This index is
        # what gets embedded in the prompt (see AnswerGenerationBlock._format_documents),
        # so the model can only ever cite a document we actually gave it — no drift,
        # no chunk-level numbering leaking into a user-facing "3 documents" list.
        sources = []
        if isinstance(data, dict) and "retrieved_documents" in data:
            sources = _build_sources(data["retrieved_documents"])
            data = {**data, "_sources": sources}
            yield json.dumps({"type": "sources", "data": [
                {k: v for k, v in s.items() if k != "chunks"} for s in sources
            ]}) + "\n"

        # The last block is expected to be a streaming block
        yield json.dumps({"type": "status", "data": "Generating answer..."}) + "\n"
        last_block = self.blocks[-1]
        print(f"Running last block: {last_block.name} (streaming)")
        answer_text_parts: list[str] = []
        async for chunk in last_block.run(data):
            try:
                parsed = json.loads(chunk)
            except (json.JSONDecodeError, TypeError):
                parsed = None
            if isinstance(parsed, dict) and parsed.get("type") == "token":
                answer_text_parts.append(parsed.get("data", ""))
            yield chunk

        # Validate which of the given sources were actually cited (e.g. "[1]", "[2]")
        # in the generated answer. This can't prevent an out-of-range citation from
        # being streamed, but it lets the client know afterwards which citations are
        # trustworthy vs. hallucinated, and which sources to actually display.
        if sources:
            full_answer = "".join(answer_text_parts)
            valid_indices = {s["index"] for s in sources}
            cited_indices = {int(n) for n in re.findall(r"\[(\d+)\]", full_answer)}
            actually_cited = sorted(cited_indices & valid_indices)
            # Include the source objects themselves (title, score, etc.), not just
            # the raw indices, so the client can render "documents actually used"
            # without having to cross-reference back to the earlier `sources` event.
            cited_sources = [
                {k: v for k, v in s.items() if k != "chunks"}
                for s in sources if s["index"] in actually_cited
            ]
            yield json.dumps({"type": "citation_check", "data": {
                "cited_indices": actually_cited,
                "invalid_indices": sorted(cited_indices - valid_indices),
                "cited_sources": cited_sources,
            }}) + "\n"

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
                    top_k=block_config.top_k,
                    org_id=org_id,
                    dataset_ids=block_config.dataset_ids,
                )
            )

        elif block_type == "rerank":
            # Hardcoded config — ignores whatever the user passes.
            pipeline.add_block(
                RerankBlock(
                    name="rerank",
                    provider="zeroentropy",
                    model="zerank-2",
                    top_k=10,
                )
            )

        elif block_type == "query_rewrite":
            assert isinstance(block_config, QueryRewriterBlockConfig)
            rewrite_kwargs = {
                "name": block_name,
                "model_name": block_config.model_name,
            }
            if block_config.temperature is not None:
                rewrite_kwargs["temperature"] = block_config.temperature
            if block_config.max_tokens is not None:
                rewrite_kwargs["max_tokens"] = block_config.max_tokens
            if block_config.system_prompt is not None:
                rewrite_kwargs["system_prompt"] = block_config.system_prompt
            if block_config.overwrite_query is not None:
                rewrite_kwargs["overwrite_query"] = block_config.overwrite_query
            if block_config.num_queries is not None:
                rewrite_kwargs["num_queries"] = block_config.num_queries

            pipeline.add_block(QueryRewriterBlock(**rewrite_kwargs))

        elif block_type == "refusal":
            assert isinstance(block_config, RefusalBlockConfig)
            pipeline.add_block(
                RefusalBlock(
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

        elif block_type == "verified_answer":
            assert isinstance(block_config, VerifiedAnswerBlockConfig)
            verified_kwargs = {
                "name": block_name,
                "model_name": block_config.model,
                "judge_model_name": block_config.judge_model,
            }
            if block_config.temperature is not None:
                verified_kwargs["temperature"] = block_config.temperature
            if hasattr(block_config, "max_tokens") and block_config.max_tokens is not None:
                verified_kwargs["max_tokens"] = block_config.max_tokens
            if block_config.system_prompt is not None:
                verified_kwargs["system_prompt"] = block_config.system_prompt

            pipeline.add_block(VerifiedAnswerBlock(**verified_kwargs))
        elif block_type == "hyde":
            assert isinstance(block_config, HydeBlockConfig)
            hyde_kwargs = {
                "name": block_name,
                "model_name": block_config.model,
            }
            if block_config.num_queries is not None:
                hyde_kwargs["num_queries"] = block_config.num_queries
            if block_config.mode is not None:
                hyde_kwargs["mode"] = block_config.mode
            if block_config.system_prompt is not None:
                hyde_kwargs["prompt_template"] = block_config.system_prompt
            pipeline.add_block(HydeBlock(**hyde_kwargs))
        else:
            raise ValueError(f"Unsupported block type: {block_type}")

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
    if hasattr(langfuse, "update_current_trace"):
        langfuse.update_current_trace(metadata={"config": config})

    # Validate and build the pipeline
    pipeline_config = PipelineConfig.model_validate(config.get("pipeline", {}))
    pipeline = create_pipeline_from_json(pipeline_config, org_id)
    query = config.get("query", "")
    chat_history = config.get("chat_history", [])
    original_query = query # Store the original query

    # Inject cost tracking context into pipeline data
    pipeline_run_id = str(uuid.uuid4())

    # Create a per-request capturing tracker (concurrency-safe)
    capturing_tracker = CapturingCostTracker()

    enriched_data = {
        "query": query,
        "org_id": org_id,
        "original_query": original_query,
        "chat_history": chat_history,
        "_cost_tracker": capturing_tracker,  # NOT the global singleton
        "_pipeline_run_id": pipeline_run_id,
    }

    # Execute the pipeline and yield streaming output
    try:
        async for chunk in pipeline.execute(enriched_data):
            yield chunk
    except Exception as e:
        import traceback
        error_msg = f"\n\n[Pipeline Error: {type(e).__name__}: {e}]"
        print(error_msg)
        traceback.print_exc()
        yield json.dumps({"type": "error", "data": error_msg}) + "\n"

    # --- Cost logging (server-side) ---
    records = capturing_tracker.records

    if records:
        # Log per-block breakdown
        block_costs: dict[str, float] = {}
        block_costs_raw: dict[str, str] = {}  # Track raw strings for display
        for r in records:
            name = r.block_name or "unknown"
            block_costs[name] = block_costs.get(name, 0.0) + r.cost_usd
            # Keep the raw cost string for accurate display
            if r.cost_usd_raw:
                block_costs_raw[name] = r.cost_usd_raw

        print("\n=== COST BREAKDOWN BY BLOCK ===")
        for block_name, cost in sorted(block_costs.items()):
            # Display raw string if available, otherwise formatted float
            if block_name in block_costs_raw:
                print(f"  {block_name}: ${block_costs_raw[block_name]} (raw)")
            else:
                print(f"  {block_name}: ${cost:.10f}")

        # Log total with full precision
        summary = capturing_tracker.get_summary()
        print(f"  TOTAL: ${summary.total_cost_usd:.10f}")
        print("=" * 40)

        # Yield cost summary to client
        yield json.dumps({"type": "cost_summary", "data": summary.model_dump()}) + "\n"
