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
└── docker-compose.yml
```

---

## Stack technique

### Backend — `plateform_back/`
- **Framework :** NestJS (TypeScript)
- **ORM :** Prisma (PostgreSQL)
- **Auth :** JWT via cookies HttpOnly + Passport (strategies Local + JWT)
- **Queue :** BullMQ + Redis (traitement asynchrone des documents)
- **Storage :** AWS S3 (stockage des fichiers uploadés)
- **Emails :** Brevo (vérification email, reset password)
- **API Docs :** Swagger + Scalar
- **Logs :** nestjs-pino

### Frontend — `plateform_front/`
- **Framework :** React + Vite (TypeScript)
- **UI :** Chakra UI v2 + thème custom (couleurs `grey` et `green` étendues)
- **State / API :** Redux Toolkit Query (RTK Query)
- **Routing :** React Router v6
- **Workflow builder :** ReactFlow via `@genrag/workflow`
- **Animations :** Framer Motion

### Package partagé — `packages/workflow/`
- **Technos :** React + ReactFlow + Chakra UI
- Exporté comme `@genrag/workflow`
- Contient les composants de nodes, edges, hooks (`useWorkflowNodes`, `useFlowTypes`, `useNodeSelection`), le task registry, et les types

### Landing page — `vitrine_front/`
- **Framework :** Next.js (App Router)
- Utilise `@genrag/workflow` pour afficher un preview du workflow

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
  ├── users → UserWorkspace[] (rôles : ADMIN | EDITOR | VIEWER)
  ├── agents → Agent[]
  ├── creditBalance → CreditBalance (1-to-1)
  └── creditTransactions → CreditTransaction[]

Agent
  ├── id, name, description
  ├── status : DEVELOPMENT | STAGING | PRODUCTION
  ├── workspaceId
  ├── workflows → Workflow[]
  └── documents → Document[]

Workflow
  ├── id, name, agentId
  ├── definition (JSONB) ← config du pipeline RAG envoyée à l'API externe
  ├── version (Int), isActive (Bool)
  └── Contrainte unique : (agentId, version)

Document
  ├── id, agentId, storageKey (clé S3)
  ├── mimeType, status : UPLOADED | PROCESSING | INDEXED | FAILED
  ├── indexedAt, failedAt
  └── Pas de nom stocké côté back (seulement storageKey)

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
- Reset password → token 6 chiffres par email
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
- Fichiers < 5 MB : buffer envoyé dans le job BullMQ
- Fichiers > 5 MB : seulement la clé S3, le worker récupère depuis S3

### 3. Exécution d'une query RAG
```
POST /workspaces/:workspaceId/agents/:agentId/runtime
  → UsageTracker.checkOrThrow() [vérifie credits > 0]
  → ContextBuilder.buildPipeline() [charge le workflow actif depuis la DB]
  → POST /rag/stream (API RAG externe) avec { pipeline: workflow.definition, query }
  → EventBus.emit(AGENT_QUERY_COMPLETED)
     → UsageTracker.record() [déduit 1 crédit en transaction Prisma]
  → return { answer }
