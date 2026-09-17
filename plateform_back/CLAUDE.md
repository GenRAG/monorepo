# CLAUDE.md — `plateform_back/`

Conventions spécifiques au backend. Vue d'ensemble du projet, modèle de données et flux fonctionnels : voir `../CLAUDE.md`.

## Stack

NestJS 11, Prisma 6 (PostgreSQL), BullMQ + Redis, AWS S3, `class-validator`/`class-transformer`, Zod (uniquement pour valider le pipeline RAG sortant, `rag-engine/pipeline.schema.ts`), `nestjs-pino`, `@nestjs/swagger` + Scalar (`/docs`), Sentry (`@sentry/nestjs`), Resend (emails — voir plus bas), `@nestjs/throttler`, `@nestjs/schedule`.

## Modules (`src/`)

Un dossier par module métier : `agent/`, `agent-analytics/`, `agent-runtime/`, `auth/`, `conversation/`, `credit/`, `deployment/`, `document/`, `events/`, `onboarding/`, `plans/`, `rag-engine/`, `redis/`, `retention/`, `sentry/`, `storage/`, `users/`, `workflow/`, `workspace/`, `lib/`, `prisma/`, `exeptions/` (typo assumée, ne pas renommer sans vérifier tous les imports).

- `agent-analytics/` — module récent (analytics par agent), distinct de `workspace/workspace-stats.service.ts` (stats au niveau workspace). Ne pas les confondre : `agent-analytics.controller.ts`/`.service.ts`/`.repository.ts` + `dto/analytics-period.query.ts`, `dto/analytics-pagination.query.ts`.
- `agent/` contient aussi `agent-export.controller.ts` (export JSON/config) et `agent-member.*` (partage d'agent).
- `agent-runtime/` contient `rag-stream-forwarder.service.ts` (relai du stream SSE de l'API RAG externe) et `client-safe-error.ts` (normalisation des erreurs renvoyées au client), en plus de `agent-runtime.service/controller/builder/orchestrator.ts`.
- `document/` utilise un pattern CQRS léger : `commands/index-document.command.ts` + `handlers/index-document.handler.ts`.

Structure de module : `xxx.module.ts`, `xxx.controller.ts`, `xxx.service.ts`, `xxx.repository.ts`, `dto/`, `guard/`, `test/`. Architecture en couches Controller → Service → Repository → Prisma ; les controllers ne contiennent pas de logique métier.

## Validation des DTO

- Toute donnée entrante passe par un DTO `class-validator` (`@IsString`, `@IsInt`, `@ValidateNested` + `@Type()`, etc. — voir `agent/dto/create-agent.request.ts`).
- **État actuel du `ValidationPipe` global** (`src/main.ts`) : seul `whitelist: true` est activé. `forbidNonWhitelisted` et **`transform` ne sont pas activés**. Conséquence concrète : les décorateurs `@Type(() => Number)` posés sur les query DTO (`agent-analytics/dto/analytics-pagination.query.ts`, `document/dto/document-pagination.query.ts`) n'ont d'effet que si `transform` est actif — à vérifier/corriger avant d'ajouter de nouveaux DTO de query qui en dépendent (voir incohérence signalée à la racine).
- Ne jamais renvoyer une entité Prisma brute contenant des champs sensibles (ex. `password`) ; sérialiser via DTO de réponse.

## Config, sécurité, erreurs

- `ConfigModule.forRoot({ isGlobal: true })` (`app.module.ts`) — **aucune validation de schéma d'environnement actuellement** (pas de `validationSchema`/Zod sur les env vars). Accès via `ConfigService.getOrThrow(...)`, jamais de `process.env` direct dans le code métier.
- Auth : `JwtAuthGuard` (cookie), `LocalAuthGuard`, stratégies dans `auth/strategies/`. Guards de workspace/agent : `WorkspaceRolesGuard` (`workspace/roles/guards/`), `AgentBelongsToWorkspaceGuard` (`agent/guard/agent-workspace.guard.ts`). Décorateur `RolesInWorkspace(...)`.
- Filtre d'exception global : `exeptions/interceptor.service.ts` (`AllExceptionsFilter`) — logge via `nestjs-pino`, reporte à Sentry si `status >= 500` ou exception non-HTTP, répond `{ statusCode, timestamp, path, error }`. Le frontend dépend de ce format exact (`services/api.ts` côté front).
- Logger : `nestjs-pino` uniquement, pas de `console.log`.
- CORS : origine limitée à `FRONTEND_URL` (peut contenir plusieurs origines séparées par `,`), `credentials: true`.

## Emails

Le service d'envoi d'email est **`auth/resend.service.ts`** (`ResendService`, lib `resend`), pas Brevo — malgré la dépendance `@getbrevo/brevo` encore présente dans `package.json` (probablement obsolète, à vérifier avant de la réutiliser). Variables d'env : `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (pas `BREVO_API_KEY`). `SEND_EMAILS=false` en dev pour bypasser l'envoi réel.

## Prisma

- Schema splitté dans `plateform_back/prisma/schema/*.prisma` (`agent.prisma`, `workspace.prisma`, `document.prisma`, etc.), assemblé via `prisma.config.ts` (`schema: path.join('prisma', 'schema')`).
- **Un seul dossier de migrations** : `plateform_back/prisma/schema/migrations/`. (Une ancienne version de cette doc mentionnait un second dossier `prisma/migrations/` à la racine de `prisma/` — il n'existe plus, ne pas le recréer.)
- Toute modification de schéma passe par une migration (`./migrate.sh <nom>`, ou `-reset` pour repartir de zéro) — jamais de sync automatique hors dev local.
- Client généré dans `prisma/generated/` ; `prisma.config.ts` charge le `.env` manuellement (Prisma 6 ne le fait plus automatiquement quand `prisma.config.ts` est présent).
- Toujours `prisma.$transaction()` pour les opérations atomiques (ex. déduction de crédits + création de `CreditTransaction`).

## Tests

- Jest, config inline dans `package.json` (`rootDir: src`, pattern `*.spec.ts`).
- Convention : `src/<module>/test/<nom>.spec.ts`.
- Pas seulement des Services : plusieurs modules testent aussi Controller et Repository (`agent/test/agent.controller.spec.ts`, `agent/test/agent-member.controller.spec.ts`, `credit/test/credit-balance.repository.spec.ts`, `deployment/test/deployment.repository.spec.ts`, `conversation/test/conversation.repository.spec.ts`). Pattern dominant : mock du Repository pour tester le Service ; mock du Service pour tester le Controller.
- `yarn test` (unit), `yarn test:e2e` (charge `.env.test`, nécessite `postgres_test` — voir `dev.sh e2e`), `yarn test:cov`.
- Toute nouvelle logique métier ajoutée à un Service doit être accompagnée d'un test unitaire, en suivant le pattern des modules déjà couverts (liste à jour : voir `../CLAUDE.md#tests`).

## Commandes (depuis `plateform_back/`)

```bash
yarn start:dev           # nodemon + ts-node (dev)
yarn build:production    # nest build + copie prisma/generated dans dist/
yarn test / test:e2e / test:cov
yarn lint
```

`plateform_back` n'est pas dans les workspaces yarn racine (`package.json` racine ne liste que `packages/*` et `plateform_front`) — `yarn install` s'y fait indépendamment.
