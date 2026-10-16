"""
Read-only check that dataset filtering works on an org's real data.

  1. Reads the org's Qdrant collection (org_{org_id}) and lists its datasets
     and documents.
  2. For each dataset, queries /rag/stream with datasetIds=[that dataset] and
     checks every returned source belongs to it.
  3. Checks all datasets combined, datasetIds omitted, datasetIds=[], an
     unknown dataset id, and an unknown org.

Nothing is written or deleted. The stream is closed as soon as the `sources`
event arrives (no answer LLM call) unless --answer is passed.

Usage:
    uv run python scripts/check_org_datasets.py --org-id genrag_epitech
    uv run python scripts/check_org_datasets.py --org-id genrag_epitech --query "Quels sont les tests d'acceptation ?" --answer
"""

import argparse
import json
import os
import sys
import uuid
from collections import Counter, defaultdict

import dotenv
import httpx
from qdrant_client import QdrantClient

dotenv.load_dotenv()

failures: list[str] = []


def check(name: str, condition: bool, detail: str = ""):
    print(f"  {'PASS' if condition else 'FAIL'}  {name}" + (f"  ({detail})" if detail and not condition else ""))
    if not condition:
        failures.append(name)


def discover(qdrant: QdrantClient, org_id: str) -> dict[str, Counter]:
    """dataset_id -> Counter(filename -> chunk count) for the org's collection."""
    collection = f"org_{org_id}"
    if not qdrant.collection_exists(collection):
        sys.exit(f"Collection {collection} doesn't exist — nothing ingested for this org yet?")
    datasets: dict[str, Counter] = defaultdict(Counter)
    offset = None
    while True:
        points, offset = qdrant.scroll(
            collection_name=collection,
            with_payload=["dataset_id", "filename", "org_id"],
            with_vectors=False,
            limit=1000,
            offset=offset,
        )
        for p in points:
            payload = p.payload or {}
            if payload.get("org_id") != org_id:
                failures.append(f"point {p.id} in {collection} has org_id={payload.get('org_id')}")
            datasets[payload.get("dataset_id") or "<none>"][payload.get("filename", "")] += 1
        if offset is None:
            break
    return datasets


def rag(client: httpx.Client, org_id: str, query: str, dataset_ids, top_k: int, answer: bool) -> dict:
    """Returns {"sources": [...], "answer": str, "error": str|None, "status": int}."""
    retrieve_block = {"type": "retrieve", "name": "retrieve", "top_k": top_k}
    if dataset_ids is not None:
        retrieve_block["datasetIds"] = dataset_ids
    body = {
        "org_id": org_id,
        "query": query,
        "chat_history": [],
        "pipeline": {"blocks": [
            {"type": "query", "name": "query"},
            retrieve_block,
            {"type": "answer", "name": "answer"},
        ]},
    }
    result = {"sources": None, "answer": "", "error": None, "status": 200}
    with client.stream("POST", "/rag/stream", json=body) as response:
        result["status"] = response.status_code
        if response.status_code != 200:
            response.read()
            result["error"] = response.text
            return result
        for line in response.iter_lines():
            if not line.strip():
                continue
            event = json.loads(line)
            if event["type"] == "sources":
                result["sources"] = event["data"]
                if not answer:
                    break
            elif event["type"] == "token":
                result["answer"] += event["data"]
            elif event["type"] == "error":
                result["error"] = event["data"]
                break
    return result


def describe(sources) -> str:
    return ", ".join(f"{s.get('dataset_id')}:{s.get('title')}" for s in sources or []) or "(none)"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--org-id", required=True)
    parser.add_argument("--query", default="De quoi parlent ces documents ?")
    parser.add_argument("--top-k", type=int, default=20)
    parser.add_argument("--api", default="http://127.0.0.1:8000")
    parser.add_argument("--qdrant", default="http://127.0.0.1:6333", help="Qdrant URL as seen from this machine")
    parser.add_argument("--answer", action="store_true", help="also generate and print the answer (costs an LLM call per query)")
    args = parser.parse_args()

    api_key = os.getenv("RAG_ENGINE_API_KEY")
    if not api_key:
        sys.exit("RAG_ENGINE_API_KEY not set")
    qdrant = QdrantClient(url=args.qdrant, api_key=os.getenv("QDRANT_API_KEY") or None)
    client = httpx.Client(base_url=args.api, headers={"X-API-Key": api_key}, timeout=120)

    print(f"[1] Contents of org_{args.org_id}")
    datasets = discover(qdrant, args.org_id)
    for dataset_id, files in sorted(datasets.items()):
        print(f"  dataset {dataset_id}: {sum(files.values())} chunks")
        for filename, n in files.most_common():
            print(f"      {n:4d}  {filename}")
    check("every point carries this org_id", not any(f.startswith("point ") for f in failures))
    check("every point has a dataset_id", "<none>" not in datasets)
    real = sorted(d for d in datasets if d != "<none>")

    print(f"\n[2] One dataset at a time (query: {args.query!r})")
    for dataset_id in real:
        r = rag(client, args.org_id, args.query, [dataset_id], args.top_k, args.answer)
        got = {s.get("dataset_id") for s in r["sources"] or []}
        check(f"datasetIds=[{dataset_id}] -> only {dataset_id}", r["error"] is None and bool(r["sources"]) and got == {dataset_id},
              r["error"] or describe(r["sources"]))
        print(f"        sources: {describe(r['sources'])}")
        if args.answer:
            print(f"        answer: {r['answer'][:400]}")

    print("\n[3] Combinations")
    if len(real) > 1:
        r = rag(client, args.org_id, args.query, real, args.top_k, args.answer)
        got = {s.get("dataset_id") for s in r["sources"] or []}
        check(f"datasetIds={real} -> subset of them", r["error"] is None and bool(got) and got <= set(real), r["error"] or describe(r["sources"]))
        print(f"        sources: {describe(r['sources'])}" + ("" if got == set(real) else "  (not every dataset in top_k — fine, it's one ranking)"))
        if args.answer:
            print(f"        answer: {r['answer'][:400]}")

    r = rag(client, args.org_id, args.query, None, args.top_k, False)
    got = {s.get("dataset_id") for s in r["sources"] or []}
    check("datasetIds omitted -> sources from the org's datasets only", r["error"] is None and bool(got) and got <= set(real), r["error"] or describe(r["sources"]))

    r = rag(client, args.org_id, args.query, [], args.top_k, False)
    check("datasetIds=[] -> no sources", r["error"] is None and r["sources"] == [], r["error"] or describe(r["sources"]))

    unknown = f"unknown_{uuid.uuid4().hex[:8]}"
    r = rag(client, args.org_id, args.query, [unknown], args.top_k, False)
    check("unknown dataset id -> no sources", r["error"] is None and r["sources"] == [], r["error"] or describe(r["sources"]))

    r = rag(client, f"no_such_org_{uuid.uuid4().hex[:8]}", args.query, real or None, args.top_k, False)
    check("other org with the same datasetIds -> no sources", r["error"] is None and r["sources"] == [], r["error"] or describe(r["sources"]))

    r = rag(client, "bad/org", args.query, real, args.top_k, False)
    check("invalid org_id -> 422", r["status"] == 422, f"status {r['status']}")

    print(f"\n{'ALL PASSED' if not failures else f'{len(failures)} FAILED: ' + ', '.join(failures)}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
