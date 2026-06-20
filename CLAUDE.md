# CLAUDE.md — GenRAG Platform Context

## Qu'est-ce que GenRAG ?

GenRAG est une plateforme SaaS B2B permettant à des entreprises de créer et gérer des agents RAG (Retrieval-Augmented Generation) personnalisés. L'utilisateur configure ses agents via une interface no-code, y upload ses documents, et déploie un chatbot IA qui répond aux questions en se basant exclusivement sur ces documents.

**Périmètre de ce repo :** la plateforme de gestion (création de compte, workspace, agent, workflow, documents, déploiement). La partie IA (modèles LLM, vector store, RAG engine) est une **API externe** développée séparément, à laquelle on communique via HTTP.

---

## Architecture globale

```
monorepo/
├── packages/
│   └── workflow/          # Package NPM partagé (@genrag/workflow)
│                          # Composants React du builder de workflow (ReactFlow)
├── plateform_back/        # Backend NestJS
├── plateform_front/       # Frontend React (Vite + Chakra UI)
├── vitrine_front/         # Landing page Next.js
├── architecture/          # Diagrammes Mermaid
├── docker-compose.yml
├── dev.sh                 # Script de démarrage dev
└── migrate.sh             # Helper migration DB
```

---

## Stack technique

### Backend — `plateform_back/`
- **Framework :** NestJS 11 (TypeScript)
- **ORM :** Prisma 6 (PostgreSQL)
- **Auth :** JWT via cookies HttpOnly + Passport (strategies Local + JWT) + blacklist de tokens
- **Queue :** BullMQ + Redis (traitement asynchrone des documents)
- **Storage :** AWS S3 (stockage des fichiers uploadés)
- **Emails :** Brevo (vérification email, reset password)
- **API Docs :** Swagger + Scalar
- **Logs :** nestjs-pino
- **Monitoring :** Sentry

### Frontend — `plateform_front/`
- **Framework :** React + Vite (TypeScript)
- **UI :** Chakra UI v2 + thème custom (couleurs `grey` et `green` étendues)
- **State / API :** Redux Toolkit Query (RTK Query)
- **Routing :** React Router v6
- **Workflow builder :** ReactFlow via `@genrag/workflow`
- **Animations :** Framer Motion

### Package partagé — `packages/workflow/`
- **Technos :** React + ReactFlow (`@xyflow/react`) + Chakra UI
- Exporté comme `@genrag/workflow`
- Contient les composants de nodes, edges, hooks, le task registry, les layouts et les types

### Landing page — `vitrine_front/`
- **Framework :** Next.js (App Router)
- Utilise `@genrag/workflow` pour afficher un preview du workflow en mode read-only

---

## Modèle de données (Prisma)

### Entités principales

```
User
  ├── id, email, name, password (hashé bcrypt)
  ├── isEmailVerified, emailVerificationToken
  └── workspaces → UserWorkspace[]

Workspace
  ├── id, name, description
  ├── plan : FREE | PRO | BUSINESS | ENTERPRISE (défaut FREE)
  ├── users → UserWorkspace[] (rôles : ADMIN | EDITOR | VIEWER)
  ├── agents → Agent[]
  ├── creditBalance → CreditBalance (1-to-1)
  ├── creditTransactions → CreditTransaction[]
  ├── onboardingSessions → OnboardingSession[]
  └── conversations → Conversation[]

Agent
  ├── id, name, description
  ├── status : DEVELOPMENT | PRODUCTION  ← STAGING supprimé (migration 20260429102244)
  ├── retentionDays Int?  ← rétention des query logs (null = indéfini)
  ├── workspaceId
  ├── workflows → Workflow[]
  ├── documents → Document[]
  ├── deployments → AgentVersion[]
  ├── onboardingSession → OnboardingSession?
  ├── conversations → Conversation[]
  ├── members → AgentMember[]    ← partage de l'agent avec des utilisateurs
  └── queryLogs → AgentQueryLog[]

AgentVersion  ← journal de déploiement immutable
  ├── id, version (auto-increment par agent)
  ├── name, changelog?
  ├── fromStatus, toStatus (AgentStatus)
  ├── workflowVersion (Int?) — version du snapshot de workflow associé
  ├── agentId, createdBy (userId)
  ├── createdByUser User @relation(...)
  └── Contrainte unique : (agentId, version)

AgentMember  ← accès d'un utilisateur à un agent spécifique
  ├── id, agentId, userId
  ├── createdAt
  └── Contrainte unique : (agentId, userId)

AgentQueryLog  ← log d'exécution de chaque query RAG
  ├── id, agentId
  ├── query (String)
  ├── durationMs (Int)
  ├── status : SUCCESS | ERROR | OUT_OF_CREDITS
  ├── creditsUsed (Int, défaut 1)
  └── createdAt

Workflow
  ├── id, agentId
  ├── definition (JSONB) ← { nodes, edges, blocks } — nodes/edges = état ReactFlow,
  │                         blocks = pipeline envoyé à l'API RAG externe
  ├── version (Int), isActive (Bool)
  └── Contrainte unique : (agentId, version)

Document
  ├── id, name, agentId, storageKey (clé S3)
  ├── size, mimeType
  ├── status : UPLOADED | PROCESSING | INDEXED | FAILED
  ├── indexedAt, failedAt, indexError, retryCount
  └── createdAt, updatedAt

OnboardingSession
  ├── id, userId, workspaceId, agentId (@unique)
  ├── step (Int, défaut 1), completed (Bool)
  ├── instruction?, stepsData (JSONB)?
  └── Contrainte unique : (userId, workspaceId)

Conversation
  ├── id, workspaceId, agentId, title
  ├── messages → Message[]
  └── createdAt, updatedAt

Message
  ├── id, conversationId
  ├── sender : USER | AGENT | SYSTEM
  ├── content, metadata (JSONB)?
  └── createdAt

CreditBalance
  └── workspaceId (unique), balance (Int)

CreditTransaction
  └── workspaceId, amount, type : SUBSCRIPTION | USAGE | PURCHASE, metadata (JSONB)
```

