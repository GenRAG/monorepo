"""
End-to-end test of dataset isolation and multi-dataset retrieval.

Runs against a live stack (API + worker + Redis + MinIO + Qdrant):
  1. Ingests 3 small documents, all named `notes.txt`:
       org A / dataset rh   -> contains marker RH-<run>
       org A / dataset mkt  -> contains marker MKT-<run>
       org B / dataset rh   -> contains marker OTHERORG-<run>  (same dataset id, other org)
  2. Queries /rag/stream with different `datasetIds` and checks which markers come back.
     The stream is closed as soon as the `sources` event arrives, so no answer
     LLM call is paid for — only embeddings.
  3. Deletes a dataset, then both test orgs (drops their collections).

Usage:
    uv run python scripts/test_datasets.py [--api http://127.0.0.1:8000] [--keep]
"""

import argparse
import json
import os
import sys
import time
import uuid

import dotenv
import httpx

dotenv.load_dotenv()

RUN = uuid.uuid4().hex[:8]
ORG_A = f"test-org-a-{RUN}"
ORG_B = f"test-org-b-{RUN}"
DS_RH = f"rh-{RUN}"
DS_MKT = f"mkt-{RUN}"

DOCS = [
    (ORG_A, DS_RH, f"Politique RH interne. Le code de la politique de congés est RH-{RUN}. Les congés se posent 2 semaines à l'avance."),
    (ORG_A, DS_MKT, f"Plan marketing interne. Le code de la campagne de lancement est MKT-{RUN}. La campagne cible les PME."),
    (ORG_B, DS_RH, f"Document d'une autre organisation. Le code confidentiel est OTHERORG-{RUN}. Ne doit jamais fuiter."),
]
QUERY = "Quel est le code de la politique de congés, de la campagne de lancement ou le code confidentiel ?"

failures: list[str] = []


def check(name: str, condition: bool, detail: str = ""):
    print(f"  {'PASS' if condition else 'FAIL'}  {name}" + (f"  ({detail})" if detail and not condition else ""))
    if not condition:
        failures.append(name)


def ingest(client: httpx.Client, org_id: str, dataset_id: str, text: str) -> str:
    response = client.post(
        "/ingest",
        data={"org_id": org_id, "dataset_id": dataset_id},
        files={"file": ("notes.txt", text.encode(), "text/plain")},
    )
    response.raise_for_status()
    return response.json()["job_id"]


def wait_for_job(client: httpx.Client, job_id: str, timeout: float = 180) -> dict:
    deadline = time.time() + timeout
    while time.time() < deadline:
        status = client.get(f"/job/{job_id}/status").json()
        if status["status"] in ("completed", "failed"):
            return status
        time.sleep(2)
    raise TimeoutError(f"job {job_id} did not finish in {timeout}s")


def retrieve(client: httpx.Client, org_id, dataset_ids, extra_block_fields=None) -> dict:
    """Runs query -> retrieve -> answer and returns the first `sources` or `error` event."""
    retrieve_block = {"type": "retrieve", "name": "retrieve", "top_k": 10, **(extra_block_fields or {})}
    if dataset_ids is not None:
        retrieve_block["datasetIds"] = dataset_ids
    body = {
        "pipeline": {
            "pipeline_name": "dataset_test",
            "blocks": [
                {"type": "query", "name": "query"},
                retrieve_block,
                {"type": "answer", "name": "answer"},
            ],
        },
        "query": QUERY,
        "chat_history": [],
    }
    if org_id is not None:
        body["org_id"] = org_id

    with client.stream("POST", "/rag/stream", json=body) as response:
        if response.status_code != 200:
            response.read()
            return {"type": "http_error", "status": response.status_code, "data": response.text}
        for line in response.iter_lines():
            if not line.strip():
                continue
            event = json.loads(line)
            if event["type"] in ("sources", "error"):
                return event  # leaving the block closes the stream before the answer LLM runs
    return {"type": "no_sources"}


