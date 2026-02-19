from pydantic import BaseModel, Field
from typing import Optional, List, Union, Literal, Annotated


class BaseBlockConfig(BaseModel):
    type: str
    name: str

class QueryBlockConfig(BaseBlockConfig):
    type: Literal["query"] = "query"

class QueryRewriterBlockConfig(BaseBlockConfig):
    type: Literal["query_rewrite"] = "query_rewrite"
    model_name: Optional[str] = "google/gemini-2.5-flash"

class RetrieveBlockConfig(BaseBlockConfig):
    type: Literal["retrieve"] = "retrieve"
    collection_name: Optional[str] = "genrag_knowledge_base"
    top_k: Optional[int] = 5

class RerankBlockConfig(BaseBlockConfig):
    type: Literal["rerank"] = "rerank"
    provider: Optional[str] = "zeroentropy"
    model: Optional[str] = "zerank-2"
    top_k: Optional[int] = 5

class AnswerGenerationBlockConfig(BaseBlockConfig):
    type: Literal["answer"] = "answer"
    model: Optional[str] = "google/gemini-2.5-flash"
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    system_prompt: Optional[str] = None

BlockConfig = Annotated[
    Union[
        QueryBlockConfig,
        QueryRewriterBlockConfig,
        RetrieveBlockConfig,
        RerankBlockConfig,
        AnswerGenerationBlockConfig,
    ],
    Field(discriminator="type"),
]


class PipelineConfig(BaseModel):
    pipeline_name: Optional[str] = "rag_pipeline"
    blocks: List[BlockConfig]

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


class RagRequest(BaseModel):
    pipeline: PipelineConfig
    query: str = Field(default="What is RAG?", examples=["What is RAG?"])
    org_id: Optional[str] = None

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


class RagResponse(BaseModel):
    query: str
    answer: str
