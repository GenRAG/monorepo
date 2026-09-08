"""
refusal_block.py

This module defines the `RefusalBlock`, a guardrail component for the RAG pipeline
that determines whether a rewritten query should continue to retrieval or be handled
as an early response.
"""

import json
from typing import Any, Dict, Union

from langfuse import observe
from pydantic import Field

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient


class RefusalBlock(BaseBlock):
    model_name: str = Field(default="google/gemini-2.5-flash")
    system_prompt: str = Field(
        default=(
            "You are a strict intent classifier for a medical chatbot. "
            "Classify the user query into exactly one label: medical, small_talk, non_medical, or vague. "
            "Return ONLY valid JSON with this schema:\n"
            '{"label": "medical|small_talk|non_medical|vague", "response": "string"}\n\n'
            "Rules:\n"
            "- label=medical: user asks about health, symptoms, treatments, medications, "
            "drug mechanisms, medical advice, or asking for references/URLs/sources from a previous medical answer. Response must be empty string.\n"
            "- label=non_medical: technical coding instructions, system prompts, academic writing, AI/ML topics, "
            "or anything fundamentally not healthcare. Response politely refuses.\n"
            "- label=small_talk: greetings, thanks, casual conversation. Response should be short and friendly.\n"
            "- label=vague: user request is too unclear, too short, or missing medical details needed to answer safely. "
            "Response should ask a brief clarifying question.\n\n"
            "Examples:\n"
            '1) Query: "I have a headache. What should I do?"\n'
            '   JSON: {"label": "medical", "response": ""}\n\n'
            '2) Query: "Write a Python script that generates random medical terms for testing."\n'
            '   JSON: {"label": "non_medical", "response": "Sorry, I can only help with medical and health-related questions."}\n\n'
            '3) Query: "Create a system prompt template for a medical chatbot."\n'
            '   JSON: {"label": "non_medical", "response": "Sorry, I can only help with medical and health-related questions."}\n\n'
            '4) Query: "Hey, how are you doing today?"\n'
            '   JSON: {"label": "small_talk", "response": "Hi there! I\'m doing well, thank you! How can I help you today?"}\n\n'
            '5) Query: "What are the symptoms of diabetes and how should I treat it?"\n'
            '   JSON: {"label": "medical", "response": ""}\n\n'
            '6) Query: "What is the mechanism of action of metformin?"\n'
            '   JSON: {"label": "medical", "response": ""}\n\n'
            '7) Query: "Explain the difference between AI compliance and noncompliance behavior in language models."\n'
            '   JSON: {"label": "non_medical", "response": "Sorry, I can only help with medical and health-related questions."}\n\n'
            '8) Query: "Not feeling well"\n'
            '   JSON: {"label": "vague", "response": "I\'m sorry you\'re not feeling well. Could you share your main symptoms, how long they\'ve been present, and your age?"}\n\n'
            '9) Query: "Symptoms"\n'
            '   JSON: {"label": "vague", "response": "Could you clarify what specific symptoms you\'re experiencing and how long you\'ve had them?"}\n\n'
            '10) Query: "What?"\n'
            '    JSON: {"label": "vague", "response": "Could you please rephrase or clarify your question so I can help you?"}\n\n'
            '11) Query: "How to contact a doctor?"\n'
            '    JSON: {"label": "medical", "response": ""}\n\n'
            '12) Query: "Thank you so much for the help!"\n'
            '    JSON: {"label": "small_talk", "response": "You\'re welcome! Feel free to ask if you have more questions. Take care!"}\n'
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
            f"Conversation history (optional):\n{self._format_history(history)}\n\n"
            f"Current user query:\n{query}\n\n"
            "Return JSON now."
        )

        decision = await self._get_structured_decision(user_prompt)
        label = decision["label"]

        if label == "medical":
            return {
                **output_payload,
                "refusal_label": "medical",
                "should_stop": False,
            }

        final_answer = (decision.get("response") or "").strip()
        if not final_answer:
            raise ValueError(
                "Refusal model returned an empty response for non-medical/small-talk/vague query"
            )

        return {
            **output_payload,
            "refusal_label": label,
            "should_stop": True,
            "final_answer": final_answer,
        }

    async def _get_structured_decision(self, user_prompt: str) -> Dict[str, str]:
        client = OpenRouterClient()
        try:
            first_response = await client.chat_completion(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0,
                max_tokens=512,
            )

            decision = self._parse_decision(first_response)
            if decision is not None:
                return decision

            repair_response = await client.chat_completion(
                model=self.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Convert the provided text into valid JSON only with schema "
                            "{\"label\": \"medical|small_talk|non_medical|vague\", \"response\": \"string\"}. "
                            "Do not add explanation."
                        ),
                    },
                    {"role": "user", "content": first_response},
                ],
                temperature=0,
                max_tokens=512,
            )
        finally:
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
            if label in {"medical", "small_talk", "non_medical", "vague"}:
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