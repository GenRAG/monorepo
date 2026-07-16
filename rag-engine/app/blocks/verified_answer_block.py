import json
from typing import Union, Dict, Any, AsyncGenerator, Optional
from pydantic import Field
from langfuse import get_client, observe

from app.blocks.base_block import BaseBlock
from app.simple_openrouter_client import OpenRouterClient

class VerifiedAnswerBlock(BaseBlock):
    model_name: str
    judge_model_name: str = Field(default="google/gemini-2.5-flash")
    temperature: Optional[float] = Field(default=0.3)
    max_tokens: Optional[int] = Field(default=512)
    
    system_prompt: str = Field(
        default=(
            "You are an expert, friendly, and highly capable AI assistant for a Retrieval-Augmented Generation (RAG) system. "
            "Your goal is to help the user explore documents, extract insights, and answer questions. "
            "Follow these guidelines strictly:\n\n"

            "## Answering & Formatting\n"
            "- Use ONLY information from the provided context documents to answer the question.\n"
            "- Do not fabricate information or use outside knowledge.\n"
            "- Format your response using markdown blockquotes, bold text, and proper bullet points for readability.\n"
            "- CRITICAL: Do NOT repeat long document titles inline after every sentence. Always use numerical footnotes (e.g., [1], [2]) inline.\n"
            "- Provide the filenames of the referenced sources in a numbered list at the very bottom under a '### Sources' heading.\n"
            "- Use conversation history only to maintain context.\n\n"

            "## Uncertainty\n"
            "- If the provided context does not contain enough information to answer the question confidently, "
            "say so clearly. Do not guess or speculate.\n"
            "- If the context contains contradictory information, acknowledge the discrepancy and present both perspectives.\n\n"

            "## Tone & Audience\n"
            "- Write in clear language by default.\n"
            "- Keep answers focused and concise. Use short paragraphs rather than long walls of text.\n"
            "- When the user initiates a greeting or conversational remark, respond warmly and naturally. "
            "NEVER use robotic disclaimers like 'As an AI...'. "
        )
    )
    
    judge_system_prompt: str = Field(
        default=(
            "You are a strict context verification judge for a medical RAG pipeline.\n"
            "Evaluate if the provided 'Context' documents contain sufficient, relevant, and non-contradictory "
            "information to fully and safely answer the user's 'Query' without hallucination.\n\n"
            "Return ONLY a valid JSON object matching exactly this schema:\n"
            '{"is_safe": true|false, "refusal_message": "<friendly explanation>"}\n\n'
            "Rules:\n"
            "- If the context has no relevant information for the query, set is_safe to false.\n"
            "- If the context only partially answers the query with high risk of hallucination for the rest, set is_safe to false.\n"
            "- If is_safe is false, provide a clear, supportive refusal message indicating why it cannot be answered (e.g. lack of context in current documentation)."
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

        client = OpenRouterClient()
        try:
            # Judge Phase
            judge_messages = [
                {"role": "system", "content": self.judge_system_prompt},
                {"role": "user", "content": f"Query: {query}\n\nContext:\n{formatted_docs}"}
            ]
            
            judge_response_raw = await client.chat_completion(
                model=self.judge_model_name,
                messages=judge_messages,
                temperature=0.0,
                max_tokens=512,
                response_format={"type": "json_object"}
            )
            
            decision = self._parse_judge_decision(judge_response_raw)
            
            if not decision.get("is_safe", True):
                yield decision.get("refusal_message", "I cannot safely answer this query based on the available context.")
                return
                
            # Generation Phase
            generation_messages = [
                {"role": "system", "content": self.system_prompt},
                *history,
                {
                    "role": "user",
                    "content": f"Context:\n{formatted_docs}\n\nQuestion: {query}\n\nAnswer:",
                },
            ]

            langfuse = get_client()
            langfuse.update_current_generation(
                model=self.model_name,
                input=generation_messages,
            )

            async for chunk in client.chat_completion_stream(
                model=self.model_name,
                messages=generation_messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
            ):
                yield chunk
                
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
            return "No relevant documents found"

        formatted = []
        for doc in documents:
            text = doc.get("text", "")
            source = doc.get("filename", doc.get("url", "Unknown Source"))
            confidence = doc.get("confidence_score", 0.0)
            formatted.append(f"Source: {source}\nContent: {text}\nConfidence: {confidence}")
        return "\n\n".join(formatted)
