from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict


class BlockConfig(BaseModel):
    type: str
    name: str
    collection_name: Optional[str] = "genrag_knowledge_base"
    top_k: Optional[int] = 5
    model: Optional[str] = "deepseek/deepseek-v3.2"
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    system_prompt: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"type": "query", "name": "query"},
                {"type": "retrieve", "name": "retrieve", "collection_name": "genrag_knowledge_base", "top_k": 5},
                {"type": "answer", "name": "answer", "model": "deepseek/deepseek-v3.2"}
            ]
        }
    }


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
                        {"type": "retrieve", "name": "retrieve", "collection_name": "genrag_knowledge_base", "top_k": 5},
                        {"type": "answer", "name": "answer", "model": "deepseek/deepseek-v3.2"}
                    ]
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
                            {"type": "retrieve", "name": "retrieve", "collection_name": "genrag_knowledge_base", "top_k": 5},
                            {"type": "answer", "name": "answer", "model": "deepseek/deepseek-v3.2"}
                        ]
                    },
                    "query": "What is RAG?",
                    "org_id": None
                }
            ]
        }
    }


class RagResponse(BaseModel):
    query: str
    answer: str