def markers(event: dict) -> set[str]:
    """Which test markers appear in the returned sources."""
    found = set()
    for source in event.get("data") or []:
        preview = source.get("text_preview", "")
        for marker in (f"RH-{RUN}", f"MKT-{RUN}", f"OTHERORG-{RUN}"):
            if marker in preview:
                found.add(marker.split("-")[0])
    return found


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--api", default="http://127.0.0.1:8000")
    parser.add_argument("--keep", action="store_true", help="don't delete the test datasets")
    args = parser.parse_args()

    api_key = os.getenv("RAG_ENGINE_API_KEY")
    if not api_key:
        sys.exit("RAG_ENGINE_API_KEY not set")
    client = httpx.Client(base_url=args.api, headers={"X-API-Key": api_key}, timeout=60)

    print(f"Run {RUN}: org A={ORG_A}, org B={ORG_B}")
    print("\n[1] Ingest (3 files, all named notes.txt)")
    for org_id, dataset_id, text in DOCS:
        status = wait_for_job(client, ingest(client, org_id, dataset_id, text))
        check(f"ingest {org_id}/{dataset_id}", status["status"] == "completed", status.get("error", ""))
    if failures:
        sys.exit("Ingestion failed — is the worker running?")

    print("\n[2] Retrieval")
    cases = [
        ("org A, datasetIds=[rh]          -> RH only", ORG_A, [DS_RH], {"RH"}),
        ("org A, datasetIds=[mkt]         -> MKT only", ORG_A, [DS_MKT], {"MKT"}),
        ("org A, datasetIds=[rh, mkt]     -> RH + MKT", ORG_A, [DS_RH, DS_MKT], {"RH", "MKT"}),
        ("org A, datasetIds omitted       -> all of org A", ORG_A, None, {"RH", "MKT"}),
        ("org A, datasetIds=[]            -> nothing", ORG_A, [], set()),
        ("org B, datasetIds=[rh]          -> org B only (same dataset id)", ORG_B, [DS_RH], {"OTHERORG"}),
        ("org A, other org's dataset id   -> no leak", ORG_A, [f"unknown-{RUN}"], set()),
    ]
    for name, org_id, dataset_ids, expected in cases:
        event = retrieve(client, org_id, dataset_ids)
        got = markers(event)
        check(name, event["type"] == "sources" and got == expected, f"got {event['type']} {sorted(got)}")

    event = retrieve(client, ORG_A, [DS_RH], {"collection_name": f"org_{ORG_B}"})
    check("collection_name of org B ignored -> org A data only", markers(event) == {"RH"}, f"got {sorted(markers(event))}")

    event = retrieve(client, None, [DS_RH])
    check("no org_id                       -> 422", event.get("status") == 422, f"got {event}")
    event = retrieve(client, ORG_A, ["bad/id"])
    check("invalid dataset id              -> 422", event.get("status") == 422, f"got {event}")

    event = retrieve(client, ORG_A, [DS_RH, DS_MKT])
    dataset_ids = {s.get("dataset_id") for s in event.get("data") or []}
    check("sources carry dataset_id", {DS_RH, DS_MKT} <= dataset_ids, f"got {dataset_ids}")

    if not args.keep:
        print("\n[3] Cleanup")
        response = client.request("DELETE", f"/datasets/{DS_MKT}", json={"org_id": ORG_A})
        check("delete dataset org A/mkt", response.status_code == 200, response.text)
        event = retrieve(client, ORG_A, None)
        check("after dataset delete -> RH only", markers(event) == {"RH"}, f"got {sorted(markers(event))}")
        for org_id in (ORG_A, ORG_B):
            response = client.delete(f"/orgs/{org_id}")
            check(f"delete org {org_id}", response.status_code == 200, response.text)
        event = retrieve(client, ORG_A, None)
        check("deleted org returns nothing", event["type"] == "sources" and markers(event) == set(), f"got {event['type']} {sorted(markers(event))}")

    print(f"\n{'ALL PASSED' if not failures else f'{len(failures)} FAILED: ' + ', '.join(failures)}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
