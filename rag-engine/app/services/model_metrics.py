"""
app/services/model_metrics.py

Turns raw OpenRouter model/endpoint data into a simple SMART/FAST/CHEAP badge
plus 0-100 quality/speed/economy scores, for chatbot model-picker UIs.

Quality and economy are scored as a percentile rank against the current
OpenRouter catalog: "you score better than X% of comparable models today".
A model that's genuinely #2 out of ~100 lands near 100 regardless of how
tightly or loosely the rest of the field is clustered -- a plain average/
std-dev comparison can understate an outlier if the middle of the pack is
densely packed. This self-calibrates as new models ship, unlike a fixed
threshold that goes stale (e.g. a $30/M model always scoring 0 just because
that happened to be the hardcoded ceiling).

Speed is also a percentile, but against *rank* rather than a raw value:
OpenRouter's /models endpoint can sort by throughput server-side but never
exposes the actual tok/s number per model (that's only in the expensive
per-model /endpoints sub-resource) -- so instead of fetching /endpoints for
the whole catalog, we fetch /models sorted by throughput once and use each
model's position in that order. A percentile only needs relative rank, not
the absolute value, so this is just as correct at a fraction of the cost.

Quality prefers a real Artificial Analysis benchmark when one exists, and
falls back to real production usage volume (tokens processed on OpenRouter
last month) when it doesn't -- "trusted enough to be used a lot in
practice" is a weaker, price/age-confounded signal than an actual capability
benchmark, so it's capped below the weakest benchmarked model's score
rather than competing with it. ":free" variants are excluded everywhere:
they're not usable for production clients (aggressive rate limits) and
their usage is inflated by being free rather than by being good.
"""

import math
from typing import Optional

LATENCY_LOW_MS = 1000       # < 1s -> "Low"
LATENCY_MEDIUM_MS = 3000    # 1-3s -> "Medium", above -> "High"


def _clamp(value: float, lo: float = 0, hi: float = 100) -> float:
    return max(lo, min(hi, value))


def _scale(value: float, lo: float, hi: float) -> float:
    """Map value (bounded by lo/hi) onto a 0-100 scale."""
    if hi == lo:
        return 0.0
    return _clamp((value - lo) / (hi - lo) * 100)


GENEROSITY_CURVE_EXPONENT = 0.5  # < 1 pushes mid-range scores up; see _percentile_score


def _percentile_score(value: float, population: list[float], invert: bool = False) -> float:
    """What percentage of the population this value is as good as or better
    than. invert=True for metrics where lower is better (price): a cheaper
    model scores higher the more expensive models it beats.

    A raw percentile guarantees ~50% of models land below 50 -- mathematically
    correct, but reads as "half the catalog is bad" when really they're just
    average. A sqrt curve pushes the median up (~50th percentile -> ~71)
    while still anchoring the worst model at 0 and the best at 100, so an
    average model reads as decent rather than "below average"."""
    if not population:
        return 50.0
    if invert:
        beats = sum(1 for p in population if p >= value)
    else:
        beats = sum(1 for p in population if p <= value)
    raw_percentile = beats / len(population)
    return _clamp((raw_percentile ** GENEROSITY_CURVE_EXPONENT) * 100)


EXCLUDED_VARIANT_SUFFIXES = (":free", ":batch")


def _is_comparable_text_model(model: dict) -> bool:
    """Only pool text-generation models together -- mixing in embedding/rerank/
    image models would skew the price and quality averages against models this
    badge isn't even meant to compare (e.g. embeddings are priced far lower
    per token, which would make every chat model look artificially expensive).

    Also excludes ":free" and ":batch" variants: ":free" isn't usable in
    production for clients (aggressive rate limits) and its usage volume is
    inflated by being free rather than by being good; ":batch" is an async
    batch-API variant (results delivered up to 24h later, not real-time),
    so its pricing/throughput aren't comparable to the streaming models this
    badge is meant for. Both would skew price, quality, and usage-based
    comparisons."""
    is_text = "text" in model.get("architecture", {}).get("output_modalities", [])
    is_excluded_variant = model.get("id", "").endswith(EXCLUDED_VARIANT_SUFFIXES)
    return is_text and not is_excluded_variant