---

## Flux fonctionnels clés

### 1. Authentification
- Register → envoi email de vérification (token 6 chiffres via Brevo)
- Login → JWT dans cookie HttpOnly `Authentication`
- Logout → JWT ajouté à la blacklist (`JwtBlacklistService`) pour révocation immédiate
- Reset password → token 6 chiffres par email
- Protection brute-force via `LoginAttemptService` (rate limiting sur les échecs de login)
- `SEND_EMAILS=true/false` dans `.env` pour activer/désactiver les emails

### 2. Upload de document
```
POST /documents (multipart)
  → S3.put(file)
  → document.create({ status: UPLOADED })
  → BullMQ.add(job) [attempts: 5, backoff: exponential 3s→48s]
     → Worker: document.update({ status: PROCESSING })
     → POST /rag/index (API RAG externe) avec le buffer du fichier
     → document.update({ status: INDEXED }) ou FAILED
```
- Fichiers < 5 MB : buffer encodé en base64 dans le job BullMQ
- Fichiers > 5 MB : seulement la clé S3, le worker récupère depuis S3

### 3. Exécution d'une query RAG (SSE)
```
GET /workspaces/:workspaceId/agents/:agentId/runtime/stream?query=...  (SSE)
GET /workspaces/:workspaceId/agents/:agentId/runtime/playground?query=...  (SSE, sans usage tracking)

Flux interne :
  → UsageTracker.checkOrThrow() [vérifie credits > 0 — ignoré pour playground]
  → ContextBuilder.buildPipeline() [charge le workflow actif depuis la DB]
     → extrait definition.blocks (ou definition complète si legacy)
  → RagExecutionService → POST /rag/stream (API RAG externe) avec { pipeline: blocks, query }
  → EventBus.emit(AGENT_QUERY_COMPLETED) [ignoré pour playground]
     → UsageTracker.record() [déduit 1 crédit en transaction Prisma atomique]
     → AgentQueryLogRepository.create() [persiste le log]
  → retourne un stream SSE (chunks de texte)
```
- `RAG_MOCK=true` dans `.env` → court-circuite l'appel à l'API RAG et retourne une réponse fictive (utile en dev)
- Deux endpoints distincts : `stream` (prod, déduit crédits) et `playground` (test, `skipUsageTracking: true`)

### 4. Transitions d'état d'un Agent (Déploiement)
Le statut d'un agent est géré via le module `deployment` (plus de state-machine directe) :
- `DEVELOPMENT` → `PRODUCTION` : `POST /deployments` (crée un `AgentVersion` + snapshot workflow)
- `PRODUCTION` → rollback vers version antérieure : `POST /deployments/rollback`
- **STAGING supprimé** — les deux seuls états possibles sont `DEVELOPMENT` et `PRODUCTION`

Flux de déploiement :
```
POST /workspaces/:workspaceId/agents/:agentId/deployments { name, changelog? }
  → agent.findOneWithActiveWorkflow()
  → workflowService.createSnapshot()  ← copie isActive=false du workflow actif
  → deploymentRepository.createWithAgentUpdate()  ← crée AgentVersion + agent.status = PRODUCTION
  → EventBus.emit(STATUS_CHANGED) + EventBus.emit(AGENT_DEPLOYED)

POST /workspaces/:workspaceId/agents/:agentId/deployments/rollback { deploymentId, changelog? }
  → trouve l'AgentVersion cible
  → workflowService.update()  ← recopie la définition du snapshot ciblé dans le workflow actif
  → crée un nouvel AgentVersion (status → PRODUCTION)
```

### 5. Versioning des Workflows
- `POST /workflow` : crée une nouvelle version `isActive: true`, désactive l'ancienne
- `PATCH /workflow` : met à jour la définition du workflow actif sans changer la version
- `PATCH /workflow/activate` : bascule la version active
- `createSnapshot(agentId, dto)` : crée une version `isActive: false` — appel interne au déploiement, ne change pas le workflow actif

### 6. Sérialisation du Workflow
La fonction `serializeWorkflow(nodes, edges)` (dans `packages/workflow/src/utils/serialize.ts`) convertit l'état ReactFlow en `WorkflowDefinition` :
```typescript
{
  nodes: AppNode[];   // état complet ReactFlow (persisté pour restauration de l'UI)
  edges: Edge[];      // idem
  blocks: PipelineBlock[];  // format pipeline envoyé à l'API RAG externe
}
```
Les `blocks` sont construits en traversant la chaîne principale (type `main-source` → `main-target`) dans l'ordre QUERY → REWRITER? → RETRIEVER → RERANKER? → RESPONSE, en extrayant les valeurs des settings nodes (MODEL, INSTRUCTION) via les edges de type `settings`.

---

## API Externe (RAG Engine)

**URL :** `RAGENGINE_URL` (env var)
**Auth :** Header `X-API-Key: RAGENGINE_API_KEY`

### Endpoints consommés

| Endpoint | Usage |
|----------|-------|
| `POST /rag/stream` | Exécuter une query RAG. Body: `{ pipeline, query }`. Retourne le texte de la réponse. |
| `POST /rag/index` | Indexer un document. Body: multipart/form-data avec `file` (buffer) et `document_id`. |

Le module `rag-engine/` encapsule ces appels :
- `RagExecutionService` — effectue les appels HTTP vers l'API RAG
- `pipeline.schema.ts` — validation Zod du format du pipeline avant envoi

### Format du pipeline (blocks envoyés à l'API RAG)
```json
{
  "blocks": [
    { "name": "query", "type": "query" },
    { "name": "rewrite", "type": "rewrite", "model": "mistral" },
    { "name": "retrieve", "type": "retrieve", "collection_name": "genrag_knowledge_base", "top_k": 5 },
    { "name": "rerank", "type": "rerank", "model": "bge" },
    { "name": "answer", "type": "answer", "model": "gpt-4o", "system_prompt": "..." }
  ]
}
```

