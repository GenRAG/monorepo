from typing import Any, Dict, List, Literal, Optional
from langfuse import observe, get_client

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient

langfuse = get_client()


DEFAULT_HYDE_PROMPT = """Vous êtes un système expert générant des documents hypothétiques pour un moteur de recherche documentaire.
Votre tâche consiste à rédiger un passage ou document hypothétique qui répond directement à la requête de l'utilisateur.

Consignes :
- Rédigez le passage comme s'il s'agissait d'une source faisant autorité (ex. une politique d'entreprise, une procédure, ou une note de service) correspondant parfaitement à l'intention de recherche de l'utilisateur.
- N'incluez pas de remplissage introductif, de texte conversationnel ou de phrases comme « Voici un document » ou « Bien sûr, je peux vous aider ».
- Utilisez le vocabulaire approprié au domaine de la requête.
- Gardez le résultat concis et strictement centré sur le sujet principal.
"""


class HydeBlock(BaseBlock):
    """Generates hypothetical documents to improve retrieval via HyDE technique.

    Supports two modes:
    - "override" (default): ignores _queries from prior blocks, generates from `query`
    - "compose": takes each query from _queries and generates per-query hypothetical docs
    """
    prompt_template: str = DEFAULT_HYDE_PROMPT
    model_name: str
    num_queries: int = 1
    mode: Literal["override", "compose"] = "override"

    async def _generate_single(
        self,
        client: OpenRouterClient,
        query: str,
        cost_tracker,
        org_id: str,
        pipeline_run_id: str,
    ) -> str:
        """Generate one hypothetical document for a single query."""
        usage_callback = None
        captured_record = None

        if cost_tracker and org_id:
            async def _on_usage(usage: dict, request_id: str = ""):
                nonlocal captured_record
                record = await cost_tracker.record_usage(
                    org_id=org_id,
                    model=self.model_name,
                    usage=usage,
                    cost_type="generation",
                    pipeline_run_id=pipeline_run_id,
                    request_id=request_id,
                    block_name=self.name,
                )
                # Send cost to Langfuse (with full precision)
                if record and hasattr(langfuse, "update_current_generation"):
                    langfuse.update_current_generation(
                        usage_details={
                            "input": record.prompt_tokens,
                            "output": record.completion_tokens,
                            "total": record.total_tokens,
                        },
                        cost_details={
                            "amount": record.cost_usd,
                            "currency": "USD",
                            "amount_raw": record.cost_usd_raw,
                        },
                        metadata={
                            "block_name": record.block_name,
                            "model": record.model,
                            "cost_usd_raw": record.cost_usd_raw,
                        }
                    )
                return record
            usage_callback = _on_usage

        response = await client.chat_completion(
            model=self.model_name,
            messages=[
                {"role": "system", "content": self.prompt_template},
                {"role": "user", "content": query},
            ],
            usage_callback=usage_callback,
        )
        return response.strip()

    @observe(name="HydeBlock", as_type="generation")
    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        # Cost tracking setup
        cost_tracker = input_data.get("_cost_tracker")
        pipeline_run_id = input_data.get("_pipeline_run_id", "")
        org_id = input_data.get("org_id", "")

        # Determine source queries based on mode
        if self.mode == "compose" and input_data.get("_queries"):
            source_queries: List[str] = input_data["_queries"]
        else:
            query = input_data.get("query", "")
            if not query:
                raise ValueError("Input data must contain a 'query' field")
            source_queries = [query]

        client = OpenRouterClient()
        try:
            all_docs: List[str] = []
            for src_query in source_queries:
                for i in range(self.num_queries):
                    doc = await self._generate_single(
                        client, src_query, cost_tracker, org_id, pipeline_run_id
                    )
                    if doc:
                        all_docs.append(doc)
                    else:
                        print(f"[WARN] HydeBlock: empty document generated for query: {src_query[:60]}...")

            if not all_docs:
                return {**input_data, "_queries": source_queries, "_hyde_error": "all generations failed"}

            # Backward compatible single path: replace query directly
            if len(all_docs) == 1 and self.mode == "override" and len(source_queries) == 1:
                return {
                    **input_data,
                    "query": all_docs[0],
                    "generated_content": all_docs[0],
                }

            # Multi-doc path: use _queries convention
            return {
                **input_data,
                "_queries": all_docs,
                "generated_content": all_docs,
            }
        except Exception as e:
            raise ValueError(f"Error generating content: {e}")
        finally:
            await client.close()
        