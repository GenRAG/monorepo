"""
Test rapide : badge (SMART / FAST / CHEAP) + scores Qualite / Vitesse / Economie
pour UN modele OpenRouter a la fois.

Usage:
    uv run python badge_test.py anthropic/claude-opus-4.8
    uv run python badge_test.py stepfun/step-3.7-flash

Si aucun argument n'est donne, un modele d'exemple est utilise.

Contrairement a test2.py (qui comparait plusieurs modeles entre eux), ici les
scores sont calcules contre des bornes fixes ci-dessous, pas relativement a
un lot de modeles. Comme ca, tester un seul modele donne un score stable et
comprehensible, pas juste "100" ou "0" par defaut.
"""

import sys
import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

# ---------------------------------------------------------------------------
# Bornes de reference (a ajuster si les badges paraissent mal calibres)
# ---------------------------------------------------------------------------
QUALITY_MIN, QUALITY_MAX = 0, 70        # intelligence_index (Artificial Analysis)
SPEED_MIN, SPEED_MAX = 0, 200           # tokens/seconde (throughput)
PRICE_MIN, PRICE_MAX = 0.05, 30         # $ / million de tokens (moyenne prompt+completion)

LATENCY_LOW_MS = 1000       # < 1s -> "Faible"
LATENCY_MEDIUM_MS = 3000    # 1-3s -> "Moderee", au-dela -> "Elevee"


def fetch_model(model_id: str) -> dict:
    resp = requests.get("https://openrouter.ai/api/v1/models", headers=HEADERS)
    resp.raise_for_status()
    for model in resp.json()["data"]:
        if model["id"] == model_id:
            return model
    raise ValueError(f"Modele introuvable dans le catalogue OpenRouter: {model_id}")


def fetch_endpoints(model: dict) -> list[dict]:
    details_path = model["links"]["details"]
    resp = requests.get(f"https://openrouter.ai{details_path}", headers=HEADERS)
    resp.raise_for_status()
    return resp.json()["data"]["endpoints"]


def clamp(value: float, lo: float = 0, hi: float = 100) -> float:
    return max(lo, min(hi, value))


def scale(value: float, lo: float, hi: float) -> float:
    """Ramene value (borne entre lo et hi) sur une echelle 0-100."""
    if hi == lo:
        return 0.0
    return clamp((value - lo) / (hi - lo) * 100)


def quality_score(model: dict) -> float:
    """Qualite = intelligence_index d'Artificial Analysis, seul indicateur retenu
    pour rester simple. Absent -> score neutre (50)."""
    aa = model.get("benchmarks", {}).get("artificial_analysis")
    if not aa or aa.get("intelligence_index") is None:
        return 50.0
    return scale(aa["intelligence_index"], QUALITY_MIN, QUALITY_MAX)


def best_endpoint(endpoints: list[dict]) -> dict | None:
    """Le provider avec le meilleur throughput connu (le plus rapide dispo)."""
    usable = [e for e in endpoints if e.get("throughput_last_30m") and e["throughput_last_30m"].get("p50")]
    if not usable:
        return None
    return max(usable, key=lambda e: e["throughput_last_30m"]["p50"])


def speed_score(endpoints: list[dict]) -> tuple[float, float | None, str]:
    """Retourne (score 0-100, latence p50 en ms, categorie texte)."""
    endpoint = best_endpoint(endpoints)
    if endpoint is None:
        return 50.0, None, "Inconnue"

    throughput = endpoint["throughput_last_30m"]["p50"]
    latency = endpoint["latency_last_30m"]["p50"] if endpoint.get("latency_last_30m") else None

    if latency is None:
        category = "Inconnue"
    elif latency < LATENCY_LOW_MS:
        category = "Faible"
    elif latency < LATENCY_MEDIUM_MS:
        category = "Moderee"
    else:
        category = "Elevee"

    return scale(throughput, SPEED_MIN, SPEED_MAX), latency, category


def economy_score(model: dict) -> tuple[float, float, float]:
    """Retourne (score 0-100, prix prompt $/M, prix completion $/M).
    Prix bas -> score eleve. Echelle log car les prix varient sur plusieurs
    ordres de grandeur (de $0.01 a $75 / million de tokens)."""
    import math

    prompt_price = float(model["pricing"]["prompt"]) * 1_000_000
    completion_price = float(model["pricing"]["completion"]) * 1_000_000
    avg_price = (prompt_price + completion_price) / 2

    log_price = math.log10(max(avg_price, PRICE_MIN))
    log_min, log_max = math.log10(PRICE_MIN), math.log10(PRICE_MAX)
    # inverse : prix bas -> score haut
    score = 100 - scale(log_price, log_min, log_max)
    return clamp(score), prompt_price, completion_price


def pick_badge(quality: float, speed: float, economy: float) -> str:
    """Le badge = l'axe qui domine. En cas d'egalite : smart > fast > cheap."""
    scores = [("SMART", quality), ("FAST", speed), ("CHEAP", economy)]
    scores.sort(key=lambda pair: pair[1], reverse=True)
    return scores[0][0]


def test_model(model_id: str) -> None:
    model = fetch_model(model_id)
    endpoints = fetch_endpoints(model)

    quality = quality_score(model)
    speed, latency_ms, latency_label = speed_score(endpoints)
    economy, prompt_price, completion_price = economy_score(model)
    badge = pick_badge(quality, speed, economy)

    print(f"\n{model['name']}  ({model_id})")
    print(f"  Badge      : {badge}")
    print(f"  Qualite    : {quality:.0f}/100")
    print(f"  Vitesse    : {speed:.0f}/100")
    print(f"  Economie   : {economy:.0f}/100")
    print("  ---")
    print(f"  Contexte      : {model.get('context_length')} tokens")
    print(f"  Max sortie    : {model.get('top_provider', {}).get('max_completion_tokens')} tokens")
    print(f"  Latence       : {latency_label}" + (f" ({latency_ms:.0f} ms)" if latency_ms else ""))
    print(f"  Prix entree   : ${prompt_price:.2f} / M tokens")
    print(f"  Prix sortie   : ${completion_price:.2f} / M tokens")


if __name__ == "__main__":
    model_id = sys.argv[1] if len(sys.argv) > 1 else "qwen/qwen3.7-flash"
    test_model(model_id)