---

## Sécurité & Guards

| Guard / Service | Rôle |
|-----------------|------|
| `JwtAuthGuard` | Vérifie le JWT dans le cookie |
| `JwtBlacklistService` | Révoque les tokens JWT au logout (liste noire en mémoire/Redis) |
| `LoginAttemptService` | Rate limiting sur les tentatives de login (protection brute-force) |
| `WorkspaceRolesGuard` | Vérifie que l'user est membre du workspace (extrait `workspaceId` des params) |
| `AgentBelongsToWorkspaceGuard` | Vérifie que l'agent appartient bien au workspace |
| `RolesInWorkspace(...)` | Décorateur pour restreindre à certains rôles (ADMIN, EDITOR, VIEWER) |

**Règle générale :** toutes les routes privées ont `JwtAuthGuard` + `WorkspaceRolesGuard`.

---

## Architecture événementielle (EventBus)

Les modules communiquent via `EventBus` (`src/lib/event-bus.ts`), un wrapper Node.js EventEmitter.

### Événements agents (`src/events/agent/`)
- `agent-events.type.ts` — constantes des noms d'événements
- `agent-events.ts` — payloads typés
- `agent-event.listener.ts` — listeners (ex: log déploiement, query complétée)

### Événements documents (`src/events/document/`)
- `document-event.type.ts`, `document-event.ts`, `document-event.listener.ts`
- Émis lors de l'indexation réussie ou échouée d'un document

---

## Modules backend (src/)

```
src/
├── agent/             # CRUD agents + export + membres
│   ├── agent.controller.ts
│   ├── agent-export.controller.ts   # Export d'agent (format JSON/config)
│   ├── agent-member.controller.ts   # Gestion membres partagés
│   ├── agent-member.service.ts
│   ├── agent-member.repository.ts
│   ├── agent.service.ts / .repository.ts
│   └── dto/, guard/, test/
├── agent-runtime/     # Exécution des queries RAG (SSE)
│   ├── agent-runtime.controller.ts
│   ├── agent-runtime.service.ts
│   ├── agent-runtime.orchestrator.ts
│   ├── agent-runtime.builder.ts     # Construit le pipeline depuis le workflow
│   └── agent-query-log.repository.ts
├── auth/              # JWT, Passport, email, sécurité
│   ├── auth.controller.ts / .service.ts
│   ├── token.service.ts
│   ├── jwt-blacklist.service.ts     # Révocation tokens JWT
│   ├── login-attempt.service.ts     # Protection brute-force
│   ├── brevo.service.ts             # Envoi emails via Brevo
│   └── strategies/
├── conversation/      # Conversations et messages
├── credit/            # Solde crédits + transactions + usage tracker
│   ├── credit-balance.controller.ts / .service.ts / .repository.ts
│   ├── credit-transaction.service.ts / .repository.ts
│   └── usage-tracker.service.ts
├── deployment/        # Versioning et rollback des agents
├── document/          # Upload, BullMQ processing, CQRS handlers
├── events/            # Listeners EventBus (agent + document)
├── onboarding/        # Session d'onboarding 3 étapes
├── plans/             # plans.config.ts — limites par tier (FREE/PRO/BUSINESS/ENTERPRISE)
├── rag-engine/        # Client HTTP vers l'API RAG externe
│   ├── rag-execution.service.ts
│   ├── rag-engine.controller.ts
│   └── pipeline.schema.ts           # Validation Zod du pipeline
├── redis/             # Connexion Redis
├── retention/         # Nettoyage planifié des query logs
│   └── retention-cleanup.service.ts
├── sentry/            # Intégration monitoring d'erreurs
├── storage/           # Abstraction S3 (StorageStrategy)
├── users/             # Profil utilisateur (séparé de auth/)
├── workflow/          # CRUD workflows + snapshots
├── workspace/         # Workspaces + stats
│   └── workspace-stats.service.ts   # GET /workspaces/:id/stats
├── lib/
│   └── event-bus.ts                 # Wrapper EventEmitter
├── prisma/            # PrismaService
└── exeptions/         # Filtres d'exception globaux (note: typo dans le nom du dossier)
```

---

## Package @genrag/workflow

### Vue d'ensemble

Le package `packages/workflow` est le cœur visuel de GenRAG. Il expose un builder de workflow drag-and-drop basé sur **ReactFlow** (`@xyflow/react`), utilisable en mode interactif (édition) ou en mode read-only (prévisualisation). Il est consommé par `plateform_front` (builder complet) et `vitrine_front` (preview statique).

**Export principal :** `@genrag/workflow`

