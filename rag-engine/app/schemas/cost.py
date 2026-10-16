"""
cost.py

Pydantic schemas for cost tracking. Records capture per-API-call cost data
returned directly by OpenRouter (which already calculates cost in USD via
usage.total_cost / usage.prompt_cost / usage.completion_cost).
"""

from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel, Field


class CostRecord(BaseModel):
    """A single cost record representing one API call (embedding, LLM, or reranking)."""

    timestamp: datetime = Field(default_factory=datetime.utcnow)
    org_id: str
    model: str
    cost_type: str = Field(..., pattern=r"^(embedding|generation|reranking)$")
    provider: str = Field(default="openrouter")

    # Token counts (OpenRouter may provide these)
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

    # Cost in USD — for OpenRouter this is usage.total_cost returned by the API.
    # For reranking (Cohere/ZeroEntropy) it's an estimate.
    cost_usd: float = 0.0

    # Raw cost string from the API (e.g., "2e-08") — preserves full precision for billing.
    cost_usd_raw: str = Field(default="", description="Exact cost string from API, for accurate billing")

    # Correlation / traceability
    pipeline_run_id: str = Field(default="", description="Correlates all calls for one RAG pipeline request")
    request_id: str = Field(default="", description="Provider request/generation ID if available")

    # Reranking-specific (n_docs reranked)
    n_docs: int = 0

    # Block attribution
    block_name: str = Field(default="", description="Name of the pipeline block that generated this cost")


class CostSummary(BaseModel):
    """Aggregated cost breakdown."""

    total_cost_usd: float = 0.0
    total_cost_usd_raw: str = Field(default="", description="Exact total cost string from API for billing")
    by_model: Dict[str, float] = Field(default_factory=dict)
    by_type: Dict[str, float] = Field(default_factory=dict)
    by_model_and_type: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    by_block: Dict[str, float] = Field(
        default_factory=dict,
        description="Cost per pipeline block (block_name), e.g. distinguishes a rewrite block from an answer block even when they share the same model",
    )