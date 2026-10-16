"""
query_rewriter_block.py

This module defines the `QueryRewriterBlock`, a component of the RAG pipeline
that optimizes user queries before retrieval. It uses an LLM to expand, clarify,
and contextualize incoming queries, making them more effective for document
retrieval from a knowledge base.

Key features:
- Context-aware rewriting using chat history for follow-up questions
- Configurable temperature, max_tokens, and custom system prompt
- `overwrite_query` flag controls whether the rewrite affects both retrieval
  AND answer generation, or just retrieval
- Graceful fallback to original query on LLM failure
"""

from typing import Any, Dict, Optional
from langfuse import observe, get_client

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient

langfuse = get_client()

# Prompt système par défaut pour la réécriture de requêtes
DEFAULT_REWRITE_PROMPT = """Vous êtes un assistant de réécriture de requêtes pour un système RAG. Votre tâche consiste à reformuler les requêtes utilisateur pour qu'elles soient optimales pour la recherche documentaire.

## Consignes
1. **Développez et clarifiez** : Transformez les requêtes vagues ou courtes en questions claires et autonomes.
2. **Enrichissez avec des mots-clés pertinents** : Ajoutez naturellement des termes pertinents au domaine de la question — ils aident la recherche vectorielle à trouver les documents correspondants.
3. **Préservez l'intention originale** : Ne modifiez PAS le sujet de la question de l'utilisateur.
4. **Utilisez l'historique pour le contexte** : Si l'utilisateur dit « dis-m'en plus » ou « explique », déduisez le sujet de la conversation. La requête réécrite doit être autonome — quelqu'un qui la lit doit comprendre le sujet complet sans l'historique.
5. **Produisez uniquement la requête réécrite** : Pas d'explications, pas de remplissage, pas de texte d'introduction.
6. **Laissez tel quel** si la requête est déjà claire, est une salutation, ou est une simple confirmation (« oui », « merci », « ok »).

## Exemples

Original : « politique de congés »
Réécrit : « Politique de congés, jours de repos et procédure de demande d'absence dans l'entreprise »

Original : « recrutement »
Réécrit : « Processus de recrutement, étapes de sélection et critères d'embauche dans l'entreprise »

Conversation :
Utilisateur : Quelle est la politique de télétravail ?
Assistant : Notre politique de télétravail autorise 2 jours par semaine...
Requête actuelle : « et le matériel fourni ? »
Réécrit : « Matériel fourni par l'entreprise pour le télétravail, équipement informatique et prise en charge des frais »
"""