```
packages/workflow/src/
├── components/
│   ├── WorkflowCanvas.tsx       # Composant principal composable (avec children)
│   ├── edges/
│   │   ├── GenEdge.tsx          # Edge animé (cercle en mouvement sur le chemin)
│   │   └── SettingsEdge.tsx     # Edge en pointillés pour les connexions de settings
│   └── nodes/
│       ├── NodeComponent.tsx    # Rendu générique de tous les nodes principaux
│       ├── NodeCard.tsx         # Carte de base réutilisable
│       ├── NodeShape.tsx        # Formes géométriques (Circle, Square, Hexagon…)
│       ├── NodeHeader.tsx       # En-tête de node avec bouton suppression
│       ├── NodeInputs.tsx       # Conteneur d'inputs
│       ├── NodeOutputs.tsx      # Conteneur d'outputs avec handles ReactFlow
│       ├── Common.tsx           # Listes de modèles (LLMS, ReRanker, LLMSRewriter)
│       └── SettingNodes/
│           ├── ModelNode.tsx    # Node de sélection de modèle LLM
│           └── InstructionNode.tsx  # Node d'édition de prompt système
├── graph/
│   ├── task/
│   │   ├── registry.tsx         # TaskRegistry : map TaskType → définition complète
│   │   ├── add-query.tsx        # Définition du node QUERY (isEntryPoint)
│   │   ├── add-rewriter.tsx     # Définition du node REWRITER (deletable)
│   │   ├── add-database.tsx     # Définition du node RETRIEVER
│   │   ├── add-reranking.tsx    # Définition du node RERANKER (deletable)
│   │   ├── add-response.tsx     # Définition du node RESPONSE (isEndPoint)
│   │   ├── add-model.tsx        # Définition du node MODEL (settings)
│   │   └── add-instruction.tsx  # Définition du node INSTRUCTION (settings)
│   ├── create-flow-node.ts      # Factories : makeFlowNode, linkNodes, withAutoSettings
│   └── task-utils.ts            # getTaskDef, getAddableTaskTypes, getNonSettingsTaskTypes, getConfigInputs, getChainOutputs
├── hooks/
│   ├── useWorkflowNodes.ts      # Hook principal : état nodes/edges, add/remove, settings
│   ├── useWorkflowCanvas.ts     # Composition : useWorkflowNodes + useFlowTypes
│   ├── useFlowTypes.tsx         # nodeTypes et edgeTypes pour ReactFlow
│   ├── useNodeSelection.ts      # Sélection d'un node + ouverture modal
│   ├── useNodeInformation.ts    # Accès aux données du node sélectionné
│   ├── useFixNodePosition.tsx   # Centre la vue sur un node
│   ├── useCenterNodePosition.ts # Calcul de la position centrale d'un node
│   └── useAppResponsive.ts      # Breakpoints custom (sans Chakra useBreakpointValue)
├── layout/
│   ├── types.ts                 # Interface LayoutStrategy
│   ├── vertical.ts              # Disposition verticale (défaut)
│   ├── horizontal.ts            # Disposition horizontale
│   ├── dagre.ts                 # Disposition automatique via dagre (optionnel)
│   └── index.ts                 # Export + DEFAULT_LAYOUT (vertical)
├── utils/
│   ├── serialize.ts             # serializeWorkflow (plateform_front uniquement)
│   └── sanitize.ts              # sanitizeWorkflowEdges — répare les edges stales chargés depuis la DB
└── types/
    ├── app-node.ts              # AppNode, AppNodeData, ParamProps
    ├── edge.ts                  # EdgeType enum (default | settings)
    ├── task.ts                  # Task, TaskType, TaskParam, TaskParamType, TaskChainOutput
    └── model-option.ts          # ModelOption interface
```

### Types fondamentaux

```typescript
// Les 7 types de nodes disponibles
enum TaskType {
  QUERY       = "QUERY",       // Point d'entrée (isEntryPoint: true)
  REWRITER    = "REWRITER",    // Réécrit la query (deletable, optionnel)
  RETRIEVER   = "RETRIEVER",   // Recherche vectorielle (non deletable)
  RERANKER    = "RERANKER",    // Re-ordonne les résultats (deletable, optionnel)
  RESPONSE    = "RESPONSE",    // Génère la réponse (isEndPoint: true)
  MODEL       = "MODEL",       // Node de configuration LLM (settings)
  INSTRUCTION = "INSTRUCTION", // Prompt système (settings)
}

// Un node dans ReactFlow
interface AppNode extends Node {
  data: AppNodeData;
}

interface AppNodeData {
  type: TaskType;
  inputs: Record<string, string>;
  outputs: string[];
  // Champs dynamiques selon le type :
  isPlaceholder?: boolean;   // true tant que le modèle n'est pas sélectionné
  isEditing?: boolean;       // InstructionNode en cours d'édition
  modelName?: string;        // Valeur sélectionnée dans ModelNode
  stringValue?: string;      // Texte de l'InstructionNode
  settingLabel?: string;     // Label du setting ("Large Language Model", "ReRanking"…)
  parentNodeId?: string;     // ID du node parent (pour settings nodes)
  configItems?: ModelOption[];// Liste de modèles disponibles
  [key: string]: any;
}
```

### Architecture des edges

Il existe **deux types d'edges** avec des rôles distincts :

| Type | ReactFlow type | Rôle |
|------|----------------|------|
| `GenEdge` | `"default"` | Connexions principales entre nodes (QUERY→RETRIEVER→RESPONSE). Animé avec un cercle en mouvement. |
| `SettingsEdge` | `"settings"` | Connexions latérales entre un node principal et ses settings nodes (MODEL, INSTRUCTION). Pointillés animés. |

Les handles utilisés :
- `main-source` / `main-target` : connexion principale entre nodes
- `setting-source-{inputName}` : sortie d'un node principal vers un node de settings
- `setting-target` : entrée d'un MODEL ou INSTRUCTION node

### Architecture des nodes

**Nodes principaux** (rendus par `NodeComponent`) :
- QUERY, RETRIEVER, RESPONSE, REWRITER, RERANKER
- Ont un handle `main-target` (entrée) et `main-source` (sortie)
- Peuvent avoir des sorties `setting-source-*` vers des settings nodes
- `isDeletable` contrôle si un bouton trash est affiché (REWRITER, RERANKER uniquement)

**Nodes de settings** (rendus par leurs propres composants) :
- `ModelNode` : affiche un placeholder "Add model" puis la carte du modèle sélectionné
- `InstructionNode` : placeholder avec bouton "+" puis textarea d'édition puis carte de texte
- Ont un handle `setting-target` (entrée depuis le node parent)
- `isPlaceholder: true` signifie que la valeur n'a pas encore été configurée

**chainOutputs** : certains nodes déclarent des nodes optionnels dans leur chaîne. Par exemple, QUERY peut suggérer REWRITER, RETRIEVER peut suggérer RERANKER. Ces suggestions apparaissent dans le menu d'ajout de node.

### Hooks principaux

#### `useWorkflowNodes(options?)` — Hook d'état central

