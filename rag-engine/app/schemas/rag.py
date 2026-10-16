import re

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, Union, Literal, Annotated

# Org and dataset IDs end up in Qdrant collection names (org_{org_id}) and
# MinIO keys ({org_id}/{dataset_id}/...), so they're restricted to a safe
# charset (covers cuid/uuid/slug IDs from the backend).
ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,128}$")
MAX_DATASETS_PER_RETRIEVAL = 50


def _validate_id(kind: str, value: str) -> str:
    if not isinstance(value, str) or not ID_PATTERN.match(value):
        raise ValueError(f"Invalid {kind} '{value}': expected 1-128 chars of [A-Za-z0-9_-]")
    return value


def validate_dataset_id(dataset_id: str) -> str:
    return _validate_id("dataset id", dataset_id)


def validate_org_id(org_id: str) -> str:
    return _validate_id("org id", org_id)


def _reject_batch_model(model_id: Optional[str]) -> Optional[str]:
    """OpenRouter/OpenAI ":batch" variants are the async batch API (results
    delivered up to 24h later, not real-time) -- picking one for a block in
    the /rag/stream pipeline would silently stall the stream instead of
    producing tokens, so it's rejected at request validation time rather
    than left to fail (or hang) mid-stream."""
    if model_id and model_id.endswith(":batch"):
        raise ValueError(
            f"Model '{model_id}' is a batch-API variant and cannot be used for streaming."
        )
    return model_id


class BaseBlockConfig(BaseModel): # Base configuration for all RAG pipeline blocks
    type: str # Discriminator field for block type
    name: str # Unique name for the block instance

class QueryBlockConfig(BaseBlockConfig): # Configuration for a simple query block
    type: Literal["query"] = "query" # Literal type for Pydantic discrimination

class QueryRewriterBlockConfig(BaseBlockConfig): # Configuration for a query rewriter block
    type: Literal["query_rewrite"] = "query_rewrite" # Literal type for Pydantic discrimination
    model_name: Optional[str] = "qwen/qwen3.7-flash" # LLM model for query rewriting
    temperature: Optional[float] = None  # Controls rewrite creativity (0 = strict, higher = more diverse)
    max_tokens: Optional[int] = None  # Max tokens for the rewritten query
    system_prompt: Optional[str] = None  # Custom system prompt override
    overwrite_query: Optional[bool] = True  # True=use rewrite for retrieval AND answer, False=retrieval only
    num_queries: Optional[int] = 1  # Number of query variations to generate (1 = single rewrite, >1 = multi-query expansion)

    _validate_model_name = field_validator("model_name")(_reject_batch_model)

class RefusalBlockConfig(BaseBlockConfig):  # Configuration for a refusal block
    type: Literal["refusal"] = "refusal"  # Literal type for Pydantic discrimination
    model_name: Optional[str] = "qwen/qwen3.7-flash"  # LLM model for routing

    _validate_model_name = field_validator("model_name")(_reject_batch_model)

class RetrieveBlockConfig(BaseBlockConfig): # Configuration for a retrieval block
    model_config = ConfigDict(populate_by_name=True)  # Accept both "datasetIds" and "dataset_ids"

    type: Literal["retrieve"] = "retrieve" # Literal type for Pydantic discrimination
    # No collection_name: the Qdrant collection is always derived server-side
    # from the request's org_id (org_{org_id}), never chosen by the caller.
    top_k: Optional[int] = Field(default=5, ge=1, le=100) # Number of top results to retrieve (across all selected datasets)
    # Datasets to search, combined into a single ranking. None = every dataset
    # of the org; [] = no dataset selected, so nothing is retrieved.
    dataset_ids: Optional[List[str]] = Field(default=None, alias="datasetIds")

    @field_validator("dataset_ids")
    @classmethod
    def _validate_dataset_ids(cls, value: Optional[List[str]]) -> Optional[List[str]]:
        if value is None:
            return None
        deduped = list(dict.fromkeys(validate_dataset_id(v) for v in value))
        if len(deduped) > MAX_DATASETS_PER_RETRIEVAL:
            raise ValueError(f"At most {MAX_DATASETS_PER_RETRIEVAL} datasetIds per retrieve block")
        return deduped

