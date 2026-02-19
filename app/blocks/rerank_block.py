from typing import Union, Dict, Any, List
from pydantic import Field
from langfuse import observe

from .base_block import BaseBlock
from app.config import Config


class RerankBlock(BaseBlock):
    provider: str = Field(
        default="zeroentropy", description="Reranking provider (zeroentropy or cohere)"
    )
    model: str = Field(default="rerank-2.0", description="Reranking model to use")
    top_k: int = Field(
        default=5, description="Number of top documents to return after reranking"
    )

    @observe(name="RerankBlock")
    async def run(self, input_data: Union[Dict[str, Any], str]) -> Dict[str, Any]:
        if isinstance(input_data, dict):
            query = input_data.get("query", "")
            documents = input_data.get("retrieved_documents", [])
        else:
            query = str(input_data)
            documents = []

        if documents:
            text_docs = [
                doc.get("text", "") if isinstance(doc, dict) else doc
                for doc in documents
            ]
        else:
            text_docs = []

        if not query:
            raise ValueError("Query cannot be empty")
        if not text_docs:
            raise ValueError("No documents to rerank")

        if self.provider == "zeroentropy":
            return await self._rerank_zeroentropy(query, text_docs, input_data)
        elif self.provider == "cohere":
            return await self._rerank_cohere(query, text_docs, input_data)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")

    async def _rerank_zeroentropy(
        self, query: str, documents: List[str], input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        from zeroentropy import ZeroEntropy

        if not Config.ZEROENTROPY_KEY:
            raise ValueError("ZEROENTROPY_API_KEY not found in environment variables")
        zclient = ZeroEntropy(api_key=Config.ZEROENTROPY_KEY)
        response = zclient.models.rerank(
            model=self.model,
            query=query,
            documents=documents,
        )
        reranked_indices = [
            item.index
            for item in sorted(
                response.results, key=lambda x: x.relevance_score, reverse=True
            )[: self.top_k]
        ]
        # Return original document dictionaries that were reranked
        reranked_dicts = [
            documents[i] if isinstance(documents[i], dict) else {"text": documents[i]}
            for i in reranked_indices
        ]
        return {**input_data, "retrieved_documents": reranked_dicts}

    async def _rerank_cohere(
        self, query: str, documents: List[str], input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        import cohere

        if not Config.COHERE_KEY:
            raise ValueError("COHERE_API_KEY not found in environment variables")
        co = cohere.ClientV2(api_key=Config.COHERE_KEY)
        response = co.rerank(
            model=self.model,
            query=query,
            documents=documents,
            top_n=self.top_k,
        )
        reranked_indices = [
            item.index
            for item in sorted(
                response.results, key=lambda x: x.relevance_score, reverse=True
            )
        ]
        # Return original document dictionaries that were reranked
        reranked_dicts = [
            documents[i] if isinstance(documents[i], dict) else {"text": documents[i]}
            for i in reranked_indices
        ]
        return {**input_data, "retrieved_documents": reranked_dicts}