def _dedupe_by_underlying_model(catalog: list[dict]) -> list[dict]:
    """OpenRouter lists variants (":batch", ":free", etc.) of the same
    underlying model as separate catalog entries sharing one canonical_slug.
    Left un-deduped, a population comparison would count that one model's
    benchmark/price multiple times -- pool by canonical_slug so each distinct
    model counts once."""
    seen: set = set()
    deduped = []
    for m in catalog:
        key = m.get("canonical_slug") or m["id"]
        if key in seen:
            continue
        seen.add(key)
        deduped.append(m)
    return deduped


# A model with no real benchmark but real production usage volume gets a
# score in this band instead -- high enough to clearly beat "no data at
# all" (null), but capped below the top of the benchmarked range so a
# merely-popular, never-tested model can't claim to rival a model with an
# actual capability benchmark, since usage is a weaker, price/age-confounded
# proxy for quality.
USAGE_QUALITY_FLOOR = 40
USAGE_QUALITY_CEILING = 70


def latest_usage_by_slug(usage_rankings: list[dict]) -> dict[str, float]:
    """Most recent month's total_tokens per model (keyed by canonical_slug /
    model_permaslug), skipping the "other" catch-all row and ":free" variants
    (not usable for production clients, and inflated by being free)."""
    if not usage_rankings:
        return {}
    latest_date = max(r["date"] for r in usage_rankings)
    return {
        r["model_permaslug"]: float(r["total_tokens"])
        for r in usage_rankings
        if r["date"] == latest_date
        and r["model_permaslug"] != "other"
        and not r["model_permaslug"].endswith(EXCLUDED_VARIANT_SUFFIXES)
    }


def gpqa_accuracy_by_slug(gpqa_benchmarks: list[dict]) -> dict[str, float]:
    """GPQA Diamond accuracy (0-1) per model (keyed by canonical_slug /
    model_permaslug), excluding ":free" variants. OpenRouter's own GPQA eval
    covers ~4x more models than Artificial Analysis, so it's used as a
    second real-benchmark tier when a model has no Artificial Analysis
    score -- see quality_score."""
    if not gpqa_benchmarks:
        return {}
    return {
        e["model_permaslug"]: e["accuracy"]
        for e in gpqa_benchmarks
        if e.get("accuracy") is not None
        and not e.get("model_permaslug", "").endswith(EXCLUDED_VARIANT_SUFFIXES)
    }


def _aa_composite(aa: Optional[dict]) -> Optional[float]:
    """Average of whichever Artificial Analysis indices a model actually has.
    Only ~32 of OpenRouter's models have an intelligence_index, but ~146 have
    at least one of intelligence_index/coding_index/agentic_index -- e.g.
    Gemini 3.5 Flash has coding_index and agentic_index but no
    intelligence_index. Treating it as "not benchmarked" and falling all the
    way to GPQA/usage would throw away real Artificial Analysis data just
    because one specific sub-index is missing."""
    if not aa:
        return None
    values = [
        v for v in (aa.get("intelligence_index"), aa.get("coding_index"), aa.get("agentic_index"))
        if v is not None
    ]
    if not values:
        return None
    return sum(values) / len(values)


def _benchmarked_tier_score(value: float, population: list[float]) -> float:
    """Percentile within a real-benchmark population (same 0-100 curved
    percentile as economy/speed -- no extra floor). A previous version
    rescaled this onto a 70-100 floor on the theory that "being benchmarked
    at all" already implies elite status, but stacked on top of the
    generosity curve that pushed the *median benchmarked model* to ~91/100,
    making quality nearly useless for telling a genuinely great model apart
    from a merely decent one. Plain curved percentile keeps the median
    around ~70 (same as economy/speed) instead."""
    return _percentile_score(value, population)