class QueryRewriterBlock(BaseBlock):
    """Rewrites and optimizes user queries for better retrieval and answer generation."""

    model_name: str = "qwen/qwen3.7-flash"
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    system_prompt: Optional[str] = None
    overwrite_query: bool = True
    num_queries: int = 1

    def _build_prompt(self, query: str, chat_history: list, num_queries: int = 1) -> tuple[str, str]:
        """Build the system and user messages for the LLM.

        When chat history is present, the user message includes conversation context
        so the LLM can resolve references in follow-up questions.
        When num_queries > 1, asks the LLM to generate multiple distinct query variations.
        """
        system = self.system_prompt or DEFAULT_REWRITE_PROMPT

        if not chat_history:
            user_message = query
        else:
            # Format recent chat history (last 6 turns to avoid token bloat)
            history_lines = []
            for msg in chat_history[-6:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                history_lines.append(f"{role.capitalize()}: {content}")

            history_str = "\n".join(history_lines)
            user_message = (
                f"Conversation :\n{history_str}\n\n"
                f"Requête actuelle : \"{query}\"\n\n"
                f"Réécrivez la requête actuelle en une question autonome en utilisant la conversation pour le contexte."
            )

        # Append multi-query instruction if needed
        if num_queries > 1:
            user_message += (
                f"\n\nGénérez {num_queries} variantes de requêtes distinctes couvrant différents aspects, "
                f"angles ou formulations du même besoin d'information. "
                f"Chaque variante doit être autonome et optimisée pour la recherche par vecteur.\n"
                f"Produisez UNIQUEMENT les {num_queries} requêtes, une par ligne, numérotées ou non — pas d'explications."
            )

        return system, user_message

    @staticmethod
    def _parse_multi_queries(raw: str, expected: int, original: str) -> list[str]:
        """Parse the LLM response into a list of queries.

        Handles numbered lists (1., 2., ...) and plain line-by-line output.
        Falls back to the original query if parsing fails.
        """
        lines = [line.strip() for line in raw.strip().split("\n") if line.strip()]
        queries = []
        for line in lines:
            # Strip numbering like "1. ", "1)", "- "
            cleaned = line.lstrip("0123456789.-) \t")
            if cleaned:
                queries.append(cleaned)

        if not queries:
            print("[WARN] QueryRewriterBlock: could not parse multi-query response, using original query")
            return [original]

        print(f"[INFO] QueryRewriterBlock: generated {len(queries)} queries (expected {expected})")
        return queries

    @observe(name="QueryRewriterBlock", as_type="generation")
    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        query = input_data.get("query", "")
        if not query:
            raise ValueError("Input data must contain a 'query' field")

        chat_history = input_data.get("chat_history", [])
        system_prompt, user_message = self._build_prompt(query, chat_history, self.num_queries)

        # Cost tracking setup
        cost_tracker = input_data.get("_cost_tracker")
        pipeline_run_id = input_data.get("_pipeline_run_id", "")
        org_id = input_data.get("org_id", "")

        client = OpenRouterClient()
        try:
            captured_record = None

            if cost_tracker and org_id:
                async def _on_usage(usage: dict, request_id: str = ""):
                    nonlocal captured_record
                    captured_record = await cost_tracker.record_usage(
                        org_id=org_id,
                        model=self.model_name,
                        usage=usage,
                        cost_type="generation",
                        pipeline_run_id=pipeline_run_id,
                        request_id=request_id,
                        block_name=self.name,
                    )
            else:
                _on_usage = None

            llm_response = await client.chat_completion(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                usage_callback=_on_usage,
            )

            # Guard against empty response
            llm_response = llm_response.strip()
            if not llm_response:
                print(f"[WARN] QueryRewriterBlock returned empty response, using original query")
                llm_response = query

            # Update Langfuse with cost data AFTER the LLM call
            if captured_record and hasattr(langfuse, "update_current_generation"):
                try:
                    langfuse.update_current_generation(
                        usage_details={
                            "input": captured_record.prompt_tokens,
                            "output": captured_record.completion_tokens,
                            "total": captured_record.total_tokens,
                        },
                        cost_details={
                            "amount": captured_record.cost_usd,
                            "currency": "USD",
                            "amount_raw": captured_record.cost_usd_raw,
                        },
                        metadata={
                            "block_name": self.name,
                            "model": captured_record.model,
                            "cost_usd_raw": captured_record.cost_usd_raw,
                            "num_queries": self.num_queries,
                        },
                    )
                except Exception as e:
                    print(f"[DEBUG] Langfuse update error: {e}")

            # === Multi-query path ===
            if self.num_queries > 1:
                queries = self._parse_multi_queries(llm_response, self.num_queries, query)
                return {
                    **input_data,
                    "_queries": queries,
                    "_rewritten_queries": queries,  # metadata for logging
                    "num_queries": self.num_queries,
                }

            # === Single query path (current behavior) ===
            rewritten_query = llm_response

            # Decide how to propagate the rewritten query based on overwrite_query
            if self.overwrite_query:
                # Rewrite flows to both retrieval AND answer
                return {
                    **input_data,
                    "query": rewritten_query,
                    "_rewritten_query": rewritten_query,  # metadata for logging
                }
            else:
                # Rewrite only for retrieval — leave original query for answer
                return {
                    **input_data,
                    "query": rewritten_query,
                    "_overwrite_query": False,
                    "_rewritten_query": rewritten_query,
                }

        except Exception as e:
            print(f"[WARN] Query rewriting failed, using original query: {e}")
            # Graceful fallback — pass through original query
            return {**input_data, "_rewrite_error": str(e)}

        finally:
            await client.close()