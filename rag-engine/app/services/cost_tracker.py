"""
cost_tracker.py

Stateless cost tracking service.
- Calculates costs from OpenRouter API responses
- Returns cost data in API responses
- No MinIO storage (Langfuse handles persistence)

OpenRouter returns cost in usage.cost field.
"""

from datetime import datetime
from typing import List, Optional

from app.schemas.cost import CostRecord, CostSummary
from app.config import settings

# French display labels for cost_type, used only when building the client-facing
# CostSummary (by_type / by_model_and_type). The internal cost_type field on
# CostRecord stays "embedding"/"generation"/"reranking" — it's validated by a
# pattern in schemas/cost.py and filtered on in app/routers/costs.py, so it must
# not change. This mapping matches the block names shown in the app so users
# recognize which pipeline step a cost belongs to.
COST_TYPE_LABELS_FR = {
    "generation": "réponse",
    "embedding": "recherche",
    "reranking": "classement",
}


def _cost_type_label(cost_type: str) -> str:
    return COST_TYPE_LABELS_FR.get(cost_type, cost_type)


# French display labels for by_block, used only when building the client-facing
# CostSummary. block_name is whatever string the pipeline config gives a block
# instance (e.g. "rewrite", "answer") — nothing in the blocks or config changes,
# this only renames the key at display time. Unrecognized names are passed
# through unchanged so a custom block_name never disappears from the summary.
BLOCK_NAME_LABELS_FR = {
    "query": "requête",
    "rewrite": "reformulation",
    "query_rewrite": "reformulation",
    "query_rewriter": "reformulation",
    "retrieve": "recherche",
    "retrieval": "recherche",
    "rerank": "classement",
    "reranking": "classement",
    "answer": "réponse",
    "generation": "réponse",
    "refusal": "refus",
    "hyde": "hyde",
    "verified_answer": "réponse vérifiée",
}

# Suffix labels for composite block_names like "<name>.judge" / "<name>.generation",
# used by VerifiedAnswerBlock to split its judge cost from its generation cost.
BLOCK_NAME_SUFFIX_LABELS_FR = {
    "judge": "juge",
    "generation": "génération",
}


def _block_label(block_name: str) -> str:
    if not block_name:
        return "inconnu"
    if "." in block_name:
        base, _, suffix = block_name.partition(".")
        base_label = BLOCK_NAME_LABELS_FR.get(base.lower(), base)
        suffix_label = BLOCK_NAME_SUFFIX_LABELS_FR.get(suffix.lower(), suffix)
        return f"{base_label} ({suffix_label})"
    return BLOCK_NAME_LABELS_FR.get(block_name.lower(), block_name)


