# CLAUDE.md — `plateform_back/`

API NestJS de la plateforme. Vue d'ensemble du monorepo et carte des features : `../CLAUDE.md`.

## Stack

NestJS 11, Prisma 6 (PostgreSQL), BullMQ + Redis, AWS S3, `class-validator`/`class-transformer`, Zod (uniquement pour valider le pipeline RAG sortant, `rag-engine/pipeline.schema.ts`), `nestjs-pino`, `@nestjs/swagger` + Scalar (`/docs`), Sentry (`@sentry/nestjs`), Resend (emails), `@nestjs/throttler`, `@nestjs/schedule`.

## Modules (`src/`)

Un dossier par module métier : `agent/`, `agent-analytics/`, `agent-runtime/`, `auth/`, `conversation/`, `credit/`, `deployment/`, `document/`, `events/`, `onboarding/`, `plans/`, `rag-engine/`, `redis/`, `retention/`, `sentry/`, `storage/`, `users/`, `workflow/`, `workspace/`, `lib/` (`event-bus.ts`), `prisma/`, `exeptions/` (typo assumée, ne pas renommer sans vérifier tous les imports). `generated/` = client Prisma généré.

Structure de module : `xxx.module.ts`, `xxx.controller.ts`, `xxx.service.ts`, `xxx.repository.ts`, `dto/`, `guard/`, `test/`. Couches Controller → Service → Repository → Prisma ; aucune logique métier dans un controller.

