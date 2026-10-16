# %%
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

HEADERS = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

# %%
# curl "https://openrouter.ai/api/v1/models"

request = requests.get(
    url="https://openrouter.ai/api/v1/models",
    headers=HEADERS,
)


# %%
request_data = request.json()

# %%
request_data.keys()

# %%
request_data["total_count"]

# %%
model_0 = request_data["data"][0]

# %%
print(model_0.keys())

# %%
print(model_0)

# %%
for elt in model_0:
    print(elt, model_0[elt])

# %%
# curl "https://openrouter.ai/api/v1/model/openai/gpt-4o"

single_model_request = requests.get(
    url="https://openrouter.ai/api/v1/model/openai/gpt-4o",
    headers=HEADERS,
)

print(single_model_request.json())

single_model_request_data = single_model_request.json()

# %%
single_model_request_data["data"]["description"]

# %%
# ---------------------------------------------------------------------------
# Badges (SMART / FAST / CHEAP) + Qualite / Vitesse / Economie scores
# ---------------------------------------------------------------------------
#
# Source data, all pulled straight from OpenRouter:
#   - GET /api/v1/models                              -> pricing + benchmarks.artificial_analysis
#   - GET /api/v1/models/{canonical_slug}/endpoints    -> per-provider throughput/latency
#
# NOTE: hitting /endpoints for every model in the ~400-model catalog is slow
# and wasteful. In the real app this should only run for the curated/favorite
# model list shown in the "Configuration du modele" dialog, and the result
# should be cached (e.g. a periodic worker job writing to Redis) rather than
# recomputed on every page load.

QUALITY_WEIGHTS = {"intelligence_index": 0.5, "coding_index": 0.35, "agentic_index": 0.15}
# RAG workloads are input-heavy (long context, short answers), so price is
# weighted 75% prompt / 25% completion.
PRICE_WEIGHTS = {"prompt": 0.75, "completion": 0.25}


def fetch_all_models() -> list[dict]:
    resp = requests.get("https://openrouter.ai/api/v1/models", headers=HEADERS)
    resp.raise_for_status()
    return resp.json()["data"]


def fetch_endpoints(model: dict) -> list[dict]:
    """GET /api/v1/models/{canonical_slug}/endpoints for one model."""
    details_path = model.get("links", {}).get("details")
    if not details_path:
        return []
    resp = requests.get(f"https://openrouter.ai{details_path}", headers=HEADERS)
    resp.raise_for_status()
    return resp.json().get("data", {}).get("endpoints", [])


def quality_raw(model: dict) -> float | None:
    """Weighted average of the Artificial Analysis indices (already ~0-100)."""
    aa = model.get("benchmarks", {}).get("artificial_analysis")
    if not aa:
        return None
    total_weight = 0.0
    score = 0.0
    for key, weight in QUALITY_WEIGHTS.items():
        value = aa.get(key)
        if value is None:
            continue
        score += value * weight
        total_weight += weight
    if total_weight == 0:
        return None
    return score / total_weight


def speed_raw(endpoints: list[dict]) -> float | None:
    """Best (max) provider throughput, tokens/sec (p50 over the last 30 min)."""
    throughputs = [
        ep["throughput_last_30m"]["p50"]
        for ep in endpoints
        if ep.get("throughput_last_30m") and ep["throughput_last_30m"].get("p50") is not None
    ]
    return max(throughputs) if throughputs else None


def best_latency_ms(endpoints: list[dict]) -> float | None:
    """Latency (p50, ms) of whichever provider has the best throughput."""
    candidates = [
        (ep["throughput_last_30m"]["p50"], ep["latency_last_30m"]["p50"])
        for ep in endpoints
        if ep.get("throughput_last_30m")
        and ep["throughput_last_30m"].get("p50") is not None
        and ep.get("latency_last_30m")
        and ep["latency_last_30m"].get("p50") is not None
    ]
    if not candidates:
        return None
    return max(candidates, key=lambda pair: pair[0])[1]


