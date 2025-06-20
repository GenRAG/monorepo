# Custom RAG System Documentation

## What is this?

This is a modular RAG system I built using FastAPI. It's designed to be flexible - you can configure different processing blocks in a pipeline to handle queries however you want. The system uses Pinecone for vector search, Cohere for reranking, and connects to OpenRouter for LLM access.

## Setup

You'll need these API keys in your environment:
- `OPEN_ROUTER_API_KEY` for the LLM calls
- Plus the usual constants (Pinecone, Cohere keys, etc.)

The LLM is configured to use Google's Gemini Flash 1.5 through OpenRouter:

```python
llm = ChatOpenAI(
    openai_api_key=os.environ.get("OPEN_ROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    model_name='google/gemini-flash-1.5',
    temperature=0.0,
)
```

## How the blocks work

The whole system is built around these processing blocks. Each block does one thing and passes the context to the next block.

### QueryBlock
Just checks if there's actually a query in the context. Pretty basic but necessary.

### HistoryBlock
This one's useful for handling conversation history. It takes the current query and the chat history, then asks the LLM to reformulate the question so it makes sense without needing the previous context. The prompt I use is:

```
Given a chat history and the latest user question \
which might reference context in the chat history, formulate a standalone question \
which can be understood without the chat history. Do NOT answer the question, \
just reformulate it if needed and otherwise return it as is. Do not hesitate to preprocess a bit of the question if it's based on the chat history.
```

### HyDeBlock
Implements HyDE (Hypothetical Document Embeddings). Basically asks the LLM to write a fake answer to the question, then uses that fake answer for retrieval. Sometimes works better than using the raw question.

### RetrieverBlock
Does the vector search in Pinecone. Uses the `multilingual-e5-large` model for embeddings and pulls the top-k results from the specified namespace.

### RerankerBlock
Takes the retrieved documents and reranks them using Cohere's reranking API. Usually improves the relevance of the results.

### GeneratorBlock
The final step - generates the actual response. It handles both regular queries and history-aware queries with different prompts. Returns a streaming response so users don't have to wait for the entire answer.

## The CustomRAG class

This is where everything comes together. The constructor sets up the available blocks and the context structure:

```python
self.context = {
    "query": "",
    "retrival_query": "",
    "documents": [],
    "history": []
}
```

The `invoke` method runs through whatever pipeline you've configured. Default pipeline is `["query", "history", "retriever", "reranker", "generator"]` but you can change it.

### Prompts

I'm using French prompts since that's what I needed:

For regular queries:
```
Tu es un assistant chargé de répondre au questions des utilisateurs en te basant sur le contexte que tu as reçu. Si tu ne connais pas la réponse, tu peux dire que tu ne sais pas. Essaye toujours de fournir la meilleure réponse possible. Toujours vérifier que le contexte est pertinent à la question.
Question: {question}
Context: {context}
Answer:
```

For queries with history:
```
Tu es un assistant chargé de répondre au questions des utilisateurs en te basant sur le contexte ainsi que l'historique de conversation qui sera très important pour répondre aux question. Si tu ne connais pas la réponse, tu peux dire que tu ne sais pas. Essaye toujours de fournir la meilleure réponse possible. Toujours vérifier que le contexte est pertinent à la question.

Contexte: {context}
Historique: {history}
Question: {question}
Reponse:
```

## API endpoints

### POST /update_pipeline/
Change the processing pipeline. Send something like:
```json
{
    "pipeline": ["query", "retriever", "generator"]
}
```

### POST /update_model/
Switch to a different model. Just pass the model name as a parameter.

### GET /get_model/
Returns the current model name.

### GET /config/pipeline
Shows the current pipeline configuration.

### GET /history/
Returns the conversation history.

### POST /query/
The main endpoint. Pass your query as a parameter and get back a streaming response.

### POST /mock_query/
I added this for testing. Returns a hardcoded response about AI training companies in Brittany. Streams the response character by character with a small delay to simulate real generation.

## Error handling

Pretty straightforward error handling:
- 400 for bad requests (empty queries, etc.)
- 404 when something's not found
- 500 for internal errors (Pinecone failures, pipeline issues)

The startup event checks if the Pinecone index is accessible and fails fast if it's not.

## Notes

- The system maintains conversation history across requests
- All responses are streamed for better UX
- The vector search uses cosine similarity
- Everything's configured through constants so it's easy to change settings
- The reranker helps improve retrieval quality but adds latency

The modular design makes it easy to experiment with different pipeline configurations. You can skip history processing, add HyDE, remove reranking, whatever works best for your use case.