class CostTracker:
    """Stateless cost tracker - calculates and returns costs.

    Usage:
        record = await cost_tracker.record(org_id="org-1", model="...", ...)
        # Use record.cost_usd in API response
    """

    async def record(
        self,
        org_id: str,
        model: str,
        cost_type: str,
        provider: str = "openrouter",
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        total_tokens: int = 0,
        cost_usd: float = 0.0,
        cost_usd_raw: str = "",  # Raw string from API for accurate billing
        pipeline_run_id: str = "",
        request_id: str = "",
        n_docs: int = 0,
        block_name: str = "",
    ) -> CostRecord:
        """Record a single cost entry and return it."""
        # If raw string not provided, convert the float to string
        if not cost_usd_raw:
            cost_usd_raw = str(cost_usd)

        return CostRecord(
            timestamp=datetime.utcnow(),
            org_id=org_id,
            model=model,
            cost_type=cost_type,
            provider=provider,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens or (prompt_tokens + completion_tokens),
            cost_usd=cost_usd,
            cost_usd_raw=cost_usd_raw,  # Store exact string from API
            pipeline_run_id=pipeline_run_id,
            request_id=request_id,
            n_docs=n_docs,
            block_name=block_name,
        )

    async def record_usage(
        self,
        org_id: str,
        model: str,
        usage: dict,
        cost_type: str,  # "generation", "embedding", etc. — caller specifies!
        provider: str = "openrouter",
        pipeline_run_id: str = "",
        request_id: str = "",
        block_name: str = "",
    ) -> CostRecord:
        """Unified method: record ANY cost from OpenRouter usage dict.

        Works for chat completions, embeddings, or any future API that returns
        a `usage` dict with `prompt_tokens`, `completion_tokens`, `cost`, etc.

        cost_type is specified by the caller (e.g., "generation", "embedding").
        """
        # Get the raw cost value from the API (could be float or scientific notation string)
        cost_raw = usage.get("cost", 0.0)
        cost_float = float(cost_raw)  # Convert to float for numeric storage

        # Store the raw string exactly as returned by the API
        cost_raw_str = str(cost_raw) if not isinstance(cost_raw, str) else cost_raw

        return await self.record(
            org_id=org_id,
            model=model,
            cost_type=cost_type,
            provider=provider,
            prompt_tokens=usage.get("prompt_tokens", 0),
            completion_tokens=usage.get("completion_tokens", 0),
            total_tokens=usage.get("total_tokens", 0),
            cost_usd=cost_float,
            cost_usd_raw=cost_raw_str,  # Store exact string from API
            pipeline_run_id=pipeline_run_id,
            request_id=request_id,
            block_name=block_name,
        )

    async def record_rerank(
        self,
        org_id: str,
        provider: str,
        model: str,
        n_docs: int,
        pipeline_run_id: str = "",
        block_name: str = "",
    ) -> CostRecord:
        """Convenience: record a reranking cost (estimated, not from OpenRouter).

        Cohere rerank pricing: ~$1.00 per 1000 units (1 unit = 1 doc reranked).
        ZeroEntropy: ~$0.50 per 1000 docs reranked.
        """
        if provider == "cohere":
            cost_per_doc = 0.001  # $1.00 / 1000 docs
        elif provider == "zeroentropy":
            cost_per_doc = 0.0005  # $0.50 / 1000 docs
        else:
            cost_per_doc = 0.0

        cost_usd = round(n_docs * cost_per_doc, 6)

        return await self.record(
            org_id=org_id,
            model=model,
            cost_type="reranking",
            provider=provider,
            cost_usd=cost_usd,
            n_docs=n_docs,
            pipeline_run_id=pipeline_run_id,
            block_name=block_name,
        )

    def calculate_summary(self, records: List[CostRecord]) -> CostSummary:
        """Calculate cost summary from a list of CostRecords."""
        total = 0.0
        total_raw_parts: list[str] = []  # Store raw strings for accurate billing
        by_model: dict = {}
        by_type: dict = {}
        by_model_and_type: dict = {}
        by_block: dict = {}

        for r in records:
            total += r.cost_usd
            if r.cost_usd_raw:
                total_raw_parts.append(r.cost_usd_raw)

            type_label = _cost_type_label(r.cost_type)

            by_model[r.model] = by_model.get(r.model, 0.0) + r.cost_usd
            by_type[type_label] = by_type.get(type_label, 0.0) + r.cost_usd

            mot = by_model_and_type.setdefault(r.model, {})
            mot[type_label] = mot.get(type_label, 0.0) + r.cost_usd

            block_key = _block_label(r.block_name)
            by_block[block_key] = by_block.get(block_key, 0.0) + r.cost_usd

        # For billing: provide the raw total as a precise string
        # We sum the float values (already precise) and convert to string
        total_raw_str = str(total) if not total_raw_parts else f"sum([{', '.join(total_raw_parts)}])"

        return CostSummary(
            total_cost_usd=total,  # Keep raw value, no rounding
            total_cost_usd_raw=total_raw_str,  # Exact string for billing
            by_model=by_model,  # Keep raw values
            by_type=by_type,  # Keep raw values
            by_model_and_type={
                k: {t: c for t, c in v.items()}
                for k, v in by_model_and_type.items()
            },
            by_block=by_block,
        )



class CapturingCostTracker(CostTracker):
    """Per-request cost tracker that captures all CostRecords locally.

    Concurrency-safe: each pipeline request creates its own instance.
    Blocks call the same methods they always have, but record() is
    overridden to capture each CostRecord into self.records.
    """

    def __init__(self):
        self.records: list[CostRecord] = []

    async def record(self, *args, **kwargs) -> CostRecord:
        record = await super().record(*args, **kwargs)
        if record:
            self.records.append(record)
        return record

    def get_summary(self) -> CostSummary:
        """Calculate summary from captured records."""
        return self.calculate_summary(self.records)


# Global singleton
cost_tracker = CostTracker()
