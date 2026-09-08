from pydantic import BaseModel, Field
from typing import Optional, List, Union, Literal, Annotated


class BaseBlockConfig(BaseModel): # Base configuration for all RAG pipeline blocks
    type: str # Discriminator field for block type
    name: str # Unique name for the block instance

class QueryBlockConfig(BaseBlockConfig): # Configuration for a simple query block
    type: Literal["query"] = "query" # Literal type for Pydantic discrimination

class QueryRewriterBlockConfig(BaseBlockConfig): # Configuration for a query rewriter block
    type: Literal["query_rewrite"] = "query_rewrite" # Literal type for Pydantic discrimination
    model_name: Optional[str] = "google/gemini-2.5-flash" # LLM model for query rewriting

class RefusalBlockConfig(BaseBlockConfig):  # Configuration for a refusal block
    type: Literal["refusal"] = "refusal"  # Literal type for Pydantic discrimination
    model_name: Optional[str] = "google/gemini-2.5-flash"  # LLM model for routing

class RetrieveBlockConfig(BaseBlockConfig): # Configuration for a retrieval block
    type: Literal["retrieve"] = "retrieve" # Literal type for Pydantic discrimination
    collection_name: Optional[str] = "genrag_knowledge_base" # Qdrant collection to query
    top_k: Optional[int] = 5 # Number of top results to retrieve

class RerankBlockConfig(BaseBlockConfig): # Configuration for a reranking block
    type: Literal["rerank"] = "rerank" # Literal type for Pydantic discrimination
    provider: Optional[str] = "zeroentropy" # Reranking service provider (e.g., zeroentropy or cohere)
    model: Optional[str] = "zerank-2" # Reranking model to use
    top_k: Optional[int] = 5 # Number of top documents to return after reranking

class AnswerGenerationBlockConfig(BaseBlockConfig): # Configuration for an answer generation block
    type: Literal["answer"] = "answer" # Literal type for Pydantic discrimination
    model: Optional[str] = "google/gemini-2.5-flash" # LLM model for answer generation
    temperature: Optional[float] = None # Controls randomness of generation
    max_tokens: Optional[int] = None # Maximum tokens in the generated answer
    system_prompt: Optional[str] = None # Optional system prompt for the LLM

class VerifiedAnswerBlockConfig(BaseBlockConfig):
    type: Literal["verified_answer"] = "verified_answer"
    model: Optional[str] = "google/gemini-2.5-flash"
    judge_model: Optional[str] = "google/gemini-2.5-flash"
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

BlockConfig = Annotated[ # Discriminated union of all possible block configurations
    Union[
        QueryBlockConfig,
        QueryRewriterBlockConfig,
        RetrieveBlockConfig,
        RerankBlockConfig,
        AnswerGenerationBlockConfig,
        RefusalBlockConfig,
        VerifiedAnswerBlockConfig,
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
                            "collection_name": "genrag_knowledge_base",
                            "top_k": 5,
                        },
                        {
                            "type": "answer",
                            "name": "answer",
                            "model": "google/gemini-2.5-flash",
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
    org_id: Optional[str] = None # Org ID for multi-tenant data isolation
    chat_history: List[Message] = Field(default_factory=list) # Optional chat history to provide context for the query

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
                                "collection_name": "genrag_knowledge_base",
                                "top_k": 5,
                            },
                            {
                                "type": "answer",
                                "name": "answer",
                                "model": "google/gemini-2.5-flash",
                            },
                        ],
                    },
                    "query": "What is RAG?",
                    "org_id": None,
                }
            ]
        }
    }


class RagResponse(BaseModel): # Represents the expected structure of a RAG query response
    query: str # The original query made
    answer: str # The generated answer from the RAG pipeline
