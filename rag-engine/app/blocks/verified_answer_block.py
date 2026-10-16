import json
from typing import Union, Dict, Any, AsyncGenerator, Optional
from pydantic import Field
from langfuse import get_client, observe

langfuse = get_client()

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient

class VerifiedAnswerBlock(BaseBlock):
    model_name: str
    judge_model_name: str = Field(default="qwen/qwen3.7-flash")
    temperature: Optional[float] = Field(default=0.3)
    max_tokens: Optional[int] = Field(default=None)  # None lets the model/OpenRouter decide, avoiding truncation with thinking models
    
    system_prompt: str = Field(
        default=(
            "Vous êtes un assistant IA expert. "
            "Votre mission est d'accompagner les utilisateurs dans leurs recherches et questions "
            "en vous appuyant sur la base de connaissances documentaire de l'entreprise. "
            "Suivez strictement ces consignes :\n\n"

            "## Réponse & Formatage\n"
            "- Utilisez UNIQUEMENT les informations fournies dans les documents contextuels pour répondre à la question.\n"
            "- N'inventez pas d'informations et n'utilisez pas de connaissances externes.\n"
            "- Formatez votre réponse en markdown : blockquotes, gras, et listes à puces pour une meilleure lisibilité.\n"
            "- CRITIQUE : Ne répétez PAS les longs titres de documents en ligne après chaque phrase. Utilisez toujours des notes de bas de page numériques (ex : [1], [2]) en ligne.\n"
            "- N'ajoutez PAS de liste de sources ou de section '### Sources' à la fin de votre réponse : l'interface affiche déjà les sources séparément.\n"
            "- Utilisez l'historique de la conversation uniquement pour maintenir le contexte.\n\n"

            "## Incertitude\n"
            "- Si le contexte fourni ne contient pas assez d'informations pour répondre à la question avec confiance, "
            "dites-le clairement. Ne devinez pas et ne spéculez pas.\n"
            "- Si le contexte contient des informations contradictoires, reconnaissez la divergence et présentez les deux perspectives.\n\n"

            "## Ton & Audience\n"
            "- Rédigez dans un langage professionnel mais clair.\n"
            "- Adaptez votre réponse au niveau de l'utilisateur.\n"
            "- Gardez les réponses ciblées et concises. Utilisez des paragraphes courts plutôt que de longs murs de texte.\n"
            "- Quand l'utilisateur initie une salutation ou une remarque conversationnelle, répondez chaleureusement et naturellement. "
            "N'utilisez JAMAIS de désclamations robotiques comme 'En tant qu'IA...'. "
        )
    )

    judge_system_prompt: str = Field(
        default=(
            "Vous êtes un juge strict de vérification de contexte pour une pipeline RAG.\n"
            "Évaluez si les documents 'Contexte' fournis contiennent des informations suffisantes, pertinentes et non contradictoires "
            "pour répondre complètement et en toute sécurité à la 'Requête' de l'utilisateur sans hallucination.\n\n"
            "Retournez UNIQUEMENT un objet JSON valide correspondant exactement à ce schéma :\n"
            '{"is_safe": true|false, "refusal_message": "<explication amicale>"}\n\n'
            "Règles :\n"
            "- Si le contexte n'a aucune information pertinente pour la requête, mettez is_safe à false.\n"
            "- Si le contexte ne répond que partiellement à la requête avec un risque élevé d'hallucination pour le reste, mettez is_safe à false.\n"
            "- Si is_safe est false, fournissez un message de refus clair et bienveillant indiquant pourquoi la réponse ne peut pas être donnée."
        )
    )

    @observe(name="VerifiedAnswerBlock", as_type="generation")
    async def run(
        self, input_data: Union[Dict[str, Any], str]
    ) -> AsyncGenerator[str, None]:
        if isinstance(input_data, dict):
            query = input_data.get("query", "")
            retrieved_docs = input_data.get("retrieved_documents", [])
            history = input_data.get("chat_history", [])
        else:
            query = str(input_data)
            retrieved_docs = []
            history = []

        retrieved_docs = [
            doc for doc in retrieved_docs if doc.get("confidence_score", 0.0) >= 0.8
        ]
        formatted_docs = self._format_documents(retrieved_docs)

        # Cost tracking setup
        _org_id = input_data.get("org_id") if isinstance(input_data, dict) else ""
        cost_tracker = input_data.get("_cost_tracker") if isinstance(input_data, dict) else None
        pipeline_run_id = input_data.get("_pipeline_run_id", "") if isinstance(input_data, dict) else ""

        async def _judge_usage_callback(usage: dict, request_id: str = ""):
            """Record cost for the judge (non-streaming) call."""
            if cost_tracker and _org_id:
                record = await cost_tracker.record_usage(
                    org_id=_org_id,
                    model=self.judge_model_name,
                    usage=usage,
                    cost_type="generation",
                    pipeline_run_id=pipeline_run_id,
                    request_id=request_id,
                    block_name=f"{self.name}.judge",
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
                            "amount_raw": record.cost_usd_raw,  # Full precision for billing
                        },
                        metadata={
                            "block_name": record.block_name,
                            "model": record.model,
                            "cost_usd_raw": record.cost_usd_raw,
                        }
                    )

        client = OpenRouterClient()
        try:
            # Judge Phase
            judge_messages = [
                {"role": "system", "content": self.judge_system_prompt},
                {"role": "user", "content": f"Requête : {query}\n\nContexte :\n{formatted_docs}"}
            ]

            judge_response_raw = await client.chat_completion(
                model=self.judge_model_name,
                messages=judge_messages,
                temperature=0.0,
                response_format={"type": "json_object"},
                usage_callback=_judge_usage_callback,
            )

            decision = self._parse_judge_decision(judge_response_raw)

            if not decision.get("is_safe", True):
                yield json.dumps({"type": "refusal", "data": decision.get("refusal_message", "I cannot safely answer this query based on the available context.")}) + "\n"
                return

            # Generation Phase
            generation_messages = [
                {"role": "system", "content": self.system_prompt},
                *history,
                {
                    "role": "user",
                    "content": f"Contexte :\n{formatted_docs}\n\nQuestion : {query}\n\nRéponse :",
                },
            ]

            langfuse = get_client()
            langfuse.update_current_generation(
                model=self.model_name,
                input=generation_messages,
            )

            async def _generation_usage_callback(usage: dict, request_id: str = ""):
                """Record cost for the generation (streaming) call."""
                if cost_tracker and _org_id:
                    record = await cost_tracker.record_usage(
                        org_id=_org_id,
                        model=self.model_name,
                        usage=usage,
                        cost_type="generation",
                        pipeline_run_id=pipeline_run_id,
                        request_id=request_id,
                        block_name=f"{self.name}.generation",
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
                                "amount_raw": record.cost_usd_raw,  # Full precision for billing
                            },
                            metadata={
                                "block_name": record.block_name,
                                "model": record.model,
                                "cost_usd_raw": record.cost_usd_raw,
                            }
                        )

            try:
                async for chunk in client.chat_completion_stream(
                    model=self.model_name,
                    messages=generation_messages,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    usage_callback=_generation_usage_callback,
                ):
                    yield json.dumps({"type": "token", "data": chunk}) + "\n"
            except Exception as e:
                error_msg = f"\n\n[Generation Error: {type(e).__name__}: {e}]"
                print(error_msg)
                yield json.dumps({"type": "error", "data": error_msg}) + "\n"
                
        finally:
            await client.close()
            
    def _parse_judge_decision(self, raw_response: str) -> Dict[str, Any]:
        cleaned = (raw_response or "").strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.lower().startswith("json\n"):
                cleaned = cleaned[5:].strip()
                
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {"is_safe": False, "refusal_message": "Internal error: Failed to verify safety constraints. For your safety, I am unable to proceed."}

    def _format_documents(self, documents: list) -> str:
        if not documents:
            return "Aucun document pertinent trouvé"

        formatted = []
        for doc in documents:
            text = doc.get("text", "")
            source = doc.get("filename", doc.get("url", "Source inconnue"))
            confidence = doc.get("confidence_score", 0.0)
            formatted.append(f"Source : {source}\nContenu : {text}\nConfiance : {confidence}")
        return "\n\n".join(formatted)
