"""
refusal_block.py

This module defines the `RefusalBlock`, a guardrail component for the RAG pipeline
that determines whether a rewritten query should continue to retrieval or be handled
as an early response.
"""

import json
from typing import Any, Dict, Union

from langfuse import observe, get_client
from pydantic import Field

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient

langfuse = get_client()


class RefusalBlock(BaseBlock):
    model_name: str = Field(default="qwen/qwen3.7-flash")
    system_prompt: str = Field(
        default=(
            "Vous êtes un classifieur d'intention strict pour un chatbot d'entreprise. "
            "Classez la requête utilisateur dans exactement une catégorie : domaine, small_talk, hors_domaine ou vague. "
            "Retournez UNIQUEMENT du JSON valide avec ce schéma :\n"
            '{"label": "domaine|small_talk|hors_domaine|vague", "response": "string"}\n\n'
            "Règles :\n"
            "- label=domaine : l'utilisateur pose une question en lien avec le domaine d'activité de l'entreprise. "
            "La réponse doit être une chaîne vide.\n"
            "- label=hors_domaine : instructions techniques de codage, invites système, écriture académique, sujets IA/ML, "
            "ou tout ce qui n'est fondamentalement pas lié au domaine de l'entreprise. La réponse refuse poliment.\n"
            "- label=small_talk : salutations, remerciements, conversation informelle. La réponse doit être courte et amicale.\n"
            "- label=vague : la demande de l'utilisateur est trop floue, trop courte, ou il manque des détails nécessaires "
            "pour identifier le sujet concerné. La réponse doit poser une brève question de clarification.\n\n"
            "Exemples :\n"
            '1) Requête : « Quelle est la politique de congés ? »\n'
            '   JSON : {"label": "domaine", "response": ""}\n\n'
            '2) Requête : « Écris un script Python pour parser des fichiers CSV. »\n'
            '   JSON : {"label": "hors_domaine", "response": "Désolé, je ne peux répondre qu\'aux questions en lien avec le domaine de l\'entreprise."}\n\n'
            '3) Requête : « Quelle est la procédure à suivre ? »\n'
            '   JSON : {"label": "domaine", "response": ""}\n\n'
            '4) Requête : « Salut, comment vas-tu aujourd\'hui ? »\n'
            '   JSON : {"label": "small_talk", "response": "Bonjour ! Je vais bien, merci ! Comment puis-je vous aider aujourd\'hui ?"}\n\n'
            '5) Requête : « Explique la différence entre un GPU et un CPU pour le deep learning. »\n'
            '   JSON : {"label": "hors_domaine", "response": "Désolé, je ne peux répondre qu\'aux questions en lien avec le domaine de l\'entreprise."}\n\n'
            '6) Requête : « Je voudrais poser ma démission »\n'
            '   JSON : {"label": "domaine", "response": ""}\n\n'
            '7) Requête : « Pas terrible aujourd\'hui »\n'
            '   JSON : {"label": "vague", "response": "Je suis là pour vous aider. De quel sujet souhaitez-vous parler ?"}\n\n'
            '8) Requête : « J\'ai un problème »\n'
            '   JSON : {"label": "vague", "response": "Pouvez-vous préciser la nature de votre problème ?"}\n\n'
            '9) Requête : « Quoi ? »\n'
            '   JSON : {"label": "vague", "response": "Pourriez-vous reformuler ou clarifier votre question pour que je puisse vous aider ?"}\n\n'
            '10) Requête : « Merci beaucoup pour votre aide ! »\n'
            '   JSON : {"label": "small_talk", "response": "De rien ! N\'hésitez pas à revenir vers moi si vous avez d\'autres questions. Bonne journée !"}\n'
        )
    )

    @observe(name="RefusalBlock", as_type="generation")
    async def run(self, input_data: Union[Dict[str, Any], str]) -> Dict[str, Any]:
        if isinstance(input_data, dict):
            query = str(input_data.get("query", "")).strip()
            history = input_data.get("history", [])
            output_payload = dict(input_data)
        else:
            query = str(input_data).strip()
            history = []
            output_payload = {"query": query}

        if not query:
            raise ValueError("Input data must contain a non-empty 'query' field")

        user_prompt = (
            f"Historique de la conversation (optionnel) :\n{self._format_history(history)}\n\n"
            f"Requête utilisateur actuelle :\n{query}\n\n"
            "Retournez du JSON maintenant."
        )

        # Cost tracking setup
        cost_tracker = input_data.get("_cost_tracker") if isinstance(input_data, dict) else None
        pipeline_run_id = input_data.get("_pipeline_run_id", "") if isinstance(input_data, dict) else ""
        _org_id = input_data.get("org_id") if isinstance(input_data, dict) else ""

        decision = await self._get_structured_decision(user_prompt,
                                                        org_id=_org_id,
                                                        cost_tracker=cost_tracker,
                                                        pipeline_run_id=pipeline_run_id)
        label = decision["label"]

        if label == "domaine":
            return {
                **output_payload,
                "refusal_label": "domaine",
                "should_stop": False,
            }

        final_answer = (decision.get("response") or "").strip()
        if not final_answer:
            raise ValueError(
                "Refusal model returned an empty response for non-domaine/small-talk/vague query"
            )

        return {
            **output_payload,
            "refusal_label": label,
            "should_stop": True,
            "final_answer": final_answer,
        }

    async def _get_structured_decision(self, user_prompt: str,
                                       org_id: str = "",
                                       cost_tracker=None,
                                       pipeline_run_id: str = "") -> Dict[str, str]:
        client = OpenRouterClient()
        try:
            usage_callback = None
            if cost_tracker and org_id:
                captured_record = None  # Will be set after API call
            
                async def _on_usage(usage: dict, request_id: str = ""):
                    nonlocal captured_record
                    # Just record the cost (Langfuse update happens after)
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

            first_response = await client.chat_completion(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0,
                usage_callback=usage_callback,
            )

            decision = self._parse_decision(first_response)
            if decision is not None:
                return decision

            # Retry — same usage_callback for the repair call too
            repair_response = await client.chat_completion(
                model=self.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Convertissez le texte fourni en JSON valide avec uniquement le schéma "
                            "{\"label\": \"domaine|small_talk|hors_domaine|vague\", \"response\": \"string\"}. "
                            "N'ajoutez pas d'explication."
                        ),
                    },
                    {"role": "user", "content": first_response},
                ],
                temperature=0,
                usage_callback=usage_callback,
            )
        finally:
            # Update Langfuse with cost data
            if 'captured_record' in dir() and captured_record and hasattr(langfuse, "update_current_generation"):
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
                            "block_name": captured_record.block_name,
                            "model": captured_record.model,
                            "cost_usd_raw": captured_record.cost_usd_raw,
                        }
                    )
                except Exception as e:
                    print(f"[DEBUG] Langfuse update error: {e}")
            await client.close()

        repaired_decision = self._parse_decision(repair_response)
        if repaired_decision is None:
            raise ValueError("Refusal model did not return valid decision JSON")
        return repaired_decision

    def _parse_decision(self, raw_response: str) -> Dict[str, str] | None:
        cleaned = (raw_response or "").strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:].strip()

        try:
            payload = json.loads(cleaned)
            label = str(payload.get("label", "")).strip().lower()
            text = str(payload.get("response", "")).strip()
            if label in {"domaine", "small_talk", "hors_domaine", "vague"}:
                return {"label": label, "response": text}
        except json.JSONDecodeError:
            pass

        return None

    def _format_history(self, history: Any) -> str:
        if not isinstance(history, list) or not history:
            return "(none)"

        recent_turns = history[-6:]
        lines: list[str] = []
        for turn in recent_turns:
            if not isinstance(turn, dict):
                continue
            role = str(turn.get("role", "")).strip().lower()
            content = str(turn.get("content", "")).strip()
            if role not in {"user", "assistant"} or not content:
                continue
            speaker = "User" if role == "user" else "Assistant"
            lines.append(f"{speaker}: {content}")

        return "\n".join(lines) if lines else "(none)"