Gère tout l'état ReactFlow (nodes, edges) et les mutations :

```typescript
const {
  nodes, edges,            // État ReactFlow courant
  isVertical,              // Orientation du layout
  onNodesChange,           // Handler ReactFlow standard
  onEdgesChange,           // Handler ReactFlow standard
  onDragOver,              // Handler drag-and-drop
  handleSettingSelect,     // Sélectionner un modèle dans un ModelNode
  handleAddChainNode,      // Ajouter un node chaîné (ex: REWRITER après QUERY)
  handleRemoveChainNode,   // Supprimer un node + ses settings + reconnexion auto
  registry,                // WorkflowRegistry en cours
} = useWorkflowNodes({
  initialNodes?: AppNode[],
  initialEdges?: Edge[],
  initialVertical?: boolean,
  registry?: WorkflowRegistry,
  readonly?: boolean,
  layout?: LayoutStrategy,
});
```

**`handleRemoveChainNode(nodeId)`** : supprime le node, ses settings nodes (edges de type `settings`), et recrée automatiquement l'edge entre le nœud précédent et suivant.

**`handleAddChainNode(nodeType)`** : trouve le parent qui déclare ce `nodeType` dans ses `chainOutputs`, crée le nouveau node + ses settings placeholders, met à jour les edges (reroute le trafic en insérant le nouveau node), et repositionne avec le layout strategy.

#### `useWorkflowCanvas(options?)` — Composition pour ReactFlow

Compose `useWorkflowNodes` + `useFlowTypes` pour produire tout ce dont `<ReactFlow>` a besoin :

```typescript
const {
  nodes, edges,
  nodeTypes, edgeTypes,  // Prêts pour <ReactFlow nodeTypes={...} edgeTypes={...}>
  onNodesChange, onEdgesChange, onDragOver,
  handleSettingSelect, handleAddChainNode, handleRemoveChainNode,
  registry, isVertical,
} = useWorkflowCanvas({
  nodeComponent?: React.ComponentType,  // Override du composant de node
  onNodeClick?: (nodeId: string) => void,
  isMenuOpen?: boolean,
  onMenuOpen?: () => void,
  onMenuClose?: () => void,
  initialNodes?: AppNode[],
  initialEdges?: Edge[],
  ...
});
```

#### `useFlowTypes(options?)` — nodeTypes et edgeTypes

Génère les maps `nodeTypes` et `edgeTypes` pour ReactFlow. Tous les nodes sont rendus par `NodeComponent` (ou un override), avec l'injection automatique de `onNodeClick` et `onRemoveNode`.

#### `useNodeSelection()` — Sélection et modal

```typescript
const {
  selectedNodeId,
  task,          // Définition du node sélectionné (depuis TaskRegistry)
  nodeData,      // AppNodeData du node sélectionné
  isModalOpen,
  handleNodeClick,
  handleModalClose,
} = useNodeSelection();
```

### Factories et utilitaires

#### `makeFlowNode(id, type, x, y)` — Créer un node simple
```typescript
const node = makeFlowNode("my-id", TaskType.QUERY, 0, 0);
```

#### `linkNodes(sourceId, targetId)` — Créer un edge principal
```typescript
const edge = linkNodes("query-id", "retriever-id");
// Crée un edge avec sourceHandle: "main-source", targetHandle: "main-target"
```

#### `withAutoSettings(nodes, edges, settingValues?)` — Attacher les settings nodes
Prend un ensemble de nodes principaux et crée automatiquement leurs settings nodes (MODEL, INSTRUCTION) avec les positions définies dans la `Task`. Si `settingValues` fournit une valeur, le node est créé pré-rempli ; sinon, un placeholder est créé.

```typescript
const { nodes, edges } = withAutoSettings(
  [makeFlowNode("q", TaskType.QUERY, 0, 0), makeFlowNode("r", TaskType.RETRIEVER, 0, 200)],
  [linkNodes("q", "r")],
  {
    "r": { "Large Language Model": "GPT-4o" }  // pré-remplit le MODEL du RETRIEVER
  }
);
```

#### `serializeWorkflow(nodes, edges)` — Sérialiser pour la DB
Retourne `{ nodes, edges, blocks }`. Importé dans `plateform_front` via `@genrag/workflow` (`utils/serialize`).

#### `sanitizeWorkflowEdges(nodes, edges)` — Réparer les edges chargés depuis la DB
Retourne `{ nodes, edges }` après avoir corrigé les `sourceHandle` de settings-edges qui ne correspondent plus aux noms d'inputs actuels de la task-definition (ex : après un renommage). Les nodes orphelins (settings nodes dont l'edge ne peut être remappé) sont supprimés. À appeler lors du chargement d'un workflow depuis la DB avant de l'injecter dans ReactFlow.

### Système de Layout

```typescript
interface LayoutStrategy {
  readonly name: string;
  readonly isVertical: boolean;
  computePlacements(nodes, edges, newNodeId): NodePlacement[];
  getInitialPosition(): { x, y };
}
```

Trois implémentations :
- `VerticalLayoutStrategy` (défaut) : empile les nodes verticalement, gap de 140px
- `HorizontalLayoutStrategy` : dispose les nodes horizontalement, gap de 280px
- `DagreLayoutStrategy` : utilise la lib `dagre` pour un layout automatique orienté graphe (nécessite que `dagre` soit installé, sinon fallback vertical)

### Modèles disponibles (Common.tsx)

Les listes de modèles sont définies statiquement dans `Common.tsx` :

| Liste | Utilisée par |
|-------|-------------|
| `LLMS` | RESPONSE node (Large Language Model) |
| `LLMSRewriter` | REWRITER node (Large Language Model) |
| `ReRanker` | RERANKER node (ReRanking) |

Chaque `ModelOption` a : `id`, `label`, `provider`, `description`, `priceInput`, `priceOutput`, `badge`.

---

## Consommation du package @genrag/workflow