```

### 4. Transitions d'état d'un Agent
Implémenté avec le pattern State Machine :
- `DEVELOPMENT` → `STAGING` (uniquement)
- `STAGING` → `PRODUCTION` ou `DEVELOPMENT`
- `PRODUCTION` → `DEVELOPMENT` (via Staging)
- Transition directe `DEVELOPMENT` → `PRODUCTION` : **interdite** (ForbiddenException)

### 5. Versioning des Workflows
- Chaque `POST /workflow` crée une nouvelle version (auto-increment)
- Une seule version `isActive: true` à la fois par agent
- `PATCH /workflow` modifie la version active sans changer la version
- `PATCH /workflow/activate` bascule la version active

---

## API Externe (RAG Engine)

**URL :** `RAGENGINE_URL` (env var)  
**Auth :** Header `X-API-Key: RAGENGINE_API_KEY`

### Endpoints consommés

| Endpoint | Usage |
|----------|-------|
| `POST /rag/stream` | Exécuter une query RAG. Body: `{ pipeline, query }`. Retourne le texte de la réponse. |
| `POST /rag/index` | Indexer un document. Body: multipart/form-data avec `file` (buffer) et `document_id`. |

### Format du pipeline (workflow.definition)
```json
{
  "pipeline_name": "mon_pipeline",
  "blocks": [
    { "name": "query", "type": "query" },
    { "name": "retrieve", "type": "retrieve", "collection_name": "...", "top_k": 5 },
    { "name": "answer", "type": "answer", "model": "google/gemini-2.5-flash" }
  ]
}
```

---

## Sécurité & Guards

| Guard | Rôle |
|-------|------|
| `JwtAuthGuard` | Vérifie le JWT dans le cookie |
| `WorkspaceRolesGuard` | Vérifie que l'user est membre du workspace (extrait `workspaceId` des params) |
| `AgentBelongsToWorkspaceGuard` | Vérifie que l'agent appartient bien au workspace |
| `RolesInWorkspace(...)` | Décorateur pour restreindre à certains rôles (ADMIN, EDITOR, VIEWER) |

**Règle générale :** toutes les routes privées ont `JwtAuthGuard` + `WorkspaceRolesGuard`.

---

## Package @genrag/workflow

### Nodes disponibles (TaskType)
- `QUERY` — point d'entrée (isEntryPoint: true)
- `REWRITER` — réécrit la query (optionnel, supprimable)
- `RETRIEVER` — recherche dans la base vectorielle
- `RERANKER` — re-ordonne les résultats (optionnel, supprimable)
- `RESPONSE` — génère la réponse finale (isEndPoint: true)
- `MODEL` — node de configuration (LLM associé à RESPONSE, REWRITER, RERANKER)
- `INSTRUCTION` — prompt système pour le LLM

### Hooks principaux exportés
- `useWorkflowNodes(options?)` — gestion des nodes/edges, drag&drop, add/remove
- `useFlowTypes({ onNodeClick?, isVertical? })` — nodeTypes et edgeTypes ReactFlow
- `useNodeSelection()` — gestion de la node sélectionnée et du modal
- `getConfigInputs(taskType)` — inputs de configuration d'un node
- `getChainOutputs(taskType)` — outputs chaîne optionnels d'un node

### WorkflowBuilder component
```tsx
<WorkflowBuilder interactive={true} preset="default" />
// preset: "default" (vide) | "showcase" (pré-rempli avec Rewriter + Reranker)
// interactive: false pour preview read-only
```

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
- `PrivateAppLayout` — sidebar principale noire (Dashboard, Workspaces, Billing...)
- `PrivateAgentAppLayout` — sidebar verte agent (Playground, Workflow, Documents, Deploy...)

---

## Services RTK Query (Frontend)

| Service | Endpoints |
|---------|-----------|
| `services/auth/auth.ts` | login, register, verifyEmailToken, resendEmailToken, resetPassword, applyResetPassword, getMe |
| `services/workspace/workspace.ts` | getUserWorkspaces |
| `services/agent/agent.ts` | getWorkspaceAgents |
| `services/chat/chat.ts` | sendChatMessage, getChatHistory, getAssistantMetadata, getAssistantsList, getConversationsForAssistant |

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
- Thème Chakra : couleurs `grey.X` et `green.X` du thème custom (voir `themeNew/`)
- `useColorModeValue(light, dark)` systématiquement pour le dark mode

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
REDIS_HOST=localhost
REDIS_PORT=6379
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
- Fichiers de test : `src/**/*.spec.ts`
- Tests existants : `AgentService`, `WorkflowService`, `WorkspaceService`, `UsersService`
- Pattern : mock du Repository → tester uniquement la logique du Service
- Commande : `yarn test` dans `plateform_back/`

---

## Points d'attention / Gotchas

1. **Workflow definition** : le champ `definition` du `Workflow` est un JSONB Prisma. C'est exactement ce JSON qui est envoyé à l'API RAG externe, il faut donc que le frontend serialize correctement les nodes ReactFlow en format pipeline.

2. **Crédits** : le système de crédits est critique. La vérification et la déduction doivent être atomiques (transaction Prisma). Un workspace commence avec 0 crédit — il faut les ajouter manuellement via `POST /workspaces/:id/credit-balance`.

3. **Document storage key** : le backend ne stocke pas le nom original du fichier, seulement la `storageKey` (path S3). Le nom d'affichage côté front doit être géré différemment.

4. **Workflow actif** : l'exécution RAG charge toujours `isActive: true`. Si aucun workflow actif n'existe, l'exécution throw une erreur. Toujours s'assurer qu'un workflow est actif avant de tester le playground.

5. **Package @genrag/workflow** : utilisé à la fois dans `plateform_front` et `vitrine_front`. La vitrine importe directement depuis les node_modules du package pour Chakra et ReactFlow (`@genrag/workflow/node_modules/...`) pour éviter les conflits de versions.

6. **CORS** : le backend autorise uniquement `FRONTEND_URL` avec `credentials: true`. Crucial pour que les cookies JWT fonctionnent en développement cross-port.

7. **Email verification** : en dev, mettre `SEND_EMAILS=false` pour bypasser la vérification email (l'utilisateur peut se connecter sans vérifier).

8. **Prisma schema** : le schema est splitté en plusieurs fichiers dans `plateform_back/prisma/schema/`. Il y a aussi une migration consolidée dans `plateform_back/prisma/schema/migrations/` qui repart de zéro.