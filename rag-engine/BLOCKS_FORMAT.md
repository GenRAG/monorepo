# Pipeline RAG - Documentation des Blocs

### Cette documentation décrit tous les blocs disponibles au sein de GenRAG pour construire un pipeline RAG en utilisant l'endpoint `POST /rag/stream`.

##### Chaque bloc a un `type` et un `name` et égalements d'autres paramètres spécifique au bloc en lui-même. Lors d'un appel à `POST /rag/stream`, Les blocs sont exécutés dans l'ordre défini dans la liste de blocs, et le résultat de chaque bloc est passé au bloc suivant comme dans une pipeline classique. Et chaque pipeline RAG doit commencer par un bloc de type `query` qui correspond à la question de l'utilisateur, et se terminer par un bloc de génération de réponse (`answer` ou `verified_answer`) qui va streamer la réponse finale.

---

## Sommaire

- [Structure du payload de l'endpoint `POST /rag/stream`](#structure-de-la-requête)
- [Bloc `query`](#1-query)
- [Bloc `query_rewrite`](#2-query_rewrite)
- [Bloc `retrieve`](#3-retrieve)
- [Bloc `rerank`](#4-rerank)
- [Bloc `refusal`](#5-refusal)
- [Bloc `answer`](#6-answer)
- [Bloc `verified_answer`](#7-verified_answer)
- [Bloc `hyde`](#8-hyde)
- [Exemples complets](#exemples-complets)
- [Résumé des paramètres](#résumé-des-paramètres-par-bloc)
- [Règles importantes](#règles-importantes)

---

## Structure de la requête

Lors de l'appel à `POST /rag/stream`, le payload doit contenir la configuration du pipeline utilisé et la clé de l'API doit être présente dans le header `X-API-Key`. Le payload JSON doit avoir la structure suivante :

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
               { "type": "retrieve", "name": "retrieve", "datasetIds": ["dataset_rh", "dataset_marketing"], "top_k": 20 },
               { "type": "rerank", "name": "rerank", "provider": "zeroentropy", "model": "zerank-2", "top_k": 10 },
               { "type": "answer", "name": "generator" }
             ]
           },
           "query": "Comment fonctionne les congés payés en France ?",
           "org_id": "onboarding",
           "chat_history": []
         }'
```


| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `pipeline.pipeline_name` | `string` | `"rag_pipeline"` | Nom du pipeline (Logging)
| `pipeline.blocks` | `array` | **requis** | Liste des blocs à exécuter au sein du workflow RAG | 
| `query` | `string` | **requis** | Question de l'utilisateur |
| `org_id` | `string` | **requis** | Identifiant de l'organisation (`[A-Za-z0-9_-]`, 1 à 128 caractères). Chaque organisation a sa propre collection Qdrant (`org_{org_id}`), choisie côté serveur à partir de cet `org_id` |
| `chat_history` | `array` | `[]` | Historique de la conversation |

---

## 0. `base_block`

Le bloc `base_block` est le bloc parent de tous les autres blocs. Il contient les champs communs à tous les blocs, à savoir `type` et `name`. Tous les autres blocs héritent de ce bloc, ces champs sont donc obligatoires pour tous les blocs.

Ce bloc n'est pas voué à être utilisé directement dans un pipeline, mais il sert de base pour la définition des autres blocs.

## 1. `query`

Le bloc `query` est le point d'entrée du pipeline, chaque pipeline RAG doit obligatoirement commencer par ce bloc. Celui ci correspond à la question de l'utilisateur et elle est ensuite transmise au bloc suivant pour traitement. Il n'a pas de paramètres à configurer pour l'utiliser.

Exemple de bloc `query` :
**Paramètres :** (aucun)

```json
{
  "type": "query",
  "name": "query"
}
```

---

## 2. `query_rewrite`

Le bloc `query_rewrite` est utilisé pour reformuler la question de l'utilisateur avant de la passer à la recherche vectorielle. Il utilise un modèle LLM pour clarifier et améliorer la formulation de la question, ce qui est particulièrement utile pour les questions mal formulées ou ambiguës, ainsi que pour les questions de suivi dans une conversation.

**Fonctionnalités :**
- **Réécriture contextuelle** : utilise l'historique de la conversation pour résoudre les références et les questions de suivi (ex: "donne plus de détails" → devient une question autonome)
- **Prompt personnalisable** : possibilité de fournir ses propres instructions système
- **Contrôle de créativité** : température réglable (0 = strict/fidèle, plus élevé = expansions plus variées)
- **Contrôle de propagation** : le flag `overwrite_query` permet de choisir si la reformulation impacte la recherche ET la génération, ou seulement la recherche
- **Multi-query** : le paramètre `num_queries` permet de générer plusieurs variantes de la requête pour une recherche plus large

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `model_name` | `string` | `"google/gemini-2.5-flash"` | Modèle LLM utilisé pour la réécriture |
| `temperature` | `float` | *(non défini)* | Contrôle la créativité (0 = déterministe, plus haut = plus varié) |
| `max_tokens` | `int` | *(non défini)* | Longueur maximale de la requête reformulée |
| `system_prompt` | `string` | *(prompt par défaut)* | Instructions système personnalisées pour la réécriture |
| `overwrite_query` | `boolean` | `true` | `true` = la reformulation est utilisée pour la recherche ET la réponse ; `false` = uniquement pour la recherche |
| `num_queries` | `int` | `1` | Nombre de variantes de requête à générer. `1` = comportement actuel, `>1` = multi-query expansion |

```json
{
  "type": "query_rewrite",
  "name": "rewrite",
  "model_name": "google/gemini-2.5-flash",
  "temperature": 0.0,
  "max_tokens": 250,
  "system_prompt": "You are a Human Resources expert, rewrite the query to be more formal and clear, and expand any abbreviations.",
  "overwrite_query": True,
  "num_queries": 1
}
```

---

## 3. `retrieve`

Interroge la base vectorielle Qdrant avec l'embedding de la requête pour récupérer les documents les plus pertinents.

**Support multi-query** : si le bloc précédent a défini `num_queries > 1`, le bloc `retrieve` détecte automatiquement les multiples requêtes, lance les recherches en parallèle, et déduplique les résultats avant de les passer au bloc suivant.

**Datasets** : chaque document est ingéré dans un dataset (`dataset_id` sur `POST /ingest` et `POST /ingest/website`). Un même `org_id` peut avoir plusieurs datasets (ex. un pour la RH, un pour le marketing), et un bloc `retrieve` peut en combiner plusieurs via `datasetIds` : la recherche se fait en une seule requête sur l'ensemble des datasets sélectionnés, avec un classement unique (le `top_k` s'applique au total, pas par dataset).

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `datasetIds` (ou `dataset_ids`) | `string[]` | `null` | Datasets à interroger (max 50, caractères `[A-Za-z0-9_-]`). `null`/absent = tous les datasets de l'`org_id` ; `[]` = aucun dataset, donc aucun document récupéré |
| `top_k` | `int` | `5` | Nombre de documents à récupérer par requête, tous datasets confondus (1 à 100) |

```json
{
  "type": "retrieve",
  "name": "retrieve",
  "datasetIds": ["dataset_rh", "dataset_marketing"],
  "top_k": 20
}
```

Chaque source de l'événement `sources` contient désormais aussi son `dataset_id`.

> Le champ `collection_name` n'existe plus : la collection est toujours celle de l'`org_id` de la requête (`org_{org_id}`). S'il est envoyé, il est ignoré.

---

## 4. `rerank`

Réordonne les documents récupérés en utilisant un service de re-ranking externe. Améliore la pertinence des résultats.

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `provider` | `string` | `"zeroentropy"` | Fournisseur : `"zeroentropy"` ou `"cohere"` |
| `model` | `string` | `"zerank-2"` | Modèle de re-ranking |
| `top_k` | `int` | `5` | Nombre de documents conservés après re-ranking |

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

Garde-fou qui classifie l'intention de la requête. Peut **arrêter le pipeline** si la question est hors domaine ou jugée inappropriée.

**Comportement :** ajoute `refusal_label`, `should_stop`, et éventuellement `final_answer` aux données du pipeline.

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `model_name` | `string` | `"google/gemini-2.5-flash"` | Modèle LLM pour la classification |

```json
{
  "type": "refusal",
  "name": "guard",
  "model_name": "google/gemini-2.5-flash"
}
```

---

## 6. `answer`

Bloc de génération de réponse **avec streaming**. C'est le bloc final le plus simple. Utilise un LLM pour répondre à partir du contexte.

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `model` | `string` | `"google/gemini-2.5-flash"` | Modèle LLM pour la génération |
| `temperature` | `float` | `0.7` | Contrôle la créativité (0 = déterministe, 2 = très aléatoire) |
| `max_tokens` | `int` | *(non défini)* | Nombre maximum de tokens dans la réponse. Laissé à `None` par défaut pour ne pas tronquer les modèles en mode "thinking" (les tokens de raisonnement seraient sinon comptés dans ce budget) |
| `system_prompt` | `string` | *(prompt par défaut)* | Instructions système personnalisées |

```json
{
  "type": "answer",
  "name": "answer",
  "model": "google/gemini-2.5-flash",
  "temperature": 0.7
}
```

> 💡 Tous les paramètres sauf `type` et `name` sont optionnels.

---

## 7. `verified_answer`

Bloc de réponse **vérifiée**. Avant de répondre, un juge LLM valide que le contexte récupéré est suffisant. Si le contexte est insuffisant, retourne un refus au lieu d'une réponse.

**Fonctionnement :**
1. Filtre les documents avec un score de confiance ≥ 0.8
2. Demande au juge si le contexte est suffisant
3. Si oui → génère la réponse
4. Si non → retourne un message de refus

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `model` | `string` | `"google/gemini-2.5-flash"` | Modèle LLM pour la génération de la réponse |
| `judge_model` | `string` | `"google/gemini-2.5-flash"` | Modèle LLM pour la vérification du contexte |
| `temperature` | `float` | `0.3` | Température plus basse pour plus de fiabilité |
| `max_tokens` | `int` | *(non défini)* | Nombre maximum de tokens. Laissé à `None` par défaut pour ne pas tronquer les modèles en mode "thinking" |

```json
{
  "type": "verified_answer",
  "name": "generator",
  "model": "google/gemini-2.5-flash",
  "judge_model": "google/gemini-2.5-flash",
  "temperature": 0.3
}
```

---

## 8. `hyde`

Génère un ou plusieurs documents hypothétiques à partir de la requête, puis utilise **leurs embeddings** pour la recherche (HyDE — Hypothetical Document Embeddings). Peut améliorer la pertinence quand la requête est très différente des documents stockés.

**Fonctionnalités :**
- **Support multi-query** : `num_queries` permet de générer N documents hypothétiques pour une recherche plus large
- **Deux modes** : `override` (ignore les `_queries` des blocs précédents) et `compose` (multiplie les `_queries`)

### Modes

| Mode | Comportement | Quand l'utiliser |
|------|-------------|------------------|
| `override` (défaut) | Ignore `_queries`, génère `num_queries` documents depuis `query` | HyDE seul, ou après un bloc qui n'utilise pas `_queries` |
| `compose` | Prend chaque query dans `_queries` et génère `num_queries` documents par query | Après `query_rewrite` avec `num_queries` — effet multiplicateur |

### Exemples d'effet multiplicateur

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
// rewrite(3) → hyde(3, override) → ignore _queries, 3 hyde docs depuis query originale
"blocks": [
  { "type": "query_rewrite", "name": "rewrite", "num_queries": 3 },
  { "type": "hyde", "name": "hyde", "num_queries": 3, "mode": "override" },
  { "type": "retrieve", "name": "retrieve", "top_k": 20 },
  ...
]
```

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `model` | `string` | `"google/gemini-2.5-flash"` | Modèle LLM pour la génération du document hypothétique |
| `num_queries` | `int` | `1` | Nombre de documents hypothétiques à générer |
| `mode` | `"override"` \| `"compose"` | `"override"` | `"override"` ignore les requêtes des blocs précédents ; `"compose"` les multiplie |

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

## Exemples complets

### Pipeline minimal — Query → Retrieve → Answer

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
  "query": "Qu'est-ce que le RAG ?",
  "org_id": "org123"
}
```

### Pipeline complet — Rewrite → Retrieve → Rerank → Verified Answer

```json
{
  "pipeline": {
    "pipeline_name": "full_rag",
    "blocks": [
      { "type": "query", "name": "query" },
      { "type": "query_rewrite", "name": "rewrite" },
      { "type": "retrieve", "name": "retrieve", "top_k": 50 },
      { "type": "rerank", "name": "rerank", "provider": "zeroentropy", "model": "zerank-2", "top_k": 10 },
      { "type": "verified_answer", "name": "generator" }
    ]
  },
  "query": "Expliquez-moi les symptômes du diabète",
  "org_id": "org123"
}
```

### Pipeline avec garde-fou — Refusal → Rewrite → Retrieve → Answer

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
  "query": "J'ai mal à la tête",
  "org_id": "org123"
}
```

---

### Pipeline avec multi-query expansion — Rewrite(3) → Retrieve(×3) → Rerank → Answer

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

### Pipeline avec HyDE compose — Rewrite(2) → HyDE(2, compose) → Retrieve(×4) → Rerank → Answer

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

| `type` | Rôle | Paramètres |
|--------|------|------------|
| `query` | Point d'entrée | *(aucun)* |
| `query_rewrite` | Reformulation LLM | `model_name`, `temperature`, `max_tokens`, `system_prompt`, `overwrite_query`, `num_queries` |
| `refusal` | Garde-fou 🔒 | `model_name` |
| `retrieve` | Recherche vectorielle 🔍 | `datasetIds`, `top_k` (support `_queries` multi) |
| `rerank` | Re-ranking 📊 | `provider`, `model`, `top_k` |
| `answer` | Génération réponse 💬 | `model`, `temperature`, `max_tokens`, `system_prompt` |
| `verified_answer` | Réponse vérifiée ✅ | `model`, `judge_model`, `temperature`, `max_tokens` |
| `hyde` | Document hypothétique 🧪 | `model`, `num_queries`, `mode` |

---

## Règles importantes

1. **Ordre d'exécution** : les blocs s'exécutent **dans l'ordre** du tableau `blocks`
2. **Dernier bloc** : le dernier bloc doit être un bloc de génération (`answer` ou `verified_answer`) — c'est lui qui streame la réponse
3. **Blocs de transformation** : tous les blocs avant le dernier sont des transformateurs (ils modifient les données du pipeline)
4. **`name` libre** : chaque bloc a un champ `name` que tu choisis (ex: `"step1"`, `"retriever"`, `"generator"`). Il sert uniquement à identifier le bloc dans les logs et le cost tracking.
5. **Paramètres optionnels** : sauf `type` et `name`, tous les paramètres ont une valeur par défaut — tu peux les omettre si la valeur par défaut te convient

---

> 💡 **Pour tester :** rends-toi sur `http://localhost:8000/docs` (Swagger UI) pour tester les endpoints interactivement.