### Dans `plateform_front` — Mode interactif complet

**Page Workflow** (`pages/Agents/Workflow/index.tsx`) :

```tsx
// 1. Charger le workflow depuis la DB (RTK Query)
const { data: workflow } = useGetActiveWorkflowQuery({ workspaceId, agentId });
const canvas = workflow?.definition as WorkflowDefinition;

// 2. Initialiser le canvas avec les nodes/edges sauvegardés
<ReactFlowProvider>
  <WorkflowInner
    initialNodes={canvas?.nodes}
    initialEdges={canvas?.edges}
    workspaceId={workspaceId}
    agentId={agentId}
  />
</ReactFlowProvider>

// 3. Dans WorkflowInner : useWorkflowCanvas pour tout l'état
const { nodes, edges, nodeTypes, edgeTypes, ... } = useWorkflowCanvas({
  nodeComponent: NodeComponent,
  onNodeClick: handleNodeClick,  // ouvre le NodeModal
  initialNodes,
  initialEdges,
});

// 4. Passer directement à <ReactFlow>
<ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} ...>
  <MiniMap ... />
  <Background ... />
  <CustomControls onSave={handleSave} />
</ReactFlow>

// 5. Sauvegarder : sérialiser + PATCH ou POST
const definition = serializeWorkflow(nodes, edges);
await updateWorkflow({ workspaceId, agentId, definition });
```

**Fenêtre modale de node** (`NodeModal.tsx`) :
- S'ouvre via `useNodeSelection().handleNodeClick`
- Affiche un panneau latéral animé (Framer Motion) selon le type du node
- Pour MODEL : `SettingPlaceholderContent` → appelle `handleSettingSelect(nodeId, item)` pour mettre à jour le node

**Menu d'ajout de node** (`MenuNodeModal.tsx`) :
- Affiche les nodes disponibles filtrés par `getAddableTaskTypes(presentTypes)`
- Filtre selon les `chainOutputs` des nodes déjà présents dans le canvas
- Appelle `handleAddChainNode(nodeType)` au clic ou à l'Enter

**WorkflowPreview** (`components/System/Molecules/WorkflowPreview/WorkflowPreview.tsx`) :
Utilisé sur le Dashboard et dans `CreateAgentModal` pour afficher un aperçu read-only :
```tsx
<WorkflowCanvas
  nodeComponent={NodeComponent}
  readonly
  layout={new HorizontalLayoutStrategy()}
  initialNodes={nodes}
  initialEdges={edges}
  colorMode="dark"
>
  <Background variant={BackgroundVariant.Lines} />
</WorkflowCanvas>
```

**CreateAgentModal** :
Utilise `makeFlowNode`, `linkNodes`, `withAutoSettings` pour générer des presets de workflow (blank ou template FAQ) affichés en preview avant la création de l'agent.

### Dans `vitrine_front` — Mode preview statique

**WorkflowPackagePreview** (`components/WorkflowPackagePreview.tsx`) :

Affiche le workflow en mode read-only dans la landing page. Nécessite d'emballer dans un `ChakraProvider` avec le thème custom (même palette `grey`/`green`), car le package utilise les tokens Chakra en interne.

```tsx
// Import depuis les node_modules du package pour éviter les conflits de versions Chakra
import { WorkflowCanvas, makeFlowNode, linkNodes, withAutoSettings, TaskType } from "@genrag/workflow";
import { ChakraProvider, DarkMode, LightMode } from "@chakra-ui/react";

// Preset "showcase" avec Rewriter + Reranker
const { nodes, edges } = withAutoSettings(
  [
    makeFlowNode("q", TaskType.QUERY, 0, 0),
    makeFlowNode("w", TaskType.REWRITER, 0, 200),
    makeFlowNode("r", TaskType.RETRIEVER, 400, 280),
    makeFlowNode("k", TaskType.RERANKER, 0, 450),
    makeFlowNode("s", TaskType.RESPONSE, 360, 550),
  ],
  [linkNodes("q", "w"), linkNodes("w", "r"), linkNodes("r", "k"), linkNodes("k", "s")],
  { w: { "Large Language Model": "Mistral" }, k: { ReRanking: "BGE" }, s: { "Large Language Model": "GPT-4o" } }
);

export function WorkflowPackagePreview({ isDark }) {
  const ModeWrapper = isDark ? DarkMode : LightMode;
  return (
    <ChakraProvider theme={workflowTheme}>
      <ModeWrapper>
        <WorkflowCanvas
          readonly
          initialNodes={nodes}
          initialEdges={edges}
          colorMode={isDark ? "dark" : "light"}
          fitViewOptions={{ padding: 0.12, minZoom: 0.35, maxZoom: 2 }}
        />
      </ModeWrapper>
    </ChakraProvider>
  );
}
```

**Important :** `vitrine_front` est un projet Next.js. `WorkflowPackagePreview` doit être chargé avec `dynamic(..., { ssr: false })` car ReactFlow nécessite le DOM.

### Différences entre les deux consommateurs

| Aspect | `plateform_front` | `vitrine_front` |
|--------|-------------------|-----------------|
| Mode | Interactif (édition complète) | Read-only (preview) |
| Composant utilisé | `<ReactFlow>` directement + `useWorkflowCanvas` | `<WorkflowCanvas>` (composant composable) |
| ChakraProvider | Fourni par le root de l'app | Doit être ajouté localement avec thème custom |
| ColorMode | Géré par l'app (dark/light toggle) | Passé en prop `isDark` + `DarkMode`/`LightMode` wrapper |
| SSR | N/A (Vite/SPA) | `dynamic(..., { ssr: false })` obligatoire |
| Nodes éditables | Oui (drag, clic, modal settings) | Non (`readonly` prop) |
| Sauvegarde | Oui (`serializeWorkflow` + RTK mutation) | N/A |
| Preset | Chargé depuis la DB | Construit en dur avec `withAutoSettings` |

### Règle de compatibilité Chakra / ReactFlow

