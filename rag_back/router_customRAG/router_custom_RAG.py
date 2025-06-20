from constants import PINECONE_API_KEY, PINECONE_TOP_K, PINECONE_INDEX_NAME, PINECONE_NAMESPACE, COHERE_API_KEY, COHERE_RERANKER_TOP_K, COHERE_RERANKER_MODEL
from fastapi import APIRouter, Query, File, UploadFile, HTTPException
from fastapi.responses import Response, StreamingResponse
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chains import create_history_aware_retriever
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import os
import cohere
import asyncio
import uuid

pc = Pinecone(api_key=PINECONE_API_KEY)

llm = ChatOpenAI(
    openai_api_key=os.environ.get("OPEN_ROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    model_name='google/gemini-flash-1.5',
    temperature=0.0,
)



co = cohere.Client(COHERE_API_KEY)

class BaseBlock:
    def execute(self, context):
        raise NotImplementedError

class QueryBlock(BaseBlock):
    def execute(self, context):
        if "query" not in context:
            raise ValueError("Query not found in context")
        return context

class HistoryBlock(BaseBlock):
    def execute(self, context):
        if "query" not in context:
            raise ValueError("Query not found in context")
        if "history" not in context:
            context["history"] = []

        template_history = """
        Given a chat history and the latest user question \
        which might reference context in the chat history, formulate a standalone question \
        which can be understood without the chat history. Do NOT answer the question, \
        just reformulate it if needed and otherwise return it as is. Do not hesitate to preprocess a bit of the question if it's based on the chat history.

        Chat history:
        {chat_history}

        User question:
        {input}

        History based question:
        """

        prompt_history = PromptTemplate.from_template(template_history)

        history_message = prompt_history.invoke({"chat_history": context["history"], "input": context["query"]})
        history_response = llm.invoke(history_message)

        context["query_standalone"] = history_response.content
        if history_response.content:
            print(history_response.content)

class HyDeBlock(BaseBlock):
    def execute(self, context):
        if "query" not in context:
            raise ValueError("Query not found in context")

        # HyDe is used to generate a false answer to the question to be used as a context to retrieve relevant documents
        template_HyDE = """"Please write a hypotetical response that answer the following question.
        Question: {question}
        Passage:"""


        prompt_hyde = PromptTemplate.from_template(template_HyDE)

        HyDeMessage = prompt_hyde.invoke({"question": context["retrival_query"]})
        HyDeResponse = llm.invoke(HyDeMessage)
        context["retrival_query"] = HyDeResponse.content

class RetrieverBlock(BaseBlock):
    def execute(self, context):
        try:
            query_embedding = pc.inference.embed(
                model="multilingual-e5-large",
                inputs=[context["retrival_query"]],
                parameters={"input_type": "query"}
            )
            results = pc.Index(PINECONE_INDEX_NAME).query(
                namespace=PINECONE_NAMESPACE,
                vector=query_embedding[0].values,
                top_k=PINECONE_TOP_K,
                include_metadata=True
            )
            documents = [
                {"text": x["metadata"]["text"]} for x in results.matches
            ]
            context["documents"] = documents
        except Exception as e:
            raise RuntimeError(f"Error in retriever block: {e}")

class RerankerBlock(BaseBlock):
    def execute(self, context):
        reranked_documents_row = co.rerank(query=context["query"], documents=context["documents"], model=COHERE_RERANKER_MODEL)
        reranked_ids = [reranked_documents_row.results[i].index for i in range(COHERE_RERANKER_TOP_K)]

        rerank_documents = []

        for id in reranked_ids:
            rerank_documents.append(context["documents"][id])

        context["documents"] = rerank_documents

class GeneratorBlock(BaseBlock):
    def execute(self, context, config=None):
        if config is None:
            raise ValueError("Config must be provided to GeneratorBlock")

        if "history" in context:
            messages = config["custom_prompt_with_history"].invoke({
                "question": context["query_standalone"],
                "context": context["documents"],
                "history": context["history"]
            })
        else:
            messages = config["custom_prompt"].invoke({
                "question": context["query"],
                "context": context["documents"]
            })

        system_response = {"system": ""}
        context["history"].append({"user": context["query"]})
        context["history"].append(system_response)

        async def generate():
            try:
                async for chunk in llm.astream(messages):
                    if chunk.content:
                        system_response["system"] += chunk.content
                        yield chunk.content
            except Exception as e:
                yield f"[Internal Error: {e}]"
                raise

        context["generator_response"] = StreamingResponse(generate(), media_type="text/plain")


class CustomRAG:
    def __init__(self, config):
        self.config = config
        self.available_blocks = {
            "query": QueryBlock,
            "retriever": RetrieverBlock,
            "hyde": HyDeBlock,
            "history": HistoryBlock,
            "reranker": RerankerBlock,
            "generator": GeneratorBlock,
        }

        self.context = {
            "query": "",
            "retrival_query": "",
            "documents": [],
            "history": []
        }

        custom_template = """Tu es un assistant chargé de répondre au questions des utilisateurs en te basant sur le contexte que tu as reçu. Si tu ne connais pas la réponse, tu peux dire que tu ne sais pas. Essaye toujours de fournir la meilleure réponse possible. Toujours vérifier que le contexte est pertinent à la question.
        Question: {question}
        Context: {context}
        Answer:"""

        custom_template_with_history = """Tu es un assistant chargé de répondre au questions des utilisateurs en te basant sur le contexte ainsi que l'historique de conversation qui sera très important pour répondre aux question. Si tu ne connais pas la réponse, tu peux dire que tu ne sais pas. Essaye toujours de fournir la meilleure réponse possible. Toujours vérifier que le contexte est pertinent à la question.

        Contexte: {context}
        Historique: {history}
        Question: {question}
        Reponse:"""

        self.config["custom_prompt"] = PromptTemplate.from_template(custom_template)
        self.config["custom_prompt_with_history"] = PromptTemplate.from_template(custom_template_with_history)

    def update_pipeline(self, pipeline):

        response = {"message": f"Pipeline updated from: {self.config['pipeline']} to: {pipeline}"}
        self.config["pipeline"] = pipeline
        return response

    def invoke(self, query):
        self.context["query"] = query
        self.context["retrival_query"] = query
        self.context["documents"] = []

        try:
            for block_name in self.config["pipeline"]:
                print(f"Executing block: {block_name}")
                block_class = self.available_blocks.get(block_name)
                # if not block_class:
                #     raise ValueError(f"Block '{block_name}' not found in available blocks")
                if block_name == "generator":
                    block = block_class()
                    block.execute(self.context, config=self.config)
                else:
                    block = block_class()
                    block.execute(self.context)
            return self.context["generator_response"]
        except Exception as e:
            print(f"Pipeline error: {e}")
            raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")

# config = {"pipeline": ["query", "retriever", "reranker", "generator"]}
config = {"pipeline": ["query", "history", "retriever", "reranker", "generator"]}

pipeline = CustomRAG(config)

router_custom_RAG = APIRouter()

@router_custom_RAG.on_event("startup")
async def startup_event():
    try:
        index_info = pc.describe_index(PINECONE_INDEX_NAME)
        print(f"Pinecone index '{PINECONE_INDEX_NAME}' is available.")
    except Exception as e:
        raise RuntimeError(f"Pinecone index '{PINECONE_INDEX_NAME}' not accessible: {e}")

"""
Example of a custom RAG pipeline
{
    "pipeline": ["query", "retriever", "generator"]
}
"""
@router_custom_RAG.post("/update_pipeline/")
async def config_custom_RAG(pipeline_config: dict):
    return pipeline.update_pipeline(pipeline_config["pipeline"])

# Update the model used in the generator block
@router_custom_RAG.post("/update_model/")
async def update_model(model_name: str):
    if not model_name:
        raise HTTPException(status_code=400, detail="Model name cannot be empty.")
    
    try:
        llm.model_name = model_name
        return {"message": f"Model updated to: {model_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update model: {str(e)}")

@router_custom_RAG.get("/get_model/")
async def get_model():
    if not llm.model_name:
        raise HTTPException(status_code=404, detail="Model name not set.")
    return {"model_name": llm.model_name}
    
@router_custom_RAG.get("/config/pipeline")
async def get_config():
    return pipeline.config["pipeline"]

@router_custom_RAG.get("/history/")
async def get_history():
    return pipeline.context["history"]

@router_custom_RAG.post("/query/")
async def query_custom_RAG(query: str = Query(...)):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Empty or invalid query provided.")
    return pipeline.invoke(query)


@router_custom_RAG.post("/mock_query/")
async def mock_query_custom_RAG(query: str = Query(...)):
    mock_response = """
Voici quelques entreprises qui peuvent vous former en IA :

1. **Backprop**
   - **Site Web**: [formation.backprop.fr](https://formation.backprop.fr/)
   - **Localisation**: Rennes
   - **Description**: Accompagne les entreprises bretonnes avec des formations et conseils en IA générative, aidant les TPE/PME à intégrer l'IA pour booster leur productivité et créativité.

2. **Lumiere formation**
   - **Site Web**: [lumiere-formations.com](https://www.lumiere-formations.com/)
   - **Localisation**: Rennes
   - **Description**: Forme à l'usage de l'IA Générative dans les entreprises, syndicats et médias, avec un atelier découverte d'une journée comprenant 90% d'exercices pratiques.

3. **Miakito**
   - **Site Web**: [miakito.ai/fr](https://miakito.ai/fr/)
   - **Localisation**: Rennes
   - **Description**: Propose des formations, audits, diagnostics et conception de solutions d'IA sur mesure pour automatiser les tâches répétitives.

4. **Polaria**
   - **Site Web**: [polaria.ai](https://polaria.ai/)
   - **Localisation**: Finistère
   - **Description**: Offre des conférences d'acculturation, des formations et le développement de solutions technologiques, y compris des solutions d'IA conversationnelles et génératives.

Ces entreprises sont bien positionnées pour vous aider à acquérir des compétences en IA.
"""

    async def generate():
        for i in range(0, len(mock_response), 5):  # Par groupes de 5 caractères
            yield mock_response[i:i+5]
            await asyncio.sleep(0.05)  # Simule un délai réseau
    return StreamingResponse(generate(), media_type="text/plain")



