"""
answer_block.py

This module implements the `AnswerGenerationBlock`, a crucial part of the RAG pipeline
responsible for generating coherent and contextually relevant answers based on a user query
and retrieved documents. It utilizes an LLM for text generation with streaming support.
"""

import json
from datetime import datetime, timezone
from typing import Union, Dict, Any, AsyncGenerator, Optional
from pydantic import Field
from langfuse import observe, get_client

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient

langfuse = get_client()

DEFAULT_ANSWER_PROMPT = (
    "Vous êtes un assistant IA expert. "
    "Votre mission est d'accompagner les utilisateurs dans leurs recherches et questions "
    "en vous appuyant sur la base de connaissances documentaire de l'entreprise. "

    "Si des instructions spécifiques vous ont été données ci-dessus (ton, style, format, rôle), "
    "suivez-les EN PRIORITÉ par rapport aux règles générales ci-dessous.\n\n"

    "Suivez strictement ces consignes générales :\n\n"

    "## Réponse & Formatage\n"
    "- Utilisez UNIQUEMENT les informations fournies dans les documents contextuels pour répondre à la question.\n"
    "- N'inventez pas d'informations et n'utilisez pas de connaissances externes.\n"
    "- Formatez votre réponse en markdown : blockquotes, gras, et listes à puces pour une meilleure lisibilité.\n"
    "- CRITIQUE : Ne répétez PAS les longs titres de documents en ligne après chaque phrase. Utilisez toujours des notes de bas de page numériques (ex : [1], [2]) en ligne.\n"
    "- CRITIQUE : Chaque document ci-dessous est précédé de son numéro entre crochets (ex : [1]). "
    "N'utilisez QUE ces numéros pour vos citations, et ne citez JAMAIS un numéro qui ne correspond à aucun document fourni.\n"
    "- N'ajoutez PAS de liste de sources ou de section '### Sources' à la fin de votre réponse : l'interface affiche déjà les sources séparément.\n"
    "- Utilisez l'historique de la conversation uniquement pour maintenir le contexte.\n\n"

    "## Ton & Audience\n"
    "- Rédigez dans un langage professionnel mais clair.\n"
    "- Adaptez votre réponse au niveau de l'utilisateur.\n"
    "- Gardez les réponses ciblées et concises. Utilisez des paragraphes courts plutôt que de longs murs de texte.\n"
    "- Quand l'utilisateur initie une salutation ou une remarque conversationnelle, répondez chaleureusement et naturellement. "
    "N'utilisez JAMAIS de désclamations robotiques comme 'En tant qu'IA...'.\n"
    "- Ne forcez PAS une salutation si l'utilisateur pose une question de suivi."
)