def blended_price_per_million(model: dict) -> float | None:
    """$ per million tokens, weighted 75% prompt / 25% completion.

    /api/v1/models returns pricing as a per-token decimal string
    (e.g. "0.0000025"), so multiply by 1e6 to get $/M tokens.
    """
    pricing = model.get("pricing", {})
    try:
        prompt_price = float(pricing["prompt"]) * 1_000_000
        completion_price = float(pricing["completion"]) * 1_000_000
    except (KeyError, TypeError, ValueError):
        return None
    return prompt_price * PRICE_WEIGHTS["prompt"] + completion_price * PRICE_WEIGHTS["completion"]


def min_max_normalize(values: dict[str, float | None]) -> dict[str, float | None]:
    """Scale present values to 0-100 within this batch; None stays None."""
    present = [v for v in values.values() if v is not None]
    if not present:
        return {k: None for k in values}
    lo, hi = min(present), max(present)
    if hi == lo:
        return {k: (100.0 if v is not None else None) for k, v in values.items()}
    return {k: (None if v is None else round((v - lo) / (hi - lo) * 100, 1)) for k, v in values.items()}


def assign_badge(quality: float, speed: float, economy: float) -> str:
    """Whichever axis wins, tie-broken smart > fast > cheap."""
    scored = [("smart", quality), ("fast", speed), ("cheap", economy)]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored[0][0]


def score_models(model_ids: list[str]) -> list[dict]:
    """
    Fetch + score a specific list of OpenRouter model ids
    (e.g. ["anthropic/claude-opus-4.8", "stepfun/step-3.7-flash"]).

    Returns one dict per model with the raw metrics, the 0-100 normalized
    scores, and the resulting badge.
    """
    all_models = {m["id"]: m for m in fetch_all_models()}

    rows = []
    for model_id in model_ids:
        model = all_models.get(model_id)
        if model is None:
            print(f"[warn] model not found in catalog: {model_id}")
            continue
        endpoints = fetch_endpoints(model)
        rows.append(
            {
                "id": model_id,
                "name": model.get("name"),
                "model": model,
                "endpoints": endpoints,
                "quality_raw": quality_raw(model),
                "speed_raw": speed_raw(endpoints),
                "economy_raw": blended_price_per_million(model),  # lower is cheaper
                "latency_ms": best_latency_ms(endpoints),
                "context_length": model.get("context_length"),
                "max_completion_tokens": model.get("top_provider", {}).get("max_completion_tokens"),
                "prompt_price_per_m": float(model["pricing"]["prompt"]) * 1_000_000,
                "completion_price_per_m": float(model["pricing"]["completion"]) * 1_000_000,
            }
        )

    quality_scores = min_max_normalize({r["id"]: r["quality_raw"] for r in rows})
    speed_scores = min_max_normalize({r["id"]: r["speed_raw"] for r in rows})
    # economy_raw is a cost (lower = better), so invert before normalizing
    economy_inverted = {
        r["id"]: (None if r["economy_raw"] is None else -r["economy_raw"]) for r in rows
    }
    economy_scores = min_max_normalize(economy_inverted)

    for r in rows:
        q = quality_scores[r["id"]] if quality_scores[r["id"]] is not None else 0.0
        s = speed_scores[r["id"]] if speed_scores[r["id"]] is not None else 0.0
        e = economy_scores[r["id"]] if economy_scores[r["id"]] is not None else 0.0
        r["quality_score"] = q
        r["speed_score"] = s
        r["economy_score"] = e
        r["badge"] = assign_badge(q, s, e)

    return rows


# %%
if __name__ == "__main__":
    example_ids = [
        "anthropic/claude-opus-4.8",
        "anthropic/claude-opus-5",
        "stepfun/step-3.7-flash",
    ]
    results = score_models(example_ids)
    for r in results:
        print(
            f"{r['name']:30s} "
            f"badge={r['badge']:5s} "
            f"qualite={r['quality_score']:5.1f} "
            f"vitesse={r['speed_score']:5.1f} "
            f"economie={r['economy_score']:5.1f} "
            f"(prompt=${r['prompt_price_per_m']:.2f}/M, "
            f"completion=${r['completion_price_per_m']:.2f}/M, "
            f"latence={r['latency_ms']}ms)"
        )
