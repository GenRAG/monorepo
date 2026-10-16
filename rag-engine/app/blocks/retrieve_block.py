from typing import Union, Dict, Any, Optional, List
from pydantic import Field
import asyncio
import httpx
from langfuse import observe

from .base_block import BaseBlock
from app.config import settings
from app.services.vector_db import build_retrieval_filter, client as qdrant_client, org_collection

# Caps concurrent embedding requests fired by a single multi-query retrieval
# (asyncio.gather over query variants) so a burst of /rag/stream calls can't
# blow past the shared client's connection pool and time out.
_EMBEDDING_SEMAPHORE = asyncio.Semaphore(10)

# Shared, reused httpx client with explicit timeout/pool limits, instead of
# the old blocking `requests.post` (no timeout, blocked the event loop) or a
# fresh connection per call.
_EMBEDDING_CLIENT = httpx.AsyncClient(
    timeout=httpx.Timeout(30.0, connect=10.0),
    limits=httpx.Limits(max_connections=200, max_keepalive_connections=50),
)

class RetrieveBlock(BaseBlock):
    top_k: int = Field(default=5)
    org_id: Optional[str] = None
    # None = all datasets of the org, [] = none selected (retrieves nothing)
    dataset_ids: Optional[List[str]] = None

    @observe(name="RetrieveBlock")
    async def run(self, input_data: Union[Dict[str, Any], str]) -> Dict[str, Any]:
        # Never search without a tenant filter — that would return chunks
        # from every org in the collection.
        if not self.org_id:
            raise ValueError("org_id is required for retrieval")

        if self.dataset_ids == []:
            print(f"[WARN] RetrieveBlock '{self.name}': no dataset selected, skipping retrieval")
            base = input_data if isinstance(input_data, dict) else {"query": str(input_data)}
            return {**base, "retrieved_documents": []}

        if isinstance(input_data, dict):
            query = input_data.get("query", "")
            queries = input_data.get("_queries")
        else:
            query = str(input_data)
            queries = None

        # === Multi-query path ===
        if queries:
            if not isinstance(queries, list) or not all(q for q in queries):
                raise ValueError("'_queries' must be a non-empty list of strings")

            # Parallel retrieval for all queries
            tasks = [self._retrieve_single(q, input_data) for q in queries]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Collect successful results, log errors
            all_docs: List[List[Dict]] = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    print(f"[WARN] RetrieveBlock: query {i} failed: {type(result).__name__}: {result}")
                    continue
                if result:
                    all_docs.append(result)

            merged = self._deduplicate_documents(all_docs)
            return {**input_data, "retrieved_documents": merged}

        # === Single query path (current behavior) ===
        if not query:
            raise ValueError("Query cannot be empty")

        docs = await self._retrieve_single(query, input_data)
        return {**input_data, "retrieved_documents": docs}

    async def _retrieve_single(
        self, query: str, input_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Retrieve documents for a single query: embedding → Qdrant search."""
        cost_tracker = input_data.get("_cost_tracker")
        pipeline_run_id = input_data.get("_pipeline_run_id", "")
        org_id = input_data.get("org_id", "")

        embedding = await self._get_embedding(
            query,
            cost_tracker=cost_tracker,
            org_id=org_id,
            pipeline_run_id=pipeline_run_id,
        )
        if not embedding:
            return []

        collection_name = org_collection(self.org_id)
        # An org that hasn't ingested anything yet has no collection.
        if not await asyncio.to_thread(qdrant_client.collection_exists, collection_name):
            return []
        query_filter = build_retrieval_filter(self.org_id, self.dataset_ids)

        # Blocking call under the hood — offload to a thread so it doesn't
        # stall the event loop while other requests are in flight.
        search_results = await asyncio.to_thread(
            qdrant_client.query_points,
            collection_name=collection_name,
            query=embedding,
            limit=self.top_k,
            query_filter=query_filter,
        )

        # Keep the similarity score so sources can be ranked/displayed even
        # without a rerank block (rerank overwrites it with confidence_score).
        return [{**hit.payload, "score": hit.score} for hit in search_results.points]

    async def _get_embedding(self, text: str,
                            cost_tracker=None, org_id="",
                            pipeline_run_id="") -> list[float]:
        if not text or not text.strip():
            return []

        url = "https://openrouter.ai/api/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "genrag.com",
            "X-Title": "GenRAG",
        }
        data = {"model": "qwen/qwen3-embedding-8b", "input": text}

        async with _EMBEDDING_SEMAPHORE:
            response = await _EMBEDDING_CLIENT.post(url, headers=headers, json=data)

        if response.status_code == 200:
            result = response.json()
            # Record embedding cost if tracker available
            if cost_tracker and org_id:
                usage = result.get("usage")
                if usage:
                    await cost_tracker.record_usage(
                        org_id=org_id,
                        model="qwen/qwen3-embedding-8b",
                        usage=usage,
                        cost_type="embedding",
                        pipeline_run_id=pipeline_run_id,
                        block_name=self.name,
                    )
            return result["data"][0]["embedding"]
        return []

    @staticmethod
    def _deduplicate_documents(docs_list: List[List[Dict]]) -> List[Dict]:
        """Merge and deduplicate documents from multiple retrievals.

        Uses document 'id' or 'text' content hash as the dedup key.
        First occurrence wins.
        """
        seen = set()
        merged = []
        for docs in docs_list:
            for doc in docs:
                key = doc.get("id")
                if not key:
                    text = doc.get("text", "")
                    key = hash(text) if text else id(doc)
                if key not in seen:
                    seen.add(key)
                    merged.append(doc)
        return merged
