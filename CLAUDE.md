# CLAUDE.md — GenRAG (monorepo)

## Qu'est-ce que GenRAG ?

GenRAG est une plateforme SaaS B2B permettant à des entreprises de créer et gérer des agents RAG (Retrieval-Augmented Generation) personnalisés. L'utilisateur configure ses agents via une interface no-code, y importe ses documents, et déploie un chatbot IA qui répond aux questions en se basant exclusivement sur ces documents.

**Périmètre :** la plateforme de gestion (compte, workspace, agent, workflow, documents, déploiement) et le site vitrine. La partie IA (LLM, vector store, moteur RAG) est une **API externe** (`RAGENGINE_URL`), dont une copie est présente pour le dev local.

Ce fichier décrit l'organisation du monorepo. **Les conventions détaillées sont dans le `CLAUDE.md` de chaque dossier** (tableau ci-dessous) : les lire avant de travailler dans un dossier.

## Dossiers du monorepo

| Dossier | Utilité | Stack | Doc |
|---|---|---|---|
| `plateform_front/` | App web de la plateforme : dashboard, agents, builder de workflow, documents, déploiement, billing, et interface de l'assistant pour l'utilisateur final. | React 19, CRA + craco, Chakra UI 2, RTK Query | `plateform_front/CLAUDE.md` |
| `plateform_back/` | API de la plateforme : auth, workspaces, agents, workflows, documents (S3 + queue d'indexation), runtime RAG en SSE, crédits, analytics. Appelle l'API RAG externe. | NestJS 11, Prisma 6 / PostgreSQL, BullMQ / Redis | `plateform_back/CLAUDE.md` (modèle de données, flux, env) |
| `packages/workflow/` | Package `@genrag/workflow` : builder de workflow ReactFlow (nodes, edges, registre des tâches, layouts, sérialisation vers le format `blocks`). Consommé par `plateform_front`. | React, `@xyflow/react`, Chakra UI | `packages/workflow/CLAUDE.md` |
| `vitrine_front/` | Site vitrine (landing page) statique, avec des démos animées de l'app. Aucune dépendance au back ni au package. `_archive/` = ancien site Next.js. | Vite, React 19, CSS Modules, GSAP | `vitrine_front/CLAUDE.md` |
| `rag-engine/` | Copie versionnée du moteur RAG externe (API Python) pour le dev local. Hors périmètre de la plateforme. | Python (uv) | `rag-engine/CLAUDE.md` |
| `RAG-GenRag/` | Clone local **non versionné** du dépôt `GenRAG/RAG-GenRag` (version plus récente du moteur, avec `worker/`). Ne pas le committer ; à ignorer ou passer en sous-module. | Python | `RAG-GenRag/CLAUDE.md` |
| `architecture/` | Diagrammes Mermaid : `backend.mmd`, `document-flow.mmd`, `agent-runtime-flow.mmd`, `agent-runtime-architecture-proposal.mmd`. | Mermaid | — |
| `docs/` | Docs projet : plan de beta-test, audit du thème, rendus (`greenlight-review/`), docs business (stratégie financière, lean canvas, demande d'hébergement), `screenshot/` (captures de l'app, référence visuelle du site vitrine). | Markdown, PNG | — |
| `scripts/` | `dev.sh` (orchestration docker-compose), `migrate.sh` (migration Prisma dans le container `server`), `start.sh`. | Bash | — |
| `.github/workflows/jobs.yml` | CI : back (install, `prisma generate`, lint, build, tests unitaires, migrations, e2e) et lint/build du front. | GitHub Actions | — |

Fichiers racine : `docker-compose.yml` (services de dev), `package.json` (workspaces yarn), `vercel.json` (déploiement de `plateform_front` : build du package puis de l'app), `.claude/` (réglages Claude Code du projet).

## Workspaces et installation

- Workspaces yarn racine : **`packages/*` et `plateform_front` uniquement** (`nohoist` pour `plateform_front`). `yarn install` à la racine installe ces deux-là.
- `plateform_back/` : `yarn install` dans le dossier. `vitrine_front/` : `npm install` dans le dossier. `rag-engine/` : `uv`.
- `plateform_front` consomme `packages/workflow/dist` : rebuild le package après l'avoir modifié.

## Commandes utiles

```bash
# Racine
./scripts/dev.sh [clean|build|rebuild|deps|e2e|unit]   # orchestration docker-compose
./scripts/migrate.sh [-reset] <nom_migration>          # migration Prisma dans le container `server`

# plateform_back/
yarn start:dev | yarn test | yarn test:e2e | yarn build:production | yarn lint

# plateform_front/
yarn start | yarn build | yarn test | yarn lint

# packages/workflow/
yarn build | yarn typecheck

# vitrine_front/
npm run dev (port 3001) | npm run build | npm run lint
```

Docker (`docker-compose.yml`) : `postgres` 5433, `postgres_test` 5434, `pgadmin` 5050, `redis` 6379, `server` 8080 (back monté en volume, `yarn start:dev`). `rag-engine/` a son propre `docker-compose.yml`.

## Carte des features

| Feature | Rôle | Front (`plateform_front/src/`) | Back (`plateform_back/src/`) | API slice |
|---|---|---|---|---|
| Authentification | Inscription, connexion, reset, JWT en cookie | `pages/Auth`, `app/AuthContext.tsx` | `auth/` | `services/auth/auth.ts` |
| Onboarding | Setup guidé en 3 étapes | `pages/Onboarding` | `onboarding/` | `services/onboarding/onboarding.ts` |
| Workspaces | Multi-tenant, rôles ADMIN / EDITOR / VIEWER | `app/WorkspaceGuard.tsx`, `app/Navigation/` | `workspace/` | `services/workspace/workspace.ts` |
| Agents | CRUD, export et partage d'agents | `pages/Agents`, `components/Agents` | `agent/` | `services/agent/agent.ts`, `agentMembers.ts` |
| Workflow builder | Pipeline RAG drag-and-drop, aperçus animés des blocs | `pages/Agents/Workflow`, `components/Agents/Workflow` | `workflow/` | `services/workflow/workflow.ts`, `services/models/models.ts` |
| Documents | Import, indexation asynchrone, statuts | `components/Document` | `document/`, `storage/` | `services/document/document.ts` |
| Playground | Test d'un agent en SSE, sans crédits | `components/ui/chat`, `hooks/chat/` | `agent-runtime/` | `services/agentRuntime/agentRuntime.ts` |
| Assistant final | Chat de l'utilisateur final, conversations persistées | `pages/Assistant` | `conversation/`, `agent-runtime/` | `services/chat/chat.ts` |
| Déploiement | Versions, snapshots de workflow, rollback | `components/Deployment` | `deployment/` | `services/deployment/deployment.ts` |
| Crédits & billing | Solde, transactions, Stripe | `pages/Billing`, `components/Billing` | `credit/`, `plans/` | `services/credit/credit.ts`, `services/billing/billing.ts` |
| Analytics | Stats par agent et par workspace | `components/Agents/Analytics`, `components/Dashboard` | `agent-analytics/`, `workspace/workspace-stats.service.ts` | `services/analytics/analytics.ts` |
| Rétention | Purge planifiée des logs de requêtes | — | `retention/` | — |

## API RAG externe

- `RAGENGINE_URL`, header `X-API-Key: RAGENGINE_API_KEY`. Consommée uniquement par `plateform_back/src/rag-engine/` (`rag-execution.service.ts`).
- `POST /rag/stream` `{ pipeline, query }` (réponse streamée) et `POST /rag/index` (multipart `file` + `document_id`).
- Le `pipeline` est le tableau `blocks` produit par `serializeWorkflow` (`packages/workflow`), validé par Zod (`rag-engine/pipeline.schema.ts` côté back). Format : `rag-engine/BLOCKS_FORMAT.md`. `RAG_MOCK=true` court-circuite l'appel en dev.

## Règles transverses

- **Types front / back** : aucun type partagé. Les types de `plateform_front/src/types/` sont maintenus à la main d'après les DTO du back ; toute évolution d'un DTO se répercute côté front.
- **Format d'erreur** : le back répond `{ statusCode, timestamp, path, error }` (`AllExceptionsFilter`) et la `baseQuery` du front en dépend.
- **Format de workflow** : `Workflow.definition` = `{ nodes, edges, blocks }`. Toute évolution de `TaskType` / `Task` / registre touche le package, l'app (`sanitizeWorkflowEdges` au chargement), le back (pipeline) et le moteur RAG.
- **CORS / cookies** : le back n'autorise que `FRONTEND_URL` avec `credentials: true` ; le front appelle `REACT_APP_BACKEND_URL` avec `credentials: "include"`.
- **Couleurs** : les tokens de `vitrine_front/src/styles/tokens.css` reprennent ceux de `plateform_front/src/themeNew` ; garder les deux alignés.

<!-- claude-md: commit=a08731b69e6e4fe0f496cfddf9b51da54571de75 date=2026-09-30 -->