Particularités :
- `agent/` : aussi `agent-export.controller.ts` (export JSON/config) et `agent-member.*` (partage d'agent).
- `agent-analytics/` (stats par agent) est distinct de `workspace/workspace-stats.service.ts` (stats workspace, `GET /workspaces/:id/stats`).
- `document/` : CQRS léger (`commands/index-document.command.ts` + `handlers/index-document.handler.ts`), queue BullMQ `documents`.
- `plans/plans.config.ts` : limites par tier (`FREE` / `PRO` / `BUSINESS` / `ENTERPRISE`).
- `retention/retention-cleanup.service.ts` : purge planifiée des `AgentQueryLog` selon `Agent.retentionDays` (`null` = conservation illimitée).

## Runtime RAG (`agent-runtime/`)

- Endpoints SSE (`@Sse`, query en query-string `?query=`, max `MAX_RUNTIME_QUERY_LENGTH`, throttle 20 req/min) :
  - `GET /workspaces/:workspaceId/agents/:agentId/runtime/playground` : test, sans persistance ni crédits ;
  - `GET /assistants/:agentId/stream?conversationId=` (`conversation.controller.ts`) : assistant en production, persiste la conversation ;
  - `onboarding.controller.ts` passe par `streamWithOrgOverride`.
- `agent-runtime.service.ts` expose `playgroundStream`, `streamWithPersistence`, `streamWithOrgOverride`. Le pipeline vient d'`agent-runtime.builder.ts` (workflow **actif** → `definition.blocks`, ou `definition` entière pour les anciens workflows).
- `streaming/` : `rag-stream-forwarder.service.ts` relaie le stream de l'API RAG, `rag-stream-accumulator.ts` agrège le résultat, `runtime-sse-event.ts` encode les événements. Les **sinks** (`streaming/sinks/`) décident quoi faire à la fin : `TransientResultSink` (playground, onboarding) ou `PersistingResultSink` (enregistre les messages). Ils sont créés via `RuntimeSinkFactory`. Ajouter un nouveau mode = un nouveau sink, pas un `if` dans le service.
- `usage/` : `RuntimeUsageRecorder` pousse un job dans la queue BullMQ `USAGE_RECORDING_QUEUE` (5 tentatives) ; `UsageRecordingProcessor` appelle `UsageTrackerService.recordQuery` (log `AgentQueryLog` + débit d'1 crédit si `SUCCESS`, en transaction). Ne jamais débiter les crédits dans le chemin de la requête.
- `client-safe-error.ts` (`toClientSafeErrorMessage`) : dans un stream, seules les `HttpException` gardent leur message ; toute autre erreur est loggée, envoyée à Sentry et remplacée par `GENERIC_ERROR_MESSAGE`. L'utiliser pour tout message d'erreur SSE.
- `RAG_MOCK=true` court-circuite l'appel à l'API RAG (dev).

## Données (Prisma)

- Schéma splitté dans `prisma/schema/*.prisma` : `user`, `workspace`, `agent`, `workflow`, `document`, `conversation`, `credit`, `onboarding`, assemblé via `prisma.config.ts` (qui charge le `.env` lui-même).
- Modèles : `User`, `UserWorkspace` (rôles `ADMIN`/`EDITOR`/`VIEWER`), `Workspace`, `Agent` (`DEVELOPMENT` | `PRODUCTION`, plus de `STAGING`), `AgentVersion` (journal de déploiement immuable), `AgentMember`, `AgentQueryLog`, `Workflow` (`definition` JSONB `{ nodes, edges, blocks }`, `version`, `isActive`), `Document` (`UPLOADED` → `PROCESSING` → `INDEXED` | `FAILED`), `Conversation`, `Message`, `CreditBalance`, `CreditTransaction`, `OnboardingSession`.
- **Un seul dossier de migrations** : `prisma/schema/migrations/` (ne pas recréer `prisma/migrations/`). Toute modification passe par une migration : `../scripts/migrate.sh <nom>` (dans le container `server`), `-reset` pour repartir de zéro.
- Toujours `prisma.$transaction()` pour les opérations atomiques (crédits + `CreditTransaction`, déploiement + `AgentVersion`).
- Workflow actif vs snapshot : l'exécution charge toujours `isActive: true`. Les snapshots (`isActive: false`) sont créés au déploiement et servent au rollback (`POST .../deployments/rollback` recopie la définition). Ne jamais activer un snapshot à la main.
- Le statut d'un agent est dérivé du dernier `AgentVersion.toStatus` (aucune version = `DEVELOPMENT`) : le modifier via `deployment/`, jamais directement.
- Un workspace démarre à 0 crédit (`POST /workspaces/:id/credit-balance` pour en ajouter).

## Événements

`lib/event-bus.ts` (EventEmitter) pour les échanges inter-modules. Types dans `events/agent/agent-events.type.ts` (`AGENT_QUERY_COMPLETED`, `AGENT_DEPLOYED`, `AGENT_STATUS_CHANGED`) et `events/document/document-event.type.ts` (`DOCUMENT_INDEXED`, `DOCUMENT_FAILED`), listeners dans le même dossier. Émettre un événement plutôt qu'appeler le service d'un autre module quand l'action est secondaire.

## Validation des DTO

- Toute donnée entrante passe par un DTO `class-validator` (ex. `agent/dto/create-agent.request.ts`).
- **État actuel du `ValidationPipe` global** (`src/main.ts`) : seul `whitelist: true`. Ni `forbidNonWhitelisted` ni `transform`. Les `@Type(() => Number)` des query DTO (`agent-analytics/dto/analytics-pagination.query.ts`, `document/dto/document-pagination.query.ts`) n'ont donc pas d'effet ; les controllers récents utilisent `ParseIntPipe` + `DefaultValuePipe` (`agent-runtime.controller.ts`). À corriger avant d'ajouter des DTO de query qui dépendent de `transform`.
- Ne jamais renvoyer une entité Prisma contenant des champs sensibles (ex. `password`) ; utiliser un type de réponse (`UserSafe`).
- Paginer les listes potentiellement longues (limite plafonnée, ex. `Math.min(limit, 100)`).

## Config, sécurité, erreurs

- `ConfigModule.forRoot({ isGlobal: true })` — **aucune validation de schéma des variables d'environnement**. Accès via `ConfigService.getOrThrow(...)`, jamais de `process.env` dans le code métier. Fichiers : `.env`, `.env.development`, `.env.production`, `.env.test`.
- Variables principales : `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`, `TOKEN_VALIDITY`, `TOKEN_RESEND_INTERVAL`, `FRONTEND_URL`, `PORT`, `SEND_EMAILS`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `AWS_*`, `S3_BUCKET`, `RAGENGINE_URL`, `RAGENGINE_API_KEY`, `RAG_MOCK`, `REDIS_URL` (ou `REDIS_HOST`/`REDIS_PORT`), `SENTRY_DSN`, `GOOGLE_CLIENT_ID` (client OAuth Google du front, même valeur que `REACT_APP_GOOGLE_CLIENT_ID` : audience exigée par `POST /auth/google`).
- Auth : JWT en cookie HttpOnly `Authentication`, `JwtAuthGuard`, `LocalAuthGuard`, stratégies dans `auth/strategies/`, révocation au logout via `JwtBlacklistService` (vérifiée à chaque requête par la stratégie JWT ; s'assurer qu'elle survit à un redémarrage), anti brute-force via `LoginAttemptService`.
- Autorisations par guards, jamais vérifiées à la main :
  - `WorkspaceRolesGuard` (`workspace/roles/guards/`) + décorateur `RolesInWorkspace(...)` ;
  - `AgentBelongsToWorkspaceGuard` (`agent/guard/agent-workspace.guard.ts`) ;
  - `AgentAccessGuard` et `ConversationAccessGuard` (`conversation/guard/`) pour l'assistant final.
- Filtre global : `exeptions/interceptor.service.ts` (`AllExceptionsFilter`) — log pino, Sentry si `status >= 500`, réponse `{ statusCode, timestamp, path, error }`. **Le front dépend de ce format** (`plateform_front/src/services/api.ts`).
- Logger `nestjs-pino` / `Logger` NestJS, pas de `console.log`. CORS limité à `FRONTEND_URL` (plusieurs origines séparées par `,`), `credentials: true`.
- Emails : `auth/resend.service.ts` (Resend). `@getbrevo/brevo` est encore dans `package.json` mais n'est plus utilisé. `SEND_EMAILS=false` en dev (connexion possible sans vérifier l'email).

## Tests

- Jest, config dans `package.json` (`rootDir: src`, `*.spec.ts`), fichiers dans `src/<module>/test/` (sous-dossiers miroirs : `agent-runtime/test/streaming/`, `test/usage/`, `conversation/test/guard/`).
- Services, mais aussi controllers, repositories, guards, sinks et processors. Pattern : mock du repository pour tester le service, mock du service pour tester le controller.
- `yarn test`, `yarn test:e2e` (charge `.env.test`, nécessite `postgres_test` : `../scripts/dev.sh e2e`), `yarn test:cov`.
- Toute nouvelle logique métier dans un service, un guard ou un sink est accompagnée d'un test unitaire.

## Commandes (depuis `plateform_back/`)

```bash
yarn start:dev           # nodemon + ts-node
yarn build:production    # nest build + copie du client Prisma généré dans dist/
yarn test / test:e2e / test:cov
yarn lint
```

Hors workspaces yarn racine : `yarn install` dans ce dossier. En dev, le serveur tourne dans le container `server` du `docker-compose.yml` racine (port 8080).

## Cohérence front / back

Pas de types partagés : les types du front (`plateform_front/src/types/<feature>/`) sont écrits à la main d'après les DTO. Toute modification d'un DTO ou d'une réponse doit être répercutée côté front (risque de divergence silencieuse).