class AnswerGenerationBlock(BaseBlock): # Block for generating answers using an LLM
    model_name: str # The name of the language model to use
    temperature: Optional[float] = Field(default=0.7) # Controls randomness in generation
    max_tokens: Optional[int] = Field(default=None) # Maximum tokens for the generated answer; None lets the model/OpenRouter decide, avoiding truncation with thinking models
    system_prompt: Optional[str] = None  # If set, placed BEFORE DEFAULT_ANSWER_PROMPT to take precedence on style/tone

    @observe(name="AnswerGenerationBlock", as_type="generation")
    async def run(
        self, input_data: Union[Dict[str, Any], str]
    ) -> AsyncGenerator[str, None]: # Generates and streams answers based on query and docs
        # Extract query and retrieved documents from input data
        if isinstance(input_data, dict):
            # When a query rewriter ran with overwrite_query=True (default),
            # `query` contains the rewritten version and we use that for generation.
            # When overwrite_query=False, we use the original query from chat_history
            # context instead to avoid garbling highly specific follow-ups.
            #
            # `_overwrite_query` is set to False by the rewriter when disabled,
            # defaulting to True if not present (backward compat / no rewriter).
            use_original = input_data.get("_overwrite_query", True) is False
            query = input_data.get("query", "")
            original_query = input_data.get("original_query", query)
            # `_sources` is built by RagPipeline: retrieved chunks deduplicated by
            # document with a stable citation index — this is what we show the
            # model, so its [n] citations always match the sources sent to the client.
            sources = input_data.get("_sources", [])
            chat_history = input_data.get("chat_history", [])
        else:
            query = str(input_data)
            original_query = query
            sources = []
            chat_history = []

        # Construct messages for the LLM chat completion
        # Custom system_prompt is placed BEFORE the default so it takes precedence on style/tone,
        # while the default formatting instructions (sources, footnotes, etc.) still apply
        full_system = DEFAULT_ANSWER_PROMPT
        if self.system_prompt:
            full_system = self.system_prompt + "\n\n" + DEFAULT_ANSWER_PROMPT
        messages = [
            {"role": "system", "content": full_system},
        ]

        for msg in chat_history:
            # OpenRouter / most LLMs expect role and content.
            # Convert system messages in history to basic user/assistant format if needed,
            # but assuming standard user/assistant roles from your app.
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

        messages.append({
            "role": "user",
            "content": f"En vous basant sur les documents ci-dessous et l'historique de la conversation ci-dessus, veuillez répondre à cette question : {query if not use_original else original_query}\n\nDocuments : {self._format_documents(sources)}\n\nRéponse :",
        })

        print("Messages sent to LLM for answer generation:")
        print(messages)

        # Cost tracking setup
        cost_tracker = input_data.get("_cost_tracker") if isinstance(input_data, dict) else None
        pipeline_run_id = input_data.get("_pipeline_run_id", "") if isinstance(input_data, dict) else ""
        org_id = input_data.get("org_id") if isinstance(input_data, dict) else ""

        usage_callback = None
        if cost_tracker and org_id:
            captured_record = None  # Will be set after streaming
            
            async def _on_usage(usage: dict, request_id: str = ""):
                nonlocal captured_record
                # Just record the cost (Langfuse update happens after streaming)
                captured_record = await cost_tracker.record_usage(
                    org_id=org_id,
                    model=self.model_name,
                    usage=usage,
                    cost_type="generation",
                    pipeline_run_id=pipeline_run_id,
                    request_id=request_id,
                    block_name=self.name,
                )
            usage_callback = _on_usage

        client = OpenRouterClient()
        try:
            # Update Langfuse generation start (before streaming)
            if hasattr(langfuse, "update_current_generation"):
                try:
                    langfuse.update_current_generation(
                        model=self.model_name,
                        input=messages,
                    )
                except Exception as e:
                    print(f"[DEBUG] Langfuse update error: {e}")

            # Stream chunks from the LLM chat completion
            first_token_received = False
            try:
                async for chunk in client.chat_completion_stream(
                    model=self.model_name,
                    messages=messages,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    usage_callback=usage_callback,
                ):
                    if not first_token_received:
                        first_token_received = True
                        # Reported as "Time to First Token" in Langfuse, separate from
                        # total generation latency (which would otherwise include the
                        # full stream duration — misleading for a streaming endpoint
                        # where perceived latency is "time until the first word appears").
                        if hasattr(langfuse, "update_current_generation"):
                            try:
                                langfuse.update_current_generation(
                                    completion_start_time=datetime.now(timezone.utc),
                                )
                            except Exception as e:
                                print(f"[DEBUG] Langfuse update error: {e}")
                    yield json.dumps({"type": "token", "data": chunk}) + "\n"
            except Exception as e:
                error_msg = f"\n\n[Generation Error: {type(e).__name__}: {e}]"
                print(error_msg)
                yield json.dumps({"type": "error", "data": error_msg}) + "\n"
        finally:
            # Update Langfuse with cost data AFTER streaming is complete
            if 'captured_record' in dir() and captured_record and hasattr(langfuse, "update_current_generation"):
                try:
                    langfuse.update_current_generation(
                        usage_details={
                            "input": captured_record.prompt_tokens,
                            "output": captured_record.completion_tokens,
                            "total": captured_record.total_tokens,
                        },
                        cost_details={
                            "amount": captured_record.cost_usd,  # Float value (computed by Langfuse from pricing tiers)
                            "currency": "USD",
                            "raw_string": str(captured_record.cost_usd_raw),  # Our custom field for full precision
                        },
                        metadata={
                            "block_name": captured_record.block_name,
                            "model": captured_record.model,
                            "provider": captured_record.provider,
                            "cost_usd_raw": str(captured_record.cost_usd_raw),  # Full precision in metadata too
                        }
                    )
                except Exception as e:
                    print(f"[DEBUG] Langfuse update error: {e}")
            await client.close()

    def _format_documents(self, sources: list) -> str: # Formats deduplicated sources (with citation index) into a single string
        if not sources:
            return "Aucun document pertinent trouvé"

        formatted = []
        for source in sources:
            content = "\n---\n".join(source.get("chunks", []))
            formatted.append(
                f"[{source['index']}] Source : {source['title']}\nContenu : {content}"
            )
        return "\n\n".join(formatted)
