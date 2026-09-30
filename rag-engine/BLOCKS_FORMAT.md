# RAG Pipeline — Blocks Format Documentation

### This document describes all available blocks within GenRAG for building a RAG pipeline using the `POST /rag/stream` endpoint.

##### Each block has a `type` and a `name`, as well as other parameters specific to the block itself. When calling `POST /rag/stream`, blocks are executed in the order defined in the block list, and the result of each block is passed to the next one, like a classic pipeline. Every RAG pipeline must start with a `query` block (the user's question) and end with a response generation block (`answer` or `verified_answer`) that will stream the final answer.

---

## Table of Contents

- [Request payload structure](#request-payload-structure)
- [`query` block](#1-query)
- [`query_rewrite` block](#2-query_rewrite)
- [`retrieve` block](#3-retrieve)
- [`rerank` block](#4-rerank)
- [`refusal` block](#5-refusal)
- [`answer` block](#6-answer)
- [`verified_answer` block](#7-verified_answer)
- [`hyde` block](#8-hyde)
- [Complete examples](#complete-examples)
- [Parameters summary](#parameters-summary-by-block)
- [Important rules](#important-rules)

---

## Request Payload Structure

When calling `POST /rag/stream`, the payload must contain the pipeline configuration and the API key must be present in the `X-API-Key` header. The JSON payload must have the following structure:

```bash
curl -X POST "http://146.59.190.130:8000/rag/stream" \
     -H "X-API-Key: xxx" \
     -H "Content-Type: application/json" \
     -d '{
           "pipeline": {
             "pipeline_name": "my_rag_pipeline",
             "blocks": [
               { "type": "query", "name": "query" },
               { "type": "query_rewrite", "name": "rewrite" },
               { "type": "retrieve", "name": "retrieve", "collection_name": "genrag_knowledge_base", "top_k": 20 },
               { "type": "rerank", "name": "rerank", "provider": "zeroentropy", "model": "zerank-2", "top_k": 10 },
               { "type": "answer", "name": "generator" }
             ]
           },
           "query": "How do paid vacation days work in France?",
           "org_id": "onboarding",
           "chat_history": []
         }'
```


| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `pipeline.pipeline_name` | `string` | `"rag_pipeline"` | Pipeline name (logging) |
| `pipeline.blocks` | `array` | **required** | List of blocks to execute in the RAG workflow |
| `query` | `string` | **required** | User's question |
| `org_id` | `string` | `null` | Organization identifier, used during vector search to filter documents by organization |
| `chat_history` | `array` | `[]` | Conversation history |

---

## 0. `base_block`

`base_block` is the parent block of all other blocks. It contains the common fields shared by all blocks: `type` and `name`. All other blocks inherit from this one, so these fields are mandatory for every block.

This block is not meant to be used directly in a pipeline; it serves as the base definition for other blocks.

## 1. `query`

The `query` block is the entry point of the pipeline. Every RAG pipeline must start with this block. It represents the user's question, which is then passed to the next block for processing. It has no configurable parameters.

Example `query` block:
**Parameters:** (none)

```json
{
  "type": "query",
  "name": "query"
}
```

---

## 2. `query_rewrite`

The `query_rewrite` block rewrites the user's question before passing it to the vector search. It uses an LLM to clarify and improve the query formulation, which is especially useful for poorly worded or ambiguous questions, as well as follow-up questions in a conversation.

**Features:**
- **Contextual rewriting**: uses conversation history to resolve references and follow-up questions (e.g., "give more details" → becomes a standalone question)
- **Customizable prompt**: ability to provide custom system instructions
- **Creativity control**: adjustable temperature (0 = strict/faithful, higher = more varied expansions)
- **Propagation control**: the `overwrite_query` flag lets you choose whether the rewrite affects both search AND generation, or only search
- **Multi-query**: the `num_queries` parameter generates multiple query variants for broader search coverage

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model_name` | `string` | `"google/gemini-2.5-flash"` | LLM model used for rewriting |
| `temperature` | `float` | *(not set)* | Controls creativity (0 = deterministic, higher = more varied) |
| `max_tokens` | `int` | *(not set)* | Maximum length of the rewritten query |
| `system_prompt` | `string` | *(default prompt)* | Custom system instructions for rewriting |
| `overwrite_query` | `boolean` | `true` | `true` = the rewrite is used for both search AND response; `false` = only for search |
| `num_queries` | `int` | `1` | Number of query variants to generate. `1` = current behavior, `>1` = multi-query expansion |

```json
{
  "type": "query_rewrite",
  "name": "rewrite",
  "model_name": "google/gemini-2.5-flash",
  "temperature": 0.0,
  "max_tokens": 250,
  "system_prompt": "You are a Human Resources expert, rewrite the query to be more formal and clear, and expand any abbreviations.",
  "overwrite_query": true,
  "num_queries": 1
}
```

---

## 3. `retrieve`

Queries the Qdrant vector database with the query embedding to retrieve the most relevant documents.

**Multi-query support**: if the previous block set `num_queries > 1`, the `retrieve` block automatically detects the multiple queries, runs parallel searches, and deduplicates results before passing them to the next block.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `collection_name` | `string` | `"genrag_knowledge_base"` | Qdrant collection to query |
| `top_k` | `int` | `5` | Number of documents to retrieve per query (max 100) |

```json
{
  "type": "retrieve",
  "name": "retrieve",
  "collection_name": "genrag_knowledge_base",
  "top_k": 20
}
```

---

## 4. `rerank`

Re-orders the retrieved documents using an external re-ranking service. Improves result relevance.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `provider` | `string` | `"zeroentropy"` | Provider: `"zeroentropy"` or `"cohere"` |
| `model` | `string` | `"zerank-2"` | Re-ranking model |
| `top_k` | `int` | `5` | Number of documents kept after re-ranking |

```json
{
  "type": "rerank",
  "name": "rerank",
  "provider": "zeroentropy",
  "model": "zerank-2",
  "top_k": 10
}
```

---

## 5. `refusal`

Guardrail block that classifies the query intent. Can **stop the pipeline** if the question is out-of-domain or deemed inappropriate.

**Behavior:** adds `refusal_label`, `should_stop`, and optionally `final_answer` to the pipeline data.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model_name` | `string` | `"google/gemini-2.5-flash"` | LLM model for classification |

```json
{
  "type": "refusal",
  "name": "guard",
  "model_name": "google/gemini-2.5-flash"
}
```

---

## 6. `answer`

Response generation block **with streaming**. This is the simplest final block. Uses an LLM to answer based on the context.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model` | `string` | `"google/gemini-2.5-flash"` | LLM model for generation |
| `temperature` | `float` | `0.7` | Controls creativity (0 = deterministic, 2 = very random) |
| `max_tokens` | `int` | `2048` | Maximum number of tokens in the response |
| `system_prompt` | `string` | *(default prompt)* | Custom system instructions |

```json
{
  "type": "answer",
  "name": "answer",
  "model": "google/gemini-2.5-flash",
  "temperature": 0.7,
  "max_tokens": 2048
}
```

> 💡 All parameters except `type` and `name` are optional.

---

## 7. `verified_answer`

**Verified** response block. Before answering, an LLM judge validates that the retrieved context is sufficient. If the context is insufficient, it returns a refusal instead of an answer.

**How it works:**
1. Filters documents with a confidence score ≥ 0.8
2. Asks the judge whether the context is sufficient
3. If yes → generates the response
4. If no → returns a refusal message

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model` | `string` | `"google/gemini-2.5-flash"` | LLM model for response generation |
| `judge_model` | `string` | `"google/gemini-2.5-flash"` | LLM model for context verification |
| `temperature` | `float` | `0.3` | Lower temperature for higher reliability |
| `max_tokens` | `int` | `512` | Maximum number of tokens |

```json
{
  "type": "verified_answer",
  "name": "generator",
  "model": "google/gemini-2.5-flash",
  "judge_model": "google/gemini-2.5-flash",
  "temperature": 0.3,
  "max_tokens": 512
}
```

---

## 8. `hyde`

Generates one or more hypothetical documents from the query, then uses **their embeddings** for retrieval (HyDE — Hypothetical Document Embeddings). Can improve relevance when the query is very different from the stored documents.

**Features:**
- **Multi-query support**: `num_queries` generates N hypothetical documents for broader search
- **Two modes**: `override` (ignores `_queries` from previous blocks) and `compose` (multiplies `_queries`)

### Modes

| Mode | Behavior | When to use |
|------|----------|-------------|
| `override` (default) | Ignores `_queries`, generates `num_queries` documents from `query` | HyDE alone, or after a block that doesn't use `_queries` |
| `compose` | Takes each query from `_queries` and generates `num_queries` documents per query | After `query_rewrite` with `num_queries` — multiplier effect |

### Multiplier effect examples

```json
// rewrite(3) → hyde(2, compose) → 6 retrievals
"blocks": [
  { "type": "query_rewrite", "name": "rewrite", "num_queries": 3 },
  { "type": "hyde", "name": "hyde", "num_queries": 2, "mode": "compose" },
  { "type": "retrieve", "name": "retrieve", "top_k": 20 },
  { "type": "rerank", "name": "rerank", "top_k": 10 },
  { "type": "answer", "name": "answer" }
]
```

```json
// rewrite(3) → hyde(3, override) → ignores _queries, 3 hyde docs from original query
"blocks": [
  { "type": "query_rewrite", "name": "rewrite", "num_queries": 3 },
  { "type": "hyde", "name": "hyde", "num_queries": 3, "mode": "override" },
  { "type": "retrieve", "name": "retrieve", "top_k": 20 },
  ...
]
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model` | `string` | `"google/gemini-2.5-flash"` | LLM model for hypothetical document generation |
| `num_queries` | `int` | `1` | Number of hypothetical documents to generate |
| `mode` | `"override"` \| `"compose"` | `"override"` | `"override"` ignores previous blocks' queries; `"compose"` multiplies them |

```json
{
  "type": "hyde",
  "name": "hyde",
  "model": "google/gemini-2.5-flash",
  "num_queries": 3,
  "mode": "override"
}
```

---

## Complete Examples

### Minimal pipeline — Query → Retrieve → Answer

```json
{
  "pipeline": {
    "pipeline_name": "minimal_rag",
    "blocks": [
      { "type": "query", "name": "query" },
      { "type": "retrieve", "name": "retrieve", "top_k": 5 },
      { "type": "answer", "name": "answer" }
    ]
  },
  "query": "What is RAG?",
  "org_id": "org123"
}
```

### Full pipeline — Rewrite → Retrieve → Rerank → Verified Answer

```json
{
  "pipeline": {
    "pipeline_name": "full_rag",
    "blocks": [
      { "type": "query", "name": "query" },
      { "type": "query_rewrite", "name": "rewrite" },
      { "type": "retrieve", "name": "retrieve", "collection_name": "genrag_knowledge_base", "top_k": 50 },
      { "type": "rerank", "name": "rerank", "provider": "zeroentropy", "model": "zerank-2", "top_k": 10 },
      { "type": "verified_answer", "name": "generator" }
    ]
  },
  "query": "Explain the symptoms of diabetes",
  "org_id": "org123"
}
```

### Guarded pipeline — Refusal → Rewrite → Retrieve → Answer

```json
{
  "pipeline": {
    "pipeline_name": "guarded_rag",
    "blocks": [
      { "type": "query", "name": "query" },
      { "type": "refusal", "name": "guard" },
      { "type": "query_rewrite", "name": "rewrite" },
      { "type": "retrieve", "name": "retrieve", "top_k": 20 },
      { "type": "answer", "name": "answer" }
    ]
  },
  "query": "I have a headache",
  "org_id": "org123"
}
```

---

### Multi-query expansion pipeline — Rewrite(3) → Retrieve(×3) → Rerank → Answer

```json
{
  "pipeline": {
    "pipeline_name": "multi_query_rag",
    "blocks": [
      { "type": "query", "name": "query" },
      {
        "type": "query_rewrite",
        "name": "rewrite",
        "num_queries": 3,
        "temperature": 0.3,
        "overwrite_query": false
      },
      { "type": "retrieve", "name": "retrieve", "top_k": 20 },
      { "type": "rerank", "name": "rerank", "top_k": 10 },
      { "type": "answer", "name": "answer" }
    ]
  },
  "query": "Explain the RAG architecture and its components",
  "org_id": "org123"
}
```

### HyDE compose pipeline — Rewrite(2) → HyDE(2, compose) → Retrieve(×4) → Rerank → Answer

```json
{
  "pipeline": {
    "pipeline_name": "hyde_compose_rag",
    "blocks": [
      { "type": "query", "name": "query" },
      { "type": "query_rewrite", "name": "rewrite", "num_queries": 2 },
      {
        "type": "hyde",
        "name": "hyde",
        "num_queries": 2,
        "mode": "compose"
      },
      { "type": "retrieve", "name": "retrieve", "top_k": 20 },
      { "type": "rerank", "name": "rerank", "top_k": 10 },
      { "type": "answer", "name": "answer" }
    ]
  },
  "query": "Minecraft",
  "org_id": "org123"
}
```

---

## Parameters Summary by Block

| `type` | Role | Parameters |
|--------|------|------------|
| `query` | Entry point | *(none)* |
| `query_rewrite` | LLM rewriting | `model_name`, `temperature`, `max_tokens`, `system_prompt`, `overwrite_query`, `num_queries` |
| `refusal` | Guardrail 🔒 | `model_name` |
| `retrieve` | Vector search 🔍 | `collection_name`, `top_k` (supports multi-`_queries`) |
| `rerank` | Re-ranking 📊 | `provider`, `model`, `top_k` |
| `answer` | Response generation 💬 | `model`, `temperature`, `max_tokens`, `system_prompt` |
| `verified_answer` | Verified response ✅ | `model`, `judge_model`, `temperature`, `max_tokens` |
| `hyde` | Hypothetical document 🧪 | `model`, `num_queries`, `mode` |

---

## Important Rules

1. **Execution order**: blocks execute **in order** as they appear in the `blocks` array
2. **Last block**: the last block must be a generation block (`answer` or `verified_answer`) — it streams the response
3. **Transformation blocks**: all blocks before the last one are transformers (they modify pipeline data)
4. **Free `name`**: each block has a `name` field that you choose (e.g., `"step1"`, `"retriever"`, `"generator"`). It is only used to identify the block in logs and cost tracking.
5. **Optional parameters**: except for `type` and `name`, all parameters have a default value — you can omit them if the default suits your needs

---

> 💡 **To test**: go to `http://localhost:8000/docs` (Swagger UI) to test endpoints interactively.