def quality_score(
    model: dict,
    catalog: list[dict],
    gpqa_by_slug: dict[str, float],
    usage_by_slug: dict[str, float],
) -> Optional[float]:
    """Quality, tried in order of trustworthiness -- each returns a score in
    BENCHMARKED_QUALITY_FLOOR-100 except the last:

    1. Artificial Analysis intelligence_index (broadest composite index,
       but only ~10% of models have one).
    2. OpenRouter's own GPQA Diamond accuracy (a real capability benchmark
       too, just narrower in scope -- graduate-level science Q&A -- but
       covers ~4x more models, so it's treated as equally trustworthy, not
       capped like usage below).
    3. Production usage volume (see USAGE_QUALITY_FLOOR/CEILING) -- a
       weaker, price/age-confounded proxy, so it's capped below every
       actually-benchmarked model rather than competing with them.

    Returns None only when none of the three signals are available -- no
    data means "unknown", not a fake average."""
    aa_value = _aa_composite(model.get("benchmarks", {}).get("artificial_analysis"))
    if aa_value is not None:
        population = [
            c for m in catalog
            if _is_comparable_text_model(m)
            for c in [_aa_composite(m.get("benchmarks", {}).get("artificial_analysis"))]
            if c is not None
        ]
        return _benchmarked_tier_score(aa_value, population)

    own_gpqa = gpqa_by_slug.get(model.get("canonical_slug"))
    if own_gpqa is not None:
        return _benchmarked_tier_score(own_gpqa, list(gpqa_by_slug.values()))

    own_usage = usage_by_slug.get(model.get("canonical_slug"))
    if not own_usage or own_usage <= 0:
        return None

    usage_population = [math.log10(v) for v in usage_by_slug.values() if v > 0]
    within_usage_group = _percentile_score(math.log10(own_usage), usage_population)
    span = USAGE_QUALITY_CEILING - USAGE_QUALITY_FLOOR
    return USAGE_QUALITY_FLOOR + (within_usage_group / 100) * span


def _best_endpoint(endpoints: list[dict]) -> Optional[dict]:
    """The provider with the best known throughput (fastest available route)."""
    usable = [
        e for e in endpoints
        if e.get("throughput_last_30m") and e["throughput_last_30m"].get("p50")
    ]
    if not usable:
        return None
    return max(usable, key=lambda e: e["throughput_last_30m"]["p50"])


def _latency_label(latency_ms: Optional[float]) -> str:
    if latency_ms is None:
        return "Unknown"
    if latency_ms < LATENCY_LOW_MS:
        return "Low"
    if latency_ms < LATENCY_MEDIUM_MS:
        return "Medium"
    return "High"


def speed_score(
    model: dict,
    endpoints: list[dict],
    throughput_ranking: list[dict],
) -> tuple[Optional[float], Optional[float], str]:
    """Returns (score 0-100 or None, latency p50 in ms, latency label).

    Score is a percentile rank against `throughput_ranking` -- the full
    catalog pre-sorted by OpenRouter server-side (fastest first), deduped
    and filtered the same way as quality/economy. None when the model isn't
    present in that ranking (e.g. the ranking fetch failed) -- no data means
    "unknown", not a fake average score.

    Latency label/ms come separately from this model's own best endpoint
    (still needs the per-model /endpoints call), independent of the ranking
    fetch succeeding or not."""
    endpoint = _best_endpoint(endpoints)
    latency = endpoint["latency_last_30m"]["p50"] if endpoint and endpoint.get("latency_last_30m") else None
    label = _latency_label(latency)

    ranked = _dedupe_by_underlying_model([m for m in throughput_ranking if _is_comparable_text_model(m)])
    ranked_slugs = [m.get("canonical_slug") or m["id"] for m in ranked]
    own_slug = model.get("canonical_slug") or model["id"]
    if own_slug not in ranked_slugs or not ranked_slugs:
        return None, latency, label

    rank = ranked_slugs.index(own_slug)  # 0 = fastest
    total = len(ranked_slugs)
    beats = total - rank  # models this one is at least as fast as, including itself
    raw_percentile = beats / total
    score = _clamp((raw_percentile ** GENEROSITY_CURVE_EXPONENT) * 100)
    return score, latency, label


def _blended_price_per_million(model: dict) -> Optional[float]:
    """$ per million tokens, simple average of prompt + completion."""
    try:
        prompt_price = float(model["pricing"]["prompt"]) * 1_000_000
        completion_price = float(model["pricing"]["completion"]) * 1_000_000
    except (KeyError, TypeError, ValueError):
        return None
    return (prompt_price + completion_price) / 2


def economy_score(model: dict, catalog: list[dict]) -> tuple[Optional[float], Optional[float], Optional[float]]:
    """Returns (score 0-100 or None, prompt $/M, completion $/M). Percentile
    rank against comparable models in the current catalog: cheaper than more
    of the market -> higher score (e.g. the 2nd-cheapest model out of 100
    lands near 100). None when the model has no usable pricing data -- no
    data means "unknown", not a fake average score."""
    try:
        prompt_price = float(model["pricing"]["prompt"]) * 1_000_000
        completion_price = float(model["pricing"]["completion"]) * 1_000_000
    except (KeyError, TypeError, ValueError):
        return None, None, None
    avg_price = (prompt_price + completion_price) / 2

    population = [
        price
        for m in catalog
        if _is_comparable_text_model(m)
        for price in [_blended_price_per_million(m)]
        if price and price > 0
    ]
    score = _percentile_score(avg_price, population, invert=True)
    return score, prompt_price, completion_price