`vitrine_front` importe Chakra et ReactFlow depuis les `node_modules` du package (`@genrag/workflow/node_modules/...`) pour éviter les conflits de versions multiples. Si les deux apps ont des versions différentes de Chakra ou de `@xyflow/react`, il faut s'assurer que le package est bundlé correctement (peer dependencies).

---

## Frontend — Structure des pages

```
/login, /register, /validate, /reset-password    → Auth (non protégé)
/onboarding                                       → Onboarding (3 étapes)
/dashboard                                        → Dashboard principal
/workspaces                                       → Liste des workspaces
/workspaces/:workspaceId/agents                   → Liste des agents
/workspaces/:workspaceId/agents/:agentId/playground  → Chat de test
/workspaces/:workspaceId/agents/:agentId/workflow    → Builder de workflow
/workspaces/:workspaceId/agents/:agentId/documents   → Gestion documents
/workspaces/:workspaceId/agents/:agentId/deploy      → Déploiement
/workspaces/:workspaceId/agents/:agentId/settings    → Paramètres agent
/assistants, /assistants/:assistantId             → Interface utilisateur final
/billing                                          → Facturation
```

### Layouts
- `PrivateAppLayout` — sidebar principale (Dashboard, Workspaces, Billing…)
- `PrivateAgentAppLayout` — sidebar agent (Playground, Workflow, Documents, Deploy…)

---

## Services RTK Query (Frontend)

| Service | Endpoints |
|---------|-----------|
| `services/auth/auth.ts` | login, register, verifyEmailToken, resendEmailToken, resetPassword, applyResetPassword, getMe |
| `services/workspace/workspace.ts` | getUserWorkspaces, getWorkspaceById, createWorkspace, deleteWorkspace |
| `services/agent/agent.ts` | getWorkspaceAgents, getAgentById, createAgent, updateAgent, deleteAgent |
| `services/agent/agentMembers.ts` | getAgentMembers, addAgentMember, removeAgentMember |
| `services/document/document.ts` | uploadDocument, getAgentDocuments (paginé), getDocumentById, getDocumentUrl, getAgentDocumentStats, deleteDocument |
| `services/workflow/workflow.ts` | getActiveWorkflow, updateWorkflow, createWorkflow |
| `services/deployment/deployment.ts` | getDeployments, getCurrentDeployment, getDeploymentById, createDeployment, rollbackDeployment |
| `services/chat/chat.ts` | sendChatMessage, getChatHistory, getAssistantMetadata, getAssistantsList, getConversationsForAssistant |
| `services/models/models.ts` | Récupère les modèles LLM / rerankers disponibles |
| `services/credit/credit.ts` | getBalance, getTransactions |
| `services/onboarding/onboarding.ts` | getSession, updateStep, complete |

**Config API :** `REACT_APP_BACKEND_URL` → baseUrl, credentials: `include` (cookies cross-origin)

---

## Conventions de code

### Backend (NestJS)
- Architecture en couches : Controller → Service → Repository → Prisma
- Les controllers ne contiennent pas de logique métier
- Les repositories encapsulent toutes les requêtes Prisma
- Les events inter-modules passent par `EventBus` (Node.js EventEmitter)
- Toujours utiliser `prisma.$transaction()` pour les opérations atomiques (ex: déduire crédits + créer transaction)
- Gestion des erreurs : `NotFoundException`, `ForbiddenException`, `UnauthorizedException` de NestJS

### Frontend (React)
- Composants UI atomiques dans `components/Atoms/`, moléculaires dans `components/Molecules/`
- Pages dans `pages/`
- Hooks custom dans `hooks/`
- **Jamais de logique API directement dans les composants** — toujours via RTK Query
- `useAppResponsive` (wrapper de `useBreakpointValue`) pour le responsive
- Thème Chakra : couleurs `grey.X` et `green.X` du thème custom
- `useColorModeValue(light, dark)` systématiquement pour le dark mode

### Package @genrag/workflow
- Ne jamais importer depuis `plateform_front` ou `vitrine_front` — le package est autonome
- Les listes de modèles (`LLMS`, `ReRanker`, `LLMSRewriter`) sont statiques dans `Common.tsx`
- `useAppResponsive` est ré-implémenté dans le package (sans Chakra) pour éviter les dépendances circulaires
- Tout changement aux `TaskType`, `Task` ou `TaskRegistry` impacte à la fois `plateform_front`, `vitrine_front`, et la sérialisation `serializeWorkflow`

### Styling (Chakra UI)
- Pas de CSS custom sauf exceptions (animations keyframes dans `.css`)
- Utiliser les props Chakra plutôt que des `style` inline
- Breakpoints : `base` (mobile), `sm`, `md`, `lg` (desktop)

---

## Variables d'environnement importantes

### Backend (`plateform_back/.env`)
```
DATABASE_URL=postgresql://admin:password@localhost:5433/database
JWT_SECRET=...
JWT_EXPIRATION=7d
TOKEN_VALIDITY=15m
TOKEN_RESEND_INTERVAL=1m
FRONTEND_URL=http://localhost:3000
PORT=8080
SEND_EMAILS=false
BREVO_API_KEY=...
AWS_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=...
RAGENGINE_URL=http://localhost:8000
RAGENGINE_API_KEY=...
RAG_MOCK=false          # true → court-circuite l'appel RAG, retourne une réponse fictive
REDIS_HOST=localhost    # utilisé si REDIS_URL n'est pas défini
REDIS_PORT=6379
REDIS_URL=              # en prod : URL complète Redis (ex: redis://user:pass@host:6379). Prend le dessus sur REDIS_HOST/PORT
SENTRY_DSN=             # optionnel — monitoring d'erreurs Sentry
```

### Frontend (`plateform_front/.env`)
```
REACT_APP_BACKEND_URL=http://localhost:8080
```

---

## Infrastructure Docker