class RerankBlockConfig(BaseBlockConfig): # Configuration for a reranking block
    type: Literal["rerank"] = "rerank" # Literal type for Pydantic discrimination
    provider: Optional[str] = "zeroentropy" # Reranking service provider (e.g., zeroentropy or cohere)
    model: Optional[str] = "zerank-2" # Reranking model to use
    top_k: Optional[int] = 5 # Number of top documents to return after reranking

class AnswerGenerationBlockConfig(BaseBlockConfig): # Configuration for an answer generation block
    type: Literal["answer"] = "answer" # Literal type for Pydantic discrimination
    model: Optional[str] = "qwen/qwen3.7-flash" # LLM model for answer generation
    temperature: Optional[float] = None # Controls randomness of generation
    max_tokens: Optional[int] = None # Maximum tokens in the generated answer
    system_prompt: Optional[str] = None # Optional system prompt for the LLM

    _validate_model = field_validator("model")(_reject_batch_model)

class VerifiedAnswerBlockConfig(BaseBlockConfig):
    type: Literal["verified_answer"] = "verified_answer"
    model: Optional[str] = "qwen/qwen3.7-flash"
    judge_model: Optional[str] = "qwen/qwen3.7-flash"
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    system_prompt: Optional[str] = None  # Custom system prompt override for generation

    _validate_model = field_validator("model")(_reject_batch_model)
    _validate_judge_model = field_validator("judge_model")(_reject_batch_model)

class HydeBlockConfig(BaseBlockConfig):
    type: Literal["hyde"] = "hyde"
    model: Optional[str] = "qwen/qwen3.7-flash"
    num_queries: Optional[int] = 1  # Number of hypothetical documents to generate
    mode: Optional[Literal["override", "compose"]] = "override"  # "override"=ignore _queries, "compose"=multiply across _queries
    system_prompt: Optional[str] = None  # Custom system prompt override for HyDE generation

    _validate_model = field_validator("model")(_reject_batch_model)


BlockConfig = Annotated[ # Discriminated union of all possible block configurations
    Union[
        QueryBlockConfig,
        QueryRewriterBlockConfig,
        RetrieveBlockConfig,
        RerankBlockConfig,
        AnswerGenerationBlockConfig,
        RefusalBlockConfig,
        VerifiedAnswerBlockConfig,
        HydeBlockConfig,
    ],
    Field(discriminator="type"), # Pydantic uses 'type' field to discriminate
]


class PipelineConfig(BaseModel): # Defines the overall structure of a RAG pipeline
    pipeline_name: Optional[str] = "rag_pipeline" # Optional name for the pipeline
    blocks: List[BlockConfig] # Ordered list of block configurations

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "pipeline_name": "custom_rag",
                    "blocks": [
                        {"type": "query", "name": "query"},
                        {
                            "type": "retrieve",
                            "name": "retrieve",
                            "datasetIds": ["dataset_rh", "dataset_marketing"],
                            "top_k": 5,
                        },
                        {
                            "type": "answer",
                            "name": "answer",
                            "model": "qwen/qwen3.7-flash",
                        },
                    ],
                }
            ]
        }
    }


class Message(BaseModel):
    role: str
    content: str


class RagRequest(BaseModel): # Represents the full request body for a RAG query
    pipeline: PipelineConfig # Configuration defining the RAG pipeline to execute
    query: str = Field(default="What is RAG?", examples=["What is RAG?"]) # Natural language query
    org_id: str # Org ID: selects the org's Qdrant collection and attributes costs (required)
    chat_history: List[Message] = Field(default_factory=list) # Optional chat history to provide context for the query

    _validate_org_id = field_validator("org_id")(validate_org_id)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "pipeline": {
                        "pipeline_name": "custom_rag",
                        "blocks": [
                            {"type": "query", "name": "query"},
                            {
                                "type": "retrieve",
                                "name": "retrieve",
                                "datasetIds": ["dataset_rh", "dataset_marketing"],
                                "top_k": 5,
                            },
                            {
                                "type": "answer",
                                "name": "answer",
                                "model": "qwen/qwen3.7-flash",
                            },
                        ],
                    },
                    "query": "What is RAG?",
                    "org_id": "org123",
                }
            ]
        }
    }


class RagResponse(BaseModel): # Represents the expected structure of a RAG query response
    query: str # The original query made
    answer: str # The generated answer from the RAG pipeline