# A score at or above this line counts as "good" for combo badges below --
# roughly the market median after the generosity curve (see _percentile_score).
GOOD_THRESHOLD = 70

# Combo badges: awarded when two axes are BOTH good at once, not just
# whichever single axis happens to be highest. These take priority over the
# single-axis badges below when they apply.
COMBO_BADGES = [
    (frozenset({"smart", "fast", "cheap"}), "excellent"),  # all three good
    (frozenset({"smart", "cheap"}), "value"),               # smart AND cheap
    (frozenset({"smart", "fast"}), "premium"),               # smart AND fast
    (frozenset({"fast", "cheap"}), "efficient"),             # fast AND cheap
]


# If the top-scoring axis doesn't beat the runner-up by at least this many
# points, no axis really "dominates" -- call it balanced instead of picking
# an arbitrary winner off a 1-2 point difference.
BALANCE_MARGIN = 10


def pick_badge(quality: Optional[float], speed: Optional[float], economy: Optional[float]) -> Optional[str]:
    """Combo badges (excellent/value/premium/efficient) win when two or more
    axes are both good (>= GOOD_THRESHOLD) at once -- a model that's both
    smart and cheap deserves more than just "smart" or "cheap" picked
    arbitrarily. If none of those apply and the axes are all close together
    (within BALANCE_MARGIN), it's "balanced" rather than crowning a winner
    on a 1-2 point difference. Otherwise falls back to whichever single axis
    dominates, ties broken smart > fast > cheap. None only when all three
    axes are unknown (e.g. a brand-new model with no benchmarks, no reported
    throughput yet, and unreadable pricing)."""
    scores = {"smart": quality, "fast": speed, "cheap": economy}
    known = {label: value for label, value in scores.items() if value is not None}
    if not known:
        return None

    good = frozenset(label for label, value in known.items() if value >= GOOD_THRESHOLD)
    for required, badge in COMBO_BADGES:
        if required <= good:
            return badge

    if len(known) > 1 and max(known.values()) - min(known.values()) < BALANCE_MARGIN:
        return "balanced"

    return max(known, key=known.get)


def compute_model_metrics(
    model: dict,
    endpoints: list[dict],
    catalog: list[dict],
    gpqa_benchmarks: Optional[list[dict]] = None,
    usage_rankings: Optional[list[dict]] = None,
    throughput_ranking: Optional[list[dict]] = None,
) -> dict:
    """Full metrics payload for one OpenRouter model, ready to serialize.
    `catalog` is the full current OpenRouter model list, used to compute the
    market-average baseline for quality/economy scoring. `gpqa_benchmarks`
    and `usage_rankings` are quality's fallback signals, tried in that order,
    when a model has no Artificial Analysis benchmark (see quality_score).
    `throughput_ranking` is /models sorted by throughput server-side, used
    for speed's percentile rank (see speed_score). Any score/detail can be
    None when the underlying data isn't available -- that's reported as
    "unknown" (null), never guessed as an average."""
    comparison_pool = _dedupe_by_underlying_model(catalog)
    gpqa_by_slug = gpqa_accuracy_by_slug(gpqa_benchmarks or [])
    usage_by_slug = latest_usage_by_slug(usage_rankings or [])
    quality = quality_score(model, comparison_pool, gpqa_by_slug, usage_by_slug)
    speed, latency_ms, latency_label = speed_score(model, endpoints, throughput_ranking or [])
    economy, prompt_price, completion_price = economy_score(model, comparison_pool)
    badge = pick_badge(quality, speed, economy)

    return {
        "id": model["id"],
        "name": model.get("name"),
        "badge": badge,
        "scores": {
            "quality": round(quality) if quality is not None else None,
            "speed": round(speed) if speed is not None else None,
            "economy": round(economy) if economy is not None else None,
        },
        "details": {
            "context_length": model.get("context_length"),
            "max_output_tokens": model.get("top_provider", {}).get("max_completion_tokens"),
            "latency_ms": latency_ms,
            "latency_label": latency_label,
            "prompt_price_per_million": round(prompt_price, 4) if prompt_price is not None else None,
            "completion_price_per_million": round(completion_price, 4) if completion_price is not None else None,
        },
    }

# Les différentes badges sont : smart, fast, cheap, excellent, value, premium, efficient, balanced