```yaml
# docker-compose.yml
postgres:    port 5433:5432  (DB principale)
postgres_test: port 5434:5432  (DB tests)
pgadmin:     port 5050:80
server:      port 8080:8080   (NestJS)
# Redis: non défini dans compose, à lancer séparément ou ajouter
```

---

## Tests

- **Backend :** Jest, tests unitaires sur les Services (mocks des Repositories)
- Fichiers de test : `src/**/*.spec.ts` et `src/**/test/*.spec.ts`
- Couverture actuelle : `AgentService`, `AgentMemberService`, `WorkflowService`, `WorkspaceService`, `UsersService`, `AuthService`, `CreditService`, `DeploymentService`, `ConversationService`, `OnboardingService`, `AgentRuntimeService`, `AgentRuntimeOrchestrator`, `JwtBlacklistService`, `LoginAttemptService`
- Pattern : mock du Repository → tester uniquement la logique du Service
- Commande : `yarn test` dans `plateform_back/`

---

## Points d'attention / Gotchas

1. **Workflow definition format** : le champ `definition` du `Workflow` en DB contient `{ nodes, edges, blocks }`. `nodes` et `edges` permettent de restaurer l'état ReactFlow. `blocks` est ce qui est envoyé à l'API RAG. `ContextBuilder.buildPipeline()` extrait `def.blocks` (ou `def` entier pour les anciens workflows sans cette structure).

2. **Crédits** : le système de crédits est critique. La vérification et la déduction doivent être atomiques (transaction Prisma). Un workspace commence avec 0 crédit — il faut les ajouter manuellement via `POST /workspaces/:id/credit-balance`.

3. **Workflow actif vs snapshot** : l'exécution RAG charge toujours `isActive: true`. Les snapshots (`isActive: false`) sont créés lors du déploiement — ils sont immutables et servent uniquement au rollback. Ne jamais activer un snapshot manuellement ; utiliser `POST /deployments/rollback` qui recopie la définition dans le workflow actif.

3b. **AgentStatus simplifié** : il n'y a plus que `DEVELOPMENT` et `PRODUCTION`. Le statut est dérivé du dernier `AgentVersion.toStatus`. Si aucun `AgentVersion` n'existe, l'agent est en `DEVELOPMENT`.

4. **Settings nodes et isPlaceholder** : un MODEL ou INSTRUCTION node avec `isPlaceholder: true` dans `AppNodeData` signifie que l'utilisateur n'a pas encore configuré la valeur. `serializeWorkflow` ignore ces nodes lors de la construction des `blocks`, ce qui peut produire un pipeline incomplet si l'utilisateur sauvegarde sans configurer.

5. **Package @genrag/workflow et Chakra** : le package utilise Chakra UI (hooks `useColorModeValue`, `useColorMode`). Les deux consommateurs (`plateform_front` et `vitrine_front`) doivent fournir un `ChakraProvider` avec les palettes `grey` et `green` custom. Si la palette est absente, les couleurs des nodes tomberont en fallback Chakra standard.

6. **vitrine_front et SSR** : `WorkflowPackagePreview` utilise ReactFlow qui nécessite `window`. Toujours importer avec `dynamic(..., { ssr: false })` en Next.js.

7. **CORS** : le backend autorise uniquement `FRONTEND_URL` avec `credentials: true`. Crucial pour que les cookies JWT fonctionnent en développement cross-port.

8. **Email verification** : en dev, mettre `SEND_EMAILS=false` pour bypasser la vérification email (l'utilisateur peut se connecter sans vérifier).

9. **Prisma schema splitté** : le schema est dans plusieurs fichiers sous `plateform_back/prisma/schema/`. Il y a deux dossiers de migrations : `plateform_back/prisma/migrations/` (incrémental) et `plateform_back/prisma/schema/migrations/` (migration consolidée from scratch).

10. **handleRemoveChainNode et reconnexion** : quand on supprime un node chaîné (REWRITER, RERANKER), le hook trouve l'edge entrant et l'edge sortant du node supprimé, supprime aussi tous ses settings nodes (edges `type: "settings"`), et recrée un edge direct entre le précédent et le suivant. Ne jamais supprimer un node ReactFlow manuellement sans passer par ce handler.

11. **sanitizeWorkflowEdges au chargement** : appeler `sanitizeWorkflowEdges(nodes, edges)` avant d'injecter un workflow chargé depuis la DB dans ReactFlow. Cette fonction répare les `sourceHandle` de settings-edges devenus stales (ex : si le nom d'un input de task a changé). Sans ça, des edges "fantômes" peuvent rester attachés à des handles qui n'existent plus.

12. **WorkspaceStatsService** : expose `GET /workspaces/:id/stats` — agrège en parallèle agents (total, prod, dev), documents, conversations (24h + 30j), crédits, activité récente (8 événements), graphes d'activité (24h, 7j, 30j). Utilise les `Conversation` du modèle de données (pas les messages de l'assistant public).

13. **Runtime SSE** : les endpoints `/runtime/stream` et `/runtime/playground` utilisent `@Sse` (Server-Sent Events). Le client doit utiliser `EventSource` (ou un wrapper RTK). Contrairement à un POST, la query passe en query-string (`?query=...`).

14. **JWT Blacklist** : `JwtBlacklistService` maintient une liste des tokens révoqués. Le `JwtStrategy` vérifie que le token n'est pas blacklisté à chaque requête. Cela implique une vérification en mémoire (ou Redis) — s'assurer que la blacklist est persistée si le process redémarre.

15. **AgentQueryLog et rétention** : `retentionDays` sur `Agent` contrôle combien de jours les `AgentQueryLog` sont conservés. `RetentionCleanupService` tourne sur un schedule pour supprimer les logs expirés. Un agent avec `retentionDays: null` conserve les logs indéfiniment.

16. **Typo dans le nom du dossier** : `plateform_back/src/exeptions/` (manque un 'c'). Ne pas renommer sans vérifier tous les imports.
