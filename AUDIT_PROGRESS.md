# AUDIT_PROGRESS — pilotage de l'audit GenRAG

> Fichier de pilotage de la boucle d'audit. En cas d'interruption, reprendre depuis la section « Prochaine action » sans refaire ce qui est coché.
> Rapport détaillé : `AUDIT_REPORT.md`.

## Conventions de travail

- Branche de base des corrections : `origin/dev` (branche d'intégration : toutes les PR récentes de l'équipe ciblent `dev` ; `main` est en retard de 16 commits et ne contient pas les CLAUDE.md de référence).
- Une branche par thème : `audit/<perimetre>-<theme>` (refactors : `audit/<perimetre>-refactor-<pattern>`), PR vers `dev`.
- Fichiers de pilotage (`AUDIT_PROGRESS.md`, `AUDIT_REPORT.md`) : branche `fix/claude-audit-refacto` → PR de clôture (Phase 4).
- Statuts des constats : `à traiter` / `en cours` / `PR ouverte (lien)` / `décision humaine requise`.

## Phases

- [x] Phase 0 — Cartographie (CLAUDE.md lus, périmètres et fichiers listés, commandes identifiées)
- [x] Phase 1 — Baseline
- [ ] Phase 2 — Audit fichier par fichier
- [ ] Phase 3 — Corrections et PR
- [ ] Phase 4 — PR de clôture

## Périmètres (dossiers contenant un CLAUDE.md)

| Périmètre | Stack | Install | Lint | Typecheck | Tests | Build |
|---|---|---|---|---|---|---|
| `plateform_back/` | NestJS 11, Prisma 6, BullMQ | `yarn install --frozen-lockfile` + `yarn prisma generate` | `yarn lint` (⚠ `--fix`, lancer `npx eslint "{src,test}/**/*.ts"` pour la baseline) | `npx tsc --noEmit -p tsconfig.json` | `yarn test` ; `yarn test:e2e` (Postgres) | `yarn build` |
| `plateform_front/` | React 19, CRA+craco, Chakra 2, RTK Query | `yarn install` (racine, workspaces) | `npx eslint "src/**/*.{ts,tsx}"` | `npx tsc --noEmit` | `yarn test` (aucun test) | `yarn build` (nécessite `packages/workflow/dist`) |
| `packages/workflow/` | React, @xyflow/react, Chakra | `yarn install` (racine) | — (pas d'ESLint) | `yarn typecheck` | — (aucun test) | `yarn build` |
| `vitrine_front/` | Vite, React 19, CSS Modules, GSAP | `npm ci` | `npm run lint` | `npx tsc -b` | — (aucun test) | `npm run build` |
| racine (monorepo) | docker-compose, scripts Bash, CI GitHub Actions | — | `bash -n scripts/*.sh` | — | — | — |

**Exclu sur demande explicite de l'utilisateur** : `rag-engine/` (copie du moteur RAG externe) — ni audité ni modifié ; seul `rag-engine/BLOCKS_FORMAT.md` est lu comme référence du contrat back ↔ API RAG.

Remarque : `RAG-GenRag/` (cité dans `../CLAUDE.md`) n'est pas versionné et absent du clone : hors audit.

## Baseline (Phase 1)

Mesurée le 2026-09-30 sur `origin/dev` (1a94e09), Node 22.22, Yarn 1.22, Postgres 16 + Redis 7 locaux (Docker indisponible dans l'environnement).

| Périmètre | Install | Lint | Typecheck | Tests | Build | Audit deps (prod) |
|---|---|---|---|---|---|---|
| `plateform_back` | ✅ | ✅ 0 erreur (`eslint` sans `--fix`) | ✅ `tsc --noEmit` | ✅ unit 37 suites / 341 tests ; ⚠ e2e 89/94 (5 échecs, voir ci-dessous) | ❌ `yarn build` échoue sur un clone propre (TS5033 : `tsconfig.build.tsbuildinfo` commité rejoue des erreurs d'écriture vers `/home/bollore/...`) ; ✅ si le `.tsbuildinfo` est supprimé | 109 vulnérabilités (2 critiques, 51 hautes), dont `form-data` critique via `@getbrevo/brevo` / `sib-api-v3-sdk` (inutilisés) |
| `plateform_front` | ✅ (yarn racine) | ❌ 55 problèmes (42 erreurs `react/prop-types` dans `components/charts`, 8 `no-unused-vars`, 4 `exhaustive-deps`, 1 `no-floating-promises`) — non bloquant en CI (`continue-on-error`) | ✅ `tsc --noEmit` | ❌ `craco test` : aucun test (exit 1 « No tests found ») | ✅ `yarn build` (62 s) | 282 vulnérabilités (4 critiques, 190 hautes), quasi toutes via `react-scripts` (outillage de build) ; runtime : `react-router` (haute) |
| `packages/workflow` | ✅ (yarn racine) | — (pas d'ESLint configuré) | ✅ `yarn typecheck` | — (aucun test) | ✅ `yarn build` | (inclus dans l'audit racine) |
| `vitrine_front` | ✅ `npm ci` | ✅ 0 | ✅ `tsc -b` | — (aucun test) | ✅ `npm run build` | ✅ 0 vulnérabilité |

Échecs e2e du back (baseline, préexistants) :
1. `Agent › POST … › should trim whitespace from name` — le nom n'est plus trimé (`"  Trimmed Agent  "`).
2. `Agent › POST … › should create agent without description` — description par défaut `"Pas de description pour le moment"` au lieu de `null`.
3. `Agent › DELETE … › should delete agent and cascade workflows` — 204 au lieu de 200.
4. `Agent › DELETE … › should return deleted agent data` — 204 au lieu de 200.
5. `Auth › Per-email brute-force protection › should block after 5 failed login attempts` — 429 (throttler) avant le 5e 401.

Conditions : `.env.test` local (non commité), `REDIS_HOST`/`REDIS_PORT` nécessaires même si `REDIS_URL` est défini (BullMQ hors production ignore `REDIS_URL`).

## Constats

Voir le tableau détaillé dans `AUDIT_REPORT.md`. Suivi des statuts :

| ID | Sévérité | Titre | Statut |
|---|---|---|---|

## Prochaine action

Phase 2 : auditer `packages/workflow` (61 fichiers).

## Fichiers à auditer (Phase 2)

Hors `node_modules`, `build`, `dist`, `.venv`, `generated`, lockfiles, binaires (images, polices) et `rag-engine/` (exclu). Liste issue de `git ls-files`.

### Périmètre `plateform_back` (234 fichiers)


**plateform_back/**

- [x] `plateform_back/.dockerignore`
- [x] `plateform_back/.gitignore`
- [x] `plateform_back/.prettierrc`

**plateform_back/.vscode/**

- [x] `plateform_back/.vscode/settings.json`

**plateform_back/**

- [x] `plateform_back/CLAUDE.md`
- [x] `plateform_back/Dockerfile`
- [x] `plateform_back/README.md`
- [x] `plateform_back/eslint.config.mjs`
- [x] `plateform_back/nest-cli.json`
- [x] `plateform_back/nodemon.json`
- [x] `plateform_back/package.json`
- [x] `plateform_back/prisma.config.ts`

**plateform_back/prisma/schema/**

- [x] `plateform_back/prisma/schema/agent.prisma`
- [x] `plateform_back/prisma/schema/conversation.prisma`
- [x] `plateform_back/prisma/schema/credit.prisma`
- [x] `plateform_back/prisma/schema/document.prisma`

**plateform_back/prisma/schema/migrations/20260329234940_add_document_model/**

- [x] `plateform_back/prisma/schema/migrations/20260329234940_add_document_model/migration.sql`

**plateform_back/prisma/schema/migrations/20260416201840_add_size_name_document/**

- [x] `plateform_back/prisma/schema/migrations/20260416201840_add_size_name_document/migration.sql`

**plateform_back/prisma/schema/migrations/20260418231041_retry_count/**

- [x] `plateform_back/prisma/schema/migrations/20260418231041_retry_count/migration.sql`

**plateform_back/prisma/schema/migrations/20260428061909_agent_deployment/**

- [x] `plateform_back/prisma/schema/migrations/20260428061909_agent_deployment/migration.sql`

**plateform_back/prisma/schema/migrations/20260429070603_agent_deployment_fix/**

- [x] `plateform_back/prisma/schema/migrations/20260429070603_agent_deployment_fix/migration.sql`

**plateform_back/prisma/schema/migrations/20260429102244_fix_rollback/**

- [x] `plateform_back/prisma/schema/migrations/20260429102244_fix_rollback/migration.sql`

**plateform_back/prisma/schema/migrations/20260504214329_reset/**

- [x] `plateform_back/prisma/schema/migrations/20260504214329_reset/migration.sql`

**plateform_back/prisma/schema/migrations/20260505210058_remove_name/**

- [x] `plateform_back/prisma/schema/migrations/20260505210058_remove_name/migration.sql`

**plateform_back/prisma/schema/migrations/20260506023323_add_agent_status/**

- [x] `plateform_back/prisma/schema/migrations/20260506023323_add_agent_status/migration.sql`

**plateform_back/prisma/schema/migrations/20260508034352_add_onboarding_session/**

- [x] `plateform_back/prisma/schema/migrations/20260508034352_add_onboarding_session/migration.sql`

**plateform_back/prisma/schema/migrations/20260510030242_add_plan_tier_to_workspace/**

- [x] `plateform_back/prisma/schema/migrations/20260510030242_add_plan_tier_to_workspace/migration.sql`

**plateform_back/prisma/schema/migrations/20260510033700_add_steps_data_to_onboarding/**

- [x] `plateform_back/prisma/schema/migrations/20260510033700_add_steps_data_to_onboarding/migration.sql`

**plateform_back/prisma/schema/migrations/20260511032450_add_conversation/**

- [x] `plateform_back/prisma/schema/migrations/20260511032450_add_conversation/migration.sql`

**plateform_back/prisma/schema/migrations/20260520035722_add_agent_members/**

- [x] `plateform_back/prisma/schema/migrations/20260520035722_add_agent_members/migration.sql`

**plateform_back/prisma/schema/migrations/20260529000000_add_user_to_conversation/**

- [x] `plateform_back/prisma/schema/migrations/20260529000000_add_user_to_conversation/migration.sql`

**plateform_back/prisma/schema/migrations/20260529152457_token_fix/**

- [x] `plateform_back/prisma/schema/migrations/20260529152457_token_fix/migration.sql`

**plateform_back/prisma/schema/migrations/20260605000000_add_agent_query_log/**

- [x] `plateform_back/prisma/schema/migrations/20260605000000_add_agent_query_log/migration.sql`

**plateform_back/prisma/schema/migrations/20260605061628_api_log/**

- [x] `plateform_back/prisma/schema/migrations/20260605061628_api_log/migration.sql`

**plateform_back/prisma/schema/migrations/20260605120000_add_agent_retention_days/**

- [x] `plateform_back/prisma/schema/migrations/20260605120000_add_agent_retention_days/migration.sql`

**plateform_back/prisma/schema/migrations/20260609000000_add_credits_used_to_query_log/**

- [x] `plateform_back/prisma/schema/migrations/20260609000000_add_credits_used_to_query_log/migration.sql`

**plateform_back/prisma/schema/migrations/20260708105937_fix_user_delete_fk_constraints/**

- [x] `plateform_back/prisma/schema/migrations/20260708105937_fix_user_delete_fk_constraints/migration.sql`

**plateform_back/prisma/schema/migrations/20260902135919_add_agent_query_log_cost_breakdown/**

- [x] `plateform_back/prisma/schema/migrations/20260902135919_add_agent_query_log_cost_breakdown/migration.sql`

**plateform_back/prisma/schema/migrations/20260907194858_add_agent_query_log_sources/**

- [x] `plateform_back/prisma/schema/migrations/20260907194858_add_agent_query_log_sources/migration.sql`

**plateform_back/prisma/schema/migrations/20260922224339_add_agent_query_log_and_document_indexes/**

- [x] `plateform_back/prisma/schema/migrations/20260922224339_add_agent_query_log_and_document_indexes/migration.sql`

**plateform_back/prisma/schema/migrations/**

- [x] `plateform_back/prisma/schema/migrations/migration_lock.toml`

**plateform_back/prisma/schema/**

- [x] `plateform_back/prisma/schema/onboarding.prisma`
- [x] `plateform_back/prisma/schema/schema.prisma`
- [x] `plateform_back/prisma/schema/user.prisma`
- [x] `plateform_back/prisma/schema/workflow.prisma`
- [x] `plateform_back/prisma/schema/workspace.prisma`

**plateform_back/src/agent-analytics/**

- [x] `plateform_back/src/agent-analytics/agent-analytics.controller.ts`
- [x] `plateform_back/src/agent-analytics/agent-analytics.module.ts`
- [x] `plateform_back/src/agent-analytics/agent-analytics.repository.ts`
- [x] `plateform_back/src/agent-analytics/agent-analytics.service.ts`
- [x] `plateform_back/src/agent-analytics/agent-analytics.types.ts`

**plateform_back/src/agent-analytics/dto/**

- [x] `plateform_back/src/agent-analytics/dto/analytics-pagination.query.ts`
- [x] `plateform_back/src/agent-analytics/dto/analytics-period.query.ts`

**plateform_back/src/agent-analytics/test/**

- [x] `plateform_back/src/agent-analytics/test/agent-analytics.repository.spec.ts`

**plateform_back/src/agent-runtime/**

- [x] `plateform_back/src/agent-runtime/agent-query-log.repository.ts`
- [x] `plateform_back/src/agent-runtime/agent-runtime.builder.ts`
- [x] `plateform_back/src/agent-runtime/agent-runtime.controller.ts`
- [x] `plateform_back/src/agent-runtime/agent-runtime.module.ts`
- [x] `plateform_back/src/agent-runtime/agent-runtime.orchestrator.ts`
- [x] `plateform_back/src/agent-runtime/agent-runtime.service.ts`
- [x] `plateform_back/src/agent-runtime/agent-runtime.types.ts`
- [x] `plateform_back/src/agent-runtime/client-safe-error.ts`

**plateform_back/src/agent-runtime/streaming/**

- [x] `plateform_back/src/agent-runtime/streaming/rag-stream-accumulator.ts`
- [x] `plateform_back/src/agent-runtime/streaming/rag-stream-forwarder.service.ts`
- [x] `plateform_back/src/agent-runtime/streaming/runtime-sse-event.ts`

**plateform_back/src/agent-runtime/streaming/sinks/**

- [x] `plateform_back/src/agent-runtime/streaming/sinks/persisting-result-sink.ts`
- [x] `plateform_back/src/agent-runtime/streaming/sinks/runtime-result-sink.interface.ts`
- [x] `plateform_back/src/agent-runtime/streaming/sinks/runtime-sink.factory.ts`
- [x] `plateform_back/src/agent-runtime/streaming/sinks/transient-result-sink.ts`

**plateform_back/src/agent-runtime/test/**

- [x] `plateform_back/src/agent-runtime/test/agent-runtime.builder.spec.ts`
- [x] `plateform_back/src/agent-runtime/test/agent-runtime.orchestrator.spec.ts`
- [x] `plateform_back/src/agent-runtime/test/agent-runtime.service.spec.ts`

**plateform_back/src/agent-runtime/test/streaming/**

- [x] `plateform_back/src/agent-runtime/test/streaming/rag-stream-accumulator.spec.ts`
- [x] `plateform_back/src/agent-runtime/test/streaming/rag-stream-forwarder.service.spec.ts`

**plateform_back/src/agent-runtime/test/streaming/sinks/**

- [x] `plateform_back/src/agent-runtime/test/streaming/sinks/persisting-result-sink.spec.ts`
- [x] `plateform_back/src/agent-runtime/test/streaming/sinks/transient-result-sink.spec.ts`

**plateform_back/src/agent-runtime/test/usage/**

- [x] `plateform_back/src/agent-runtime/test/usage/runtime-usage-recorder.spec.ts`
- [x] `plateform_back/src/agent-runtime/test/usage/usage-recording.processor.spec.ts`

**plateform_back/src/agent-runtime/usage/**

- [x] `plateform_back/src/agent-runtime/usage/runtime-usage-recorder.ts`
- [x] `plateform_back/src/agent-runtime/usage/usage-recording.processor.ts`

**plateform_back/src/agent/**

- [x] `plateform_back/src/agent/agent-export.controller.ts`
- [x] `plateform_back/src/agent/agent-member.controller.ts`
- [x] `plateform_back/src/agent/agent-member.repository.ts`
- [x] `plateform_back/src/agent/agent-member.service.ts`
- [x] `plateform_back/src/agent/agent.controller.ts`
- [x] `plateform_back/src/agent/agent.module.ts`
- [x] `plateform_back/src/agent/agent.repository.ts`
- [x] `plateform_back/src/agent/agent.service.ts`

**plateform_back/src/agent/dto/**

- [x] `plateform_back/src/agent/dto/add-agent-member.request.ts`
- [x] `plateform_back/src/agent/dto/create-agent.request.ts`
- [x] `plateform_back/src/agent/dto/update-agent.request.ts`

**plateform_back/src/agent/guard/**

- [x] `plateform_back/src/agent/guard/agent-workspace.guard.ts`

**plateform_back/src/agent/test/**

- [x] `plateform_back/src/agent/test/agent-member.controller.spec.ts`
- [x] `plateform_back/src/agent/test/agent-member.service.spec.ts`
- [x] `plateform_back/src/agent/test/agent.controller.spec.ts`
- [x] `plateform_back/src/agent/test/agent.service.spec.ts`

**plateform_back/src/**

- [x] `plateform_back/src/app.module.ts`

**plateform_back/src/auth/**

- [x] `plateform_back/src/auth/auth.controller.ts`
- [x] `plateform_back/src/auth/auth.module.ts`
- [x] `plateform_back/src/auth/auth.service.ts`
- [x] `plateform_back/src/auth/current-user.decorator.ts`

**plateform_back/src/auth/dto/**

- [x] `plateform_back/src/auth/dto/login.request.ts`
- [x] `plateform_back/src/auth/dto/verify-token.request.ts`

**plateform_back/src/auth/guards/**

- [x] `plateform_back/src/auth/guards/jwt-auth.guard.ts`
- [x] `plateform_back/src/auth/guards/local-auth.guard.ts`

**plateform_back/src/auth/**

- [x] `plateform_back/src/auth/jwt-blacklist.service.ts`
- [x] `plateform_back/src/auth/login-attempt.service.ts`
- [x] `plateform_back/src/auth/resend.service.ts`

**plateform_back/src/auth/strategies/**

- [x] `plateform_back/src/auth/strategies/jwt.strategy.ts`
- [x] `plateform_back/src/auth/strategies/local.strategy.ts`

**plateform_back/src/auth/test/**

- [x] `plateform_back/src/auth/test/auth.service.spec.ts`
- [x] `plateform_back/src/auth/test/jwt-blacklist.service.spec.ts`
- [x] `plateform_back/src/auth/test/login-attempt.service.spec.ts`
- [x] `plateform_back/src/auth/test/token.service.spec.ts`

**plateform_back/src/auth/**

- [x] `plateform_back/src/auth/token-payload.interface.ts`
- [x] `plateform_back/src/auth/token.service.ts`

**plateform_back/src/conversation/**

- [x] `plateform_back/src/conversation/conversation.controller.ts`
- [x] `plateform_back/src/conversation/conversation.module.ts`
- [x] `plateform_back/src/conversation/conversation.repository.ts`
- [x] `plateform_back/src/conversation/conversation.service.ts`

**plateform_back/src/conversation/guard/**

- [x] `plateform_back/src/conversation/guard/agent-access.guard.ts`
- [x] `plateform_back/src/conversation/guard/conversation-access.guard.ts`

**plateform_back/src/conversation/test/**

- [x] `plateform_back/src/conversation/test/conversation.controller.spec.ts`
- [x] `plateform_back/src/conversation/test/conversation.repository.spec.ts`
- [x] `plateform_back/src/conversation/test/conversation.service.spec.ts`

**plateform_back/src/conversation/test/guard/**

- [x] `plateform_back/src/conversation/test/guard/agent-access.guard.spec.ts`
- [x] `plateform_back/src/conversation/test/guard/conversation-access.guard.spec.ts`

**plateform_back/src/credit/**

- [x] `plateform_back/src/credit/credit-balance.controller.ts`
- [x] `plateform_back/src/credit/credit-balance.repository.ts`
- [x] `plateform_back/src/credit/credit-balance.service.ts`
- [x] `plateform_back/src/credit/credit-pricing.ts`
- [x] `plateform_back/src/credit/credit-transaction.repository.ts`
- [x] `plateform_back/src/credit/credit-transaction.service.ts`
- [x] `plateform_back/src/credit/credit.module.ts`

**plateform_back/src/credit/test/**

- [x] `plateform_back/src/credit/test/credit-balance.controller.spec.ts`
- [x] `plateform_back/src/credit/test/credit-balance.repository.spec.ts`
- [x] `plateform_back/src/credit/test/credit-balance.service.spec.ts`
- [x] `plateform_back/src/credit/test/credit-transaction.repository.spec.ts`
- [x] `plateform_back/src/credit/test/credit-transaction.service.spec.ts`
- [x] `plateform_back/src/credit/test/usage-tracker.service.spec.ts`

**plateform_back/src/credit/**

- [x] `plateform_back/src/credit/usage-tracker.service.ts`

**plateform_back/src/deployment/**

- [x] `plateform_back/src/deployment/deployment.controller.ts`
- [x] `plateform_back/src/deployment/deployment.module.ts`
- [x] `plateform_back/src/deployment/deployment.repository.ts`
- [x] `plateform_back/src/deployment/deployment.service.ts`

**plateform_back/src/deployment/dto/**

- [x] `plateform_back/src/deployment/dto/create-deployment.request.ts`
- [x] `plateform_back/src/deployment/dto/rollback-deployment.request.ts`

**plateform_back/src/deployment/test/**

- [x] `plateform_back/src/deployment/test/deployment.controller.spec.ts`
- [x] `plateform_back/src/deployment/test/deployment.repository.spec.ts`
- [x] `plateform_back/src/deployment/test/deployment.service.spec.ts`

**plateform_back/src/document/commands/**

- [x] `plateform_back/src/document/commands/index-document.command.ts`

**plateform_back/src/document/**

- [x] `plateform_back/src/document/document.controller.ts`
- [x] `plateform_back/src/document/document.module.ts`
- [x] `plateform_back/src/document/document.processor.ts`
- [x] `plateform_back/src/document/document.repository.ts`
- [x] `plateform_back/src/document/document.service.ts`

**plateform_back/src/document/dto/**

- [x] `plateform_back/src/document/dto/document-pagination.query.ts`

**plateform_back/src/document/handlers/**

- [x] `plateform_back/src/document/handlers/index-document.handler.ts`

**plateform_back/src/events/agent/**

- [x] `plateform_back/src/events/agent/agent-event.listener.ts`
- [x] `plateform_back/src/events/agent/agent-events.ts`
- [x] `plateform_back/src/events/agent/agent-events.type.ts`

**plateform_back/src/events/document/**

- [x] `plateform_back/src/events/document/document-event.listener.ts`
- [x] `plateform_back/src/events/document/document-event.ts`
- [x] `plateform_back/src/events/document/document-event.type.ts`

**plateform_back/src/exeptions/**

- [x] `plateform_back/src/exeptions/interceptor.service.ts`

**plateform_back/src/lib/**

- [x] `plateform_back/src/lib/event-bus.ts`
- [x] `plateform_back/src/lib/filename.util.ts`

**plateform_back/src/**

- [x] `plateform_back/src/main.ts`

**plateform_back/src/onboarding/**

- [x] `plateform_back/src/onboarding/demo-workflow.definition.ts`

**plateform_back/src/onboarding/dto/**

- [x] `plateform_back/src/onboarding/dto/compare-onboarding.request.ts`
- [x] `plateform_back/src/onboarding/dto/complete-onboarding.request.ts`
- [x] `plateform_back/src/onboarding/dto/onboarding-session.response.ts`
- [x] `plateform_back/src/onboarding/dto/update-step.request.ts`
- [x] `plateform_back/src/onboarding/dto/update-steps-data.request.ts`

**plateform_back/src/onboarding/**

- [x] `plateform_back/src/onboarding/onboarding.controller.ts`
- [x] `plateform_back/src/onboarding/onboarding.module.ts`
- [x] `plateform_back/src/onboarding/onboarding.repository.ts`
- [x] `plateform_back/src/onboarding/onboarding.service.ts`

**plateform_back/src/onboarding/test/**

- [x] `plateform_back/src/onboarding/test/onboarding.repository.spec.ts`
- [x] `plateform_back/src/onboarding/test/onboarding.service.spec.ts`

**plateform_back/src/plans/**

- [x] `plateform_back/src/plans/plans.config.ts`

**plateform_back/src/prisma/**

- [x] `plateform_back/src/prisma/prisma.module.ts`
- [x] `plateform_back/src/prisma/prisma.service.ts`



**plateform_back/src/rag-engine/**

- [x] `plateform_back/src/rag-engine/ndjson-line-buffer.ts`
- [x] `plateform_back/src/rag-engine/pipeline.schema.ts`
- [x] `plateform_back/src/rag-engine/rag-engine.controller.ts`
- [x] `plateform_back/src/rag-engine/rag-engine.module.ts`
- [x] `plateform_back/src/rag-engine/rag-execution.service.ts`

**plateform_back/src/redis/**

- [x] `plateform_back/src/redis/redis.module.ts`

**plateform_back/src/retention/**

- [x] `plateform_back/src/retention/retention-cleanup.service.ts`
- [x] `plateform_back/src/retention/retention.module.ts`

**plateform_back/src/sentry/**

- [x] `plateform_back/src/sentry/instrument.ts`

**plateform_back/src/storage/**

- [x] `plateform_back/src/storage/s3.strategy.ts`
- [x] `plateform_back/src/storage/storage.module.ts`
- [x] `plateform_back/src/storage/storage.strategy.ts`

**plateform_back/src/users/dto/**

- [x] `plateform_back/src/users/dto/change-password.request.ts`
- [x] `plateform_back/src/users/dto/create-user.request.ts`
- [x] `plateform_back/src/users/dto/update-profile.request.ts`

**plateform_back/src/users/pipes/**

- [x] `plateform_back/src/users/pipes/user-validation.pipe.ts`

**plateform_back/src/users/test/**

- [x] `plateform_back/src/users/test/user.service.spec.ts`

**plateform_back/src/users/**

- [x] `plateform_back/src/users/user.repository.ts`
- [x] `plateform_back/src/users/users.controller.ts`
- [x] `plateform_back/src/users/users.module.ts`
- [x] `plateform_back/src/users/users.service.ts`

**plateform_back/src/workflow/dto/**

- [x] `plateform_back/src/workflow/dto/activate-workflow.request.ts`
- [x] `plateform_back/src/workflow/dto/create-workflow.request.ts`
- [x] `plateform_back/src/workflow/dto/update-workflow.request.ts`

**plateform_back/src/workflow/test/**

- [x] `plateform_back/src/workflow/test/workflow.service.spec.ts`

**plateform_back/src/workflow/**

- [x] `plateform_back/src/workflow/workflow.controller.ts`
- [x] `plateform_back/src/workflow/workflow.module.ts`
- [x] `plateform_back/src/workflow/workflow.repository.ts`
- [x] `plateform_back/src/workflow/workflow.service.ts`

**plateform_back/src/workspace/dto/**

- [x] `plateform_back/src/workspace/dto/create-workspace.request.ts`

**plateform_back/src/workspace/roles/guards/**

- [x] `plateform_back/src/workspace/roles/guards/workspace-roles.guard.ts`

**plateform_back/src/workspace/roles/**

- [x] `plateform_back/src/workspace/roles/roles-workspace.decorator.ts`

**plateform_back/src/workspace/test/**

- [x] `plateform_back/src/workspace/test/workspace.service.spec.ts`

**plateform_back/src/workspace/**

- [x] `plateform_back/src/workspace/workspace-stats.service.ts`
- [x] `plateform_back/src/workspace/workspace.controller.ts`
- [x] `plateform_back/src/workspace/workspace.module.ts`
- [x] `plateform_back/src/workspace/workspace.repository.ts`
- [x] `plateform_back/src/workspace/workspace.service.ts`

**plateform_back/test/**

- [x] `plateform_back/test/agent-member.e2e-spec.ts`
- [x] `plateform_back/test/agent.e2e-spec.ts`
- [x] `plateform_back/test/auth.e2e-spec.ts`

**plateform_back/test/helpers/**

- [x] `plateform_back/test/helpers/app.helper.ts`
- [x] `plateform_back/test/helpers/auth.helper.ts`
- [x] `plateform_back/test/helpers/db.helper.ts`

**plateform_back/test/**

- [x] `plateform_back/test/jest-e2e.json`
- [x] `plateform_back/test/user.e2e-spec.ts`
- [x] `plateform_back/test/workflow.e2e-spec.ts`
- [x] `plateform_back/test/workspace.e2e-spec.ts`

**plateform_back/**

- [x] `plateform_back/tsconfig.build.json`
- [x] `plateform_back/tsconfig.build.tsbuildinfo`
- [x] `plateform_back/tsconfig.json`

### Périmètre `plateform_front` (554 fichiers)


**plateform_front/**

- [x] `plateform_front/.gitignore`

**plateform_front/.vscode/**

- [x] `plateform_front/.vscode/settings.json`

**plateform_front/**

- [x] `plateform_front/CLAUDE.md`
- [x] `plateform_front/README.md`
- [x] `plateform_front/REFACTOR_PLAN.md`
- [x] `plateform_front/components.json`
- [x] `plateform_front/craco.config.js`

**plateform_front/docs/**

- [x] `plateform_front/docs/ARCHITECTURE.md`

**plateform_front/**

- [x] `plateform_front/eslint.config.mjs`
- [x] `plateform_front/eslint.config.mts`
- [x] `plateform_front/package.json`

**plateform_front/public/**

- [x] `plateform_front/public/index.html`
- [x] `plateform_front/public/manifest.json`
- [x] `plateform_front/public/robots.txt`

**plateform_front/scripts/**

- [x] `plateform_front/scripts/fix-tailwind-infinity.js`

**plateform_front/src/app/**

- [x] `plateform_front/src/app/App.tsx`
- [x] `plateform_front/src/app/AuthContext.tsx`
- [x] `plateform_front/src/app/DefaultRedirect.tsx`

**plateform_front/src/app/Navigation/AgentSidebar/**

- [x] `plateform_front/src/app/Navigation/AgentSidebar/AgentSidebar.tsx`
- [x] `plateform_front/src/app/Navigation/AgentSidebar/AgentSidebarItems.tsx`

**plateform_front/src/app/Navigation/LegalSidebar/**

- [x] `plateform_front/src/app/Navigation/LegalSidebar/LegalSidebar.tsx`

**plateform_front/src/app/Navigation/MainSidebar/**

- [x] `plateform_front/src/app/Navigation/MainSidebar/WorkspaceDropdown.tsx`

**plateform_front/src/app/Navigation/**

- [x] `plateform_front/src/app/Navigation/SidebarFooter.tsx`
- [x] `plateform_front/src/app/Navigation/SidebarFooterPanel.tsx`
- [x] `plateform_front/src/app/Navigation/SidebarHeader.tsx`
- [x] `plateform_front/src/app/Navigation/SidebarItem.tsx`
- [x] `plateform_front/src/app/Navigation/SidebarSection.tsx`
- [x] `plateform_front/src/app/Navigation/sidebarConfig.ts`

**plateform_front/src/app/**

- [x] `plateform_front/src/app/PrivateAgentAppLayout.tsx`
- [x] `plateform_front/src/app/PrivateAppLayout.tsx`
- [x] `plateform_front/src/app/PrivateRoute.tsx`
- [x] `plateform_front/src/app/Router.tsx`

**plateform_front/src/app/Routes/**

- [x] `plateform_front/src/app/Routes/AgentRoutes.tsx`
- [x] `plateform_front/src/app/Routes/AppRoutes.tsx`
- [x] `plateform_front/src/app/Routes/AuthRoutes.tsx`
- [x] `plateform_front/src/app/Routes/LegalRoutes.tsx`

**plateform_front/src/app/**

- [x] `plateform_front/src/app/WorkspaceGuard.tsx`

**plateform_front/src/components/Agents/**

- [x] `plateform_front/src/components/Agents/AgentFormPanel.tsx`
- [x] `plateform_front/src/components/Agents/AgentPreviewHeader.tsx`
- [x] `plateform_front/src/components/Agents/AgentPreviewPanel.tsx`
- [x] `plateform_front/src/components/Agents/AgentsTable.tsx`

**plateform_front/src/components/Agents/Analytics/**

- [x] `plateform_front/src/components/Agents/Analytics/ActivityHeatmapCard.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/AnalyticsChartCard.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/AnalyticsTabs.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/ChartInfoTooltip.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/CostByModelCard.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/CostByTypeCard.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/CostChart.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/DocumentHealthCard.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/ErrorsChart.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/LatencyChart.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/PieLegendSwatch.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/RecentQueriesCard.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/VolumeChart.tsx`
- [x] `plateform_front/src/components/Agents/Analytics/types.ts`

**plateform_front/src/components/Agents/**

- [x] `plateform_front/src/components/Agents/CreateAgentModal.tsx`
- [x] `plateform_front/src/components/Agents/DeleteAgentModal.tsx`
- [x] `plateform_front/src/components/Agents/RightPreview.tsx`
- [x] `plateform_front/src/components/Agents/TemplateCard.tsx`

**plateform_front/src/components/Agents/Workflow/NodeInformation/**

- [x] `plateform_front/src/components/Agents/Workflow/NodeInformation/BenefitItem.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeInformation/NodeInformationLayout.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeInformation/Reranker.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeInformation/Rewriter.tsx`

**plateform_front/src/components/Agents/Workflow/NodeModalContent/Document/**

- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Document/DocumentAnimation.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Document/DocumentChunks.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Document/DocumentNodeContent.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Document/DocumentNodeOverviewTab.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Document/DocumentSearch.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Document/DocumentUpload.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Document/DocumentVectorSpace.tsx`

**plateform_front/src/components/Agents/Workflow/NodeModalContent/ModelSelector/**

- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/ModelSelector/ModelDetailHelpers.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/ModelSelector/ModelDetailPanel.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/ModelSelector/ModelListItem.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/ModelSelector/ModelListPanel.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/ModelSelector/ModelSelectorContent.tsx`

**plateform_front/src/components/Agents/Workflow/NodeModalContent/**

- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/NodeOverviewLayout.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/NodeSettingsEditor.tsx`

**plateform_front/src/components/Agents/Workflow/NodeModalContent/Query/**

- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Query/QueryAnimation.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Query/QueryNodeContent.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Query/QueryNodeOverviewTab.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Query/QueryPipeline.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Query/QueryScene.tsx`

**plateform_front/src/components/Agents/Workflow/NodeModalContent/ReRanker/**

- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/ReRanker/ReRankerAnimation.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/ReRanker/ReRankerNodeContent.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/ReRanker/ReRankerNodeOverviewTab.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/ReRanker/ReRankerRow.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/ReRanker/ReRankerScene.tsx`

**plateform_front/src/components/Agents/Workflow/NodeModalContent/Response/**

- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Response/ResponseAnimation.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Response/ResponseAnswer.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Response/ResponseNodeContent.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Response/ResponseNodeOverviewTab.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Response/ResponseNodeSettingsTab.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Response/ResponseScene.tsx`

**plateform_front/src/components/Agents/Workflow/NodeModalContent/Rewriter/**

- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Rewriter/RewriterAnimation.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Rewriter/RewriterNodeContent.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Rewriter/RewriterNodeOverviewTab.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Rewriter/RewriterParts.tsx`
- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/Rewriter/RewriterScene.tsx`

**plateform_front/src/components/Agents/Workflow/NodeModalContent/**

- [x] `plateform_front/src/components/Agents/Workflow/NodeModalContent/SettingPlaceholderContent.tsx`

**plateform_front/src/components/Assistant/**

- [x] `plateform_front/src/components/Assistant/AssistantChatLayout.tsx`
- [x] `plateform_front/src/components/Assistant/AssistantInput.tsx`
- [x] `plateform_front/src/components/Assistant/AssistantsTable.tsx`
- [x] `plateform_front/src/components/Assistant/ConversationSidebar.tsx`

**plateform_front/src/components/Assistant/Drawer/**

- [x] `plateform_front/src/components/Assistant/Drawer/QueryDetailsDrawer.tsx`
- [x] `plateform_front/src/components/Assistant/Drawer/QueryDetailsDrawerHeader.tsx`
- [x] `plateform_front/src/components/Assistant/Drawer/QueryDetailsTab.tsx`
- [x] `plateform_front/src/components/Assistant/Drawer/QuerySourcesTab.tsx`

**plateform_front/src/components/Assistant/**

- [x] `plateform_front/src/components/Assistant/HistoryLoadingSkeleton.tsx`
- [x] `plateform_front/src/components/Assistant/MessageItem.tsx`

**plateform_front/src/components/Auth/**

- [x] `plateform_front/src/components/Auth/AuthHeader.tsx`
- [x] `plateform_front/src/components/Auth/GoogleLoginButton.tsx`
- [x] `plateform_front/src/components/Auth/WelcomeScreen.tsx`

**plateform_front/src/components/Auth/welcome/**

- [x] `plateform_front/src/components/Auth/welcome/WelcomeStepper.tsx`

**plateform_front/src/components/Billing/**

- [x] `plateform_front/src/components/Billing/BuyCreditsSection.tsx`
- [x] `plateform_front/src/components/Billing/ChangePlanSection.tsx`
- [x] `plateform_front/src/components/Billing/ConsumptionCard.tsx`
- [x] `plateform_front/src/components/Billing/CreditsOrderSummary.tsx`
- [x] `plateform_front/src/components/Billing/PlanCard.tsx`
- [x] `plateform_front/src/components/Billing/PlanTierCard.tsx`

**plateform_front/src/components/Dashboard/**

- [x] `plateform_front/src/components/Dashboard/ActivityChart.tsx`

**plateform_front/src/components/Dashboard/ActivityChart/**

- [x] `plateform_front/src/components/Dashboard/ActivityChart/ActivityHeader.tsx`
- [x] `plateform_front/src/components/Dashboard/ActivityChart/ActivityLegend.tsx`

**plateform_front/src/components/Dashboard/**

- [x] `plateform_front/src/components/Dashboard/CardEmptyState.tsx`
- [x] `plateform_front/src/components/Dashboard/MetricBarChart.tsx`
- [x] `plateform_front/src/components/Dashboard/MetricCard.tsx`
- [x] `plateform_front/src/components/Dashboard/MetricCompositionPie.tsx`
- [x] `plateform_front/src/components/Dashboard/QuickActionCard.tsx`
- [x] `plateform_front/src/components/Dashboard/RecentActivityCard.tsx`

**plateform_front/src/components/Deployment/AccessControl/**

- [x] `plateform_front/src/components/Deployment/AccessControl/ApiKeysSection.tsx`
- [x] `plateform_front/src/components/Deployment/AccessControl/MembersSection.tsx`
- [x] `plateform_front/src/components/Deployment/AccessControl/VisibilitySection.tsx`

**plateform_front/src/components/Deployment/DashboardTab/**

- [x] `plateform_front/src/components/Deployment/DashboardTab/CreditSummaryCard.tsx`
- [x] `plateform_front/src/components/Deployment/DashboardTab/DeploymentBadge.tsx`

**plateform_front/src/components/Deployment/DashboardTab/HeaderCard/**

- [x] `plateform_front/src/components/Deployment/DashboardTab/HeaderCard/HeaderCard.tsx`
- [x] `plateform_front/src/components/Deployment/DashboardTab/HeaderCard/HeaderCardEmpty.tsx`
- [x] `plateform_front/src/components/Deployment/DashboardTab/HeaderCard/HeaderCardMain.tsx`

**plateform_front/src/components/Deployment/DashboardTab/**

- [x] `plateform_front/src/components/Deployment/DashboardTab/QuickLinksCard.tsx`
- [x] `plateform_front/src/components/Deployment/DashboardTab/RecentDeploymentsCard.tsx`

**plateform_front/src/components/Deployment/**

- [x] `plateform_front/src/components/Deployment/DeployModal.tsx`
- [x] `plateform_front/src/components/Deployment/DeploymentTabs.tsx`
- [x] `plateform_front/src/components/Deployment/ExportCard.tsx`
- [x] `plateform_front/src/components/Deployment/LiveDot.tsx`
- [x] `plateform_front/src/components/Deployment/PrivacyRow.tsx`
- [x] `plateform_front/src/components/Deployment/RegionCard.tsx`
- [x] `plateform_front/src/components/Deployment/SectionHeader.tsx`

**plateform_front/src/components/Deployment/Settings/**

- [x] `plateform_front/src/components/Deployment/Settings/DataPrivacy.tsx`
- [x] `plateform_front/src/components/Deployment/Settings/HostingRegion.tsx`
- [x] `plateform_front/src/components/Deployment/Settings/QueryLogsTable.tsx`
- [x] `plateform_front/src/components/Deployment/Settings/RGPDBanner.tsx`
- [x] `plateform_front/src/components/Deployment/Settings/UserRights.tsx`

**plateform_front/src/components/Deployment/**

- [x] `plateform_front/src/components/Deployment/VersionListItem.tsx`

**plateform_front/src/components/Deployment/VersionsHistory/**

- [x] `plateform_front/src/components/Deployment/VersionsHistory/PipelineJsonPanel.tsx`
- [x] `plateform_front/src/components/Deployment/VersionsHistory/VersionDetailPanel.tsx`
- [x] `plateform_front/src/components/Deployment/VersionsHistory/VersionHeaderActions.tsx`
- [x] `plateform_front/src/components/Deployment/VersionsHistory/VersionsSidebar.tsx`

**plateform_front/src/components/Document/**

- [x] `plateform_front/src/components/Document/DocumentEmptyState.tsx`

**plateform_front/src/components/Document/Drawer/**

- [x] `plateform_front/src/components/Document/Drawer/DocumentInfoGrid.tsx`
- [x] `plateform_front/src/components/Document/Drawer/DocumentPreview.tsx`
- [x] `plateform_front/src/components/Document/Drawer/KnowledgeBaseStatus.tsx`
- [x] `plateform_front/src/components/Document/Drawer/PreviewDrawer.tsx`
- [x] `plateform_front/src/components/Document/Drawer/PreviewDrawerHeader.tsx`

**plateform_front/src/components/Document/Header/**

- [x] `plateform_front/src/components/Document/Header/DocumentPageHeader.tsx`
- [x] `plateform_front/src/components/Document/Header/StorageOverviewPanel.tsx`

**plateform_front/src/components/Document/Modal/**

- [x] `plateform_front/src/components/Document/Modal/SelectedFilesList.tsx`
- [x] `plateform_front/src/components/Document/Modal/UploadModal.tsx`
- [x] `plateform_front/src/components/Document/Modal/UploadProgressList.tsx`

**plateform_front/src/components/Document/Table/**

- [x] `plateform_front/src/components/Document/Table/DocumentActionsMenu.tsx`
- [x] `plateform_front/src/components/Document/Table/DocumentCard.tsx`
- [x] `plateform_front/src/components/Document/Table/DocumentFilters.tsx`
- [x] `plateform_front/src/components/Document/Table/DocumentList.tsx`
- [x] `plateform_front/src/components/Document/Table/DocumentRow.tsx`
- [x] `plateform_front/src/components/Document/Table/DocumentSkeletonRow.tsx`
- [x] `plateform_front/src/components/Document/Table/DocumentTableHeader.tsx`

**plateform_front/src/components/Legal/**

- [x] `plateform_front/src/components/Legal/ContactCard.tsx`
- [x] `plateform_front/src/components/Legal/ContactForm.tsx`
- [x] `plateform_front/src/components/Legal/DocBulletList.tsx`
- [x] `plateform_front/src/components/Legal/DocInfoBox.tsx`
- [x] `plateform_front/src/components/Legal/DocPageHeader.tsx`
- [x] `plateform_front/src/components/Legal/DocSection.tsx`
- [x] `plateform_front/src/components/Legal/DocSectionRenderer.tsx`
- [x] `plateform_front/src/components/Legal/DocTable.tsx`
- [x] `plateform_front/src/components/Legal/LegalDocPage.tsx`

**plateform_front/src/components/Onboarding/CompareIntelligence/**

- [x] `plateform_front/src/components/Onboarding/CompareIntelligence/ResponseDetailPanel.tsx`

**plateform_front/src/components/Onboarding/ImproveAssistant/**

- [x] `plateform_front/src/components/Onboarding/ImproveAssistant/DocumentFileList.tsx`
- [x] `plateform_front/src/components/Onboarding/ImproveAssistant/UploadProgressStepper.tsx`

**plateform_front/src/components/Onboarding/**

- [x] `plateform_front/src/components/Onboarding/StepFooter.tsx`

**plateform_front/src/components/Onboarding/Stepper/**

- [x] `plateform_front/src/components/Onboarding/Stepper/OnboardingHeader.tsx`
- [x] `plateform_front/src/components/Onboarding/Stepper/OnboardingSidebar.tsx`
- [x] `plateform_front/src/components/Onboarding/Stepper/OnboardingStepper.tsx`

**plateform_front/src/components/charts/**

- [x] `plateform_front/src/components/charts/animation.ts`
- [x] `plateform_front/src/components/charts/area-chart-loading.tsx`
- [x] `plateform_front/src/components/charts/area-chart.tsx`
- [x] `plateform_front/src/components/charts/area-gradient-defs.tsx`
- [x] `plateform_front/src/components/charts/area.tsx`
- [x] `plateform_front/src/components/charts/background.tsx`
- [x] `plateform_front/src/components/charts/bar-chart-loading.tsx`
- [x] `plateform_front/src/components/charts/bar-chart.tsx`
- [x] `plateform_front/src/components/charts/bar-depth-geometry.ts`
- [x] `plateform_front/src/components/charts/bar-squares-layout.ts`
- [x] `plateform_front/src/components/charts/bar-squares.tsx`
- [x] `plateform_front/src/components/charts/bar-x-axis.tsx`
- [x] `plateform_front/src/components/charts/bar-y-axis.tsx`
- [x] `plateform_front/src/components/charts/bar.tsx`
- [x] `plateform_front/src/components/charts/chart-center-typography.ts`
- [x] `plateform_front/src/components/charts/chart-child-passthrough.ts`
- [x] `plateform_front/src/components/charts/chart-config-context.tsx`
- [x] `plateform_front/src/components/charts/chart-context.tsx`
- [x] `plateform_front/src/components/charts/chart-defs.ts`
- [x] `plateform_front/src/components/charts/chart-formatters.ts`
- [x] `plateform_front/src/components/charts/chart-legend-hover.tsx`
- [x] `plateform_front/src/components/charts/chart-loading-label.tsx`
- [x] `plateform_front/src/components/charts/chart-phase.ts`
- [x] `plateform_front/src/components/charts/chart-reveal-clip.tsx`
- [x] `plateform_front/src/components/charts/chart-scale.ts`
- [x] `plateform_front/src/components/charts/chart-stat-flow.tsx`
- [x] `plateform_front/src/components/charts/composed-chart.tsx`
- [x] `plateform_front/src/components/charts/dash-tail-stroke.tsx`
- [x] `plateform_front/src/components/charts/decimate-time-series.ts`
- [x] `plateform_front/src/components/charts/fade-edges.ts`
- [x] `plateform_front/src/components/charts/filter-data-by-x-domain.ts`
- [x] `plateform_front/src/components/charts/gauge-label-layout.tsx`
- [x] `plateform_front/src/components/charts/gauge.tsx`
- [x] `plateform_front/src/components/charts/generate-chart-skeleton-data.ts`
- [x] `plateform_front/src/components/charts/grid.tsx`

**plateform_front/src/components/charts/heatmap/**

- [x] `plateform_front/src/components/charts/heatmap/generate-heatmap-skeleton-data.ts`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-animation.ts`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-cells.tsx`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-chart-loading.tsx`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-chart.tsx`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-colors.ts`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-context.tsx`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-legend-gradient.tsx`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-legend-swatch.tsx`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-legend.tsx`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-pattern-defs.tsx`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-resolve-separator.ts`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-separator.tsx`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-tooltip.tsx`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-utils.ts`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-x-axis.tsx`
- [x] `plateform_front/src/components/charts/heatmap/heatmap-y-axis.tsx`
- [x] `plateform_front/src/components/charts/heatmap/index.ts`
- [x] `plateform_front/src/components/charts/heatmap/use-delayed-tooltip-data.ts`

**plateform_front/src/components/charts/**

- [x] `plateform_front/src/components/charts/highlight-segment-bounds.ts`
- [x] `plateform_front/src/components/charts/highlight-segment.tsx`
- [x] `plateform_front/src/components/charts/index.ts`
- [x] `plateform_front/src/components/charts/indicator-fade.ts`
- [x] `plateform_front/src/components/charts/line-chart-loading.tsx`
- [x] `plateform_front/src/components/charts/line-chart.tsx`
- [x] `plateform_front/src/components/charts/line-loading-pulse.tsx`
- [x] `plateform_front/src/components/charts/line-loading-timing.ts`
- [x] `plateform_front/src/components/charts/line-series-terminal-marker.tsx`
- [x] `plateform_front/src/components/charts/line.tsx`
- [x] `plateform_front/src/components/charts/loading-sweep.tsx`
- [x] `plateform_front/src/components/charts/motion-utils.ts`
- [x] `plateform_front/src/components/charts/notch-gauge-shared.ts`
- [x] `plateform_front/src/components/charts/path-stroke-utils.ts`
- [x] `plateform_front/src/components/charts/pattern-area.tsx`
- [x] `plateform_front/src/components/charts/pattern-preset.tsx`
- [x] `plateform_front/src/components/charts/pie-center-shell.tsx`
- [x] `plateform_front/src/components/charts/pie-center.tsx`
- [x] `plateform_front/src/components/charts/pie-chart.tsx`
- [x] `plateform_front/src/components/charts/pie-context.tsx`
- [x] `plateform_front/src/components/charts/pie-slice.tsx`
- [x] `plateform_front/src/components/charts/projection-config.ts`
- [x] `plateform_front/src/components/charts/projection-line-end-marker.tsx`
- [x] `plateform_front/src/components/charts/projection-line.tsx`
- [x] `plateform_front/src/components/charts/projection-utils.ts`
- [x] `plateform_front/src/components/charts/reference-area-config.ts`
- [x] `plateform_front/src/components/charts/reference-area-geometry.ts`
- [x] `plateform_front/src/components/charts/reference-area-registration-context.tsx`
- [x] `plateform_front/src/components/charts/series-bar-layout.ts`
- [x] `plateform_front/src/components/charts/series-bar.tsx`
- [x] `plateform_front/src/components/charts/series-dash-tail-overlay.tsx`
- [x] `plateform_front/src/components/charts/series-highlight-layer.tsx`
- [x] `plateform_front/src/components/charts/series-hover-dim.tsx`
- [x] `plateform_front/src/components/charts/series-markers.tsx`
- [x] `plateform_front/src/components/charts/series-path-utils.ts`
- [x] `plateform_front/src/components/charts/series-point-marker.tsx`
- [x] `plateform_front/src/components/charts/static-chart-preview-context.tsx`
- [x] `plateform_front/src/components/charts/time-series-chart-shell.tsx`

**plateform_front/src/components/charts/tooltip/**

- [x] `plateform_front/src/components/charts/tooltip/chart-tooltip.tsx`
- [x] `plateform_front/src/components/charts/tooltip/date-ticker.tsx`
- [x] `plateform_front/src/components/charts/tooltip/index.ts`
- [x] `plateform_front/src/components/charts/tooltip/tooltip-box.tsx`
- [x] `plateform_front/src/components/charts/tooltip/tooltip-content.tsx`
- [x] `plateform_front/src/components/charts/tooltip/tooltip-dot.tsx`
- [x] `plateform_front/src/components/charts/tooltip/tooltip-indicator.tsx`

**plateform_front/src/components/charts/**

- [x] `plateform_front/src/components/charts/use-animated-series-path.ts`
- [x] `plateform_front/src/components/charts/use-animated-y-domains.ts`
- [x] `plateform_front/src/components/charts/use-chart-interaction.ts`
- [x] `plateform_front/src/components/charts/use-chart-phase-orchestrator.ts`
- [x] `plateform_front/src/components/charts/use-enter-complete.ts`
- [x] `plateform_front/src/components/charts/use-grid-shimmer.ts`
- [x] `plateform_front/src/components/charts/use-highlight-segment.ts`
- [x] `plateform_front/src/components/charts/use-mount-progress.ts`
- [x] `plateform_front/src/components/charts/use-scheduled-tooltip.ts`
- [x] `plateform_front/src/components/charts/visx-pattern.tsx`
- [x] `plateform_front/src/components/charts/x-axis.tsx`
- [x] `plateform_front/src/components/charts/y-axis-scales.ts`
- [x] `plateform_front/src/components/charts/y-axis-ticks.ts`
- [x] `plateform_front/src/components/charts/y-axis.tsx`
- [x] `plateform_front/src/components/charts/y-domain-utils.ts`

**plateform_front/src/components/**

- [x] `plateform_front/src/components/shimmering-text.tsx`

**plateform_front/src/components/ui/**

- [x] `plateform_front/src/components/ui/ActionMenu.tsx`
- [x] `plateform_front/src/components/ui/AppLoader.tsx`
- [x] `plateform_front/src/components/ui/Banner.tsx`
- [x] `plateform_front/src/components/ui/BoxIcon.tsx`
- [x] `plateform_front/src/components/ui/Button.tsx`
- [x] `plateform_front/src/components/ui/CardHeader.tsx`
- [x] `plateform_front/src/components/ui/ChartHoverBridge.tsx`
- [x] `plateform_front/src/components/ui/CustomTooltip.tsx`
- [x] `plateform_front/src/components/ui/DangerZone.tsx`
- [x] `plateform_front/src/components/ui/DocumentStatusBadge.tsx`
- [x] `plateform_front/src/components/ui/Drawer.tsx`
- [x] `plateform_front/src/components/ui/FooterButtonsResponsive.tsx`

**plateform_front/src/components/ui/GlassNav/**

- [x] `plateform_front/src/components/ui/GlassNav/GlassNav.tsx`
- [x] `plateform_front/src/components/ui/GlassNav/GlassNavAppExample.tsx`
- [x] `plateform_front/src/components/ui/GlassNav/GlassNavItemButton.tsx`
- [x] `plateform_front/src/components/ui/GlassNav/GlassSurface.tsx`

**plateform_front/src/components/ui/GlassNav/icons/**

- [x] `plateform_front/src/components/ui/GlassNav/icons/ChatIcon.tsx`
- [x] `plateform_front/src/components/ui/GlassNav/icons/CreditCardIcon.tsx`
- [x] `plateform_front/src/components/ui/GlassNav/icons/DashboardIcon.tsx`
- [x] `plateform_front/src/components/ui/GlassNav/icons/DocumentIcon.tsx`
- [x] `plateform_front/src/components/ui/GlassNav/icons/FolderIcon.tsx`
- [x] `plateform_front/src/components/ui/GlassNav/icons/SparklesIcon.tsx`
- [x] `plateform_front/src/components/ui/GlassNav/icons/iconScaleVariants.ts`
- [x] `plateform_front/src/components/ui/GlassNav/icons/index.ts`
- [x] `plateform_front/src/components/ui/GlassNav/icons/types.ts`
- [x] `plateform_front/src/components/ui/GlassNav/icons/useIconAnimationState.ts`

**plateform_front/src/components/ui/GlassNav/**

- [x] `plateform_front/src/components/ui/GlassNav/index.ts`
- [x] `plateform_front/src/components/ui/GlassNav/navIconMap.ts`
- [x] `plateform_front/src/components/ui/GlassNav/useNavLayoutMode.ts`
- [x] `plateform_front/src/components/ui/GlassNav/utils.ts`

**plateform_front/src/components/ui/**

- [x] `plateform_front/src/components/ui/GlassTabBar.tsx`
- [x] `plateform_front/src/components/ui/ImpactBar.tsx`
- [x] `plateform_front/src/components/ui/KdbStyles.tsx`
- [x] `plateform_front/src/components/ui/MainLayoutContainer.tsx`
- [x] `plateform_front/src/components/ui/MenuDropDown.tsx`
- [x] `plateform_front/src/components/ui/MobileSidebarDrawer.tsx`
- [x] `plateform_front/src/components/ui/Modal.tsx`
- [x] `plateform_front/src/components/ui/MultiOptionButtons.tsx`
- [x] `plateform_front/src/components/ui/OnboardingStepBanner.tsx`
- [x] `plateform_front/src/components/ui/RadioButton.tsx`
- [x] `plateform_front/src/components/ui/RowContainer.tsx`
- [x] `plateform_front/src/components/ui/ShowHidePasswordInput.tsx`
- [x] `plateform_front/src/components/ui/TabBar.tsx`
- [x] `plateform_front/src/components/ui/UploadDropzone.tsx`
- [x] `plateform_front/src/components/ui/WorkspaceHeader.tsx`
- [x] `plateform_front/src/components/ui/bannerVariants.ts`

**plateform_front/src/components/ui/chat/**

- [x] `plateform_front/src/components/ui/chat/ChatHeader.tsx`
- [x] `plateform_front/src/components/ui/chat/ChatInput.tsx`
- [x] `plateform_front/src/components/ui/chat/ChatInterface.tsx`
- [x] `plateform_front/src/components/ui/chat/ChatMessageItem.tsx`
- [x] `plateform_front/src/components/ui/chat/ChatResponseBubble.tsx`
- [x] `plateform_front/src/components/ui/chat/SuggestedQuestions.tsx`
- [x] `plateform_front/src/components/ui/chat/ThinkingBubble.tsx`
- [x] `plateform_front/src/components/ui/chat/markdownStyles.ts`

**plateform_front/src/components/ui/demo/**

- [x] `plateform_front/src/components/ui/demo/DemoChatInput.tsx`
- [x] `plateform_front/src/components/ui/demo/DemoCountUp.tsx`
- [x] `plateform_front/src/components/ui/demo/DemoCursor.tsx`
- [x] `plateform_front/src/components/ui/demo/DemoStage.tsx`
- [x] `plateform_front/src/components/ui/demo/DemoWords.tsx`

**plateform_front/src/components/ui/workflow-preview/**

- [x] `plateform_front/src/components/ui/workflow-preview/WorkflowPreview.tsx`
- [x] `plateform_front/src/components/ui/workflow-preview/index.ts`

**plateform_front/src/constants/**

- [x] `plateform_front/src/constants/localStorage.ts`

**plateform_front/src/constants/models/**

- [x] `plateform_front/src/constants/models/modelBadges.ts`

**plateform_front/src/hooks/chat/**

- [x] `plateform_front/src/hooks/chat/index.ts`
- [x] `plateform_front/src/hooks/chat/types.ts`
- [x] `plateform_front/src/hooks/chat/useAgentQuery.ts`
- [x] `plateform_front/src/hooks/chat/useAssistantQuery.ts`
- [x] `plateform_front/src/hooks/chat/useChat.ts`
- [x] `plateform_front/src/hooks/chat/useSSEStream.ts`
- [x] `plateform_front/src/hooks/chat/useStreamQuery.ts`

**plateform_front/src/hooks/demo/**

- [x] `plateform_front/src/hooks/demo/useDemoScript.ts`

**plateform_front/src/hooks/deployment/**

- [x] `plateform_front/src/hooks/deployment/useGetEnv.ts`

**plateform_front/src/hooks/onboarding/**

- [x] `plateform_front/src/hooks/onboarding/useOnboarding.ts`

**plateform_front/src/hooks/sidebar/**

- [x] `plateform_front/src/hooks/sidebar/useActiveSidebarItem.ts`

**plateform_front/src/hooks/**

- [x] `plateform_front/src/hooks/useActiveSection.ts`
- [x] `plateform_front/src/hooks/useAppResponsive.ts`
- [x] `plateform_front/src/hooks/useAuthStepConfig.ts`
- [x] `plateform_front/src/hooks/useAuthentification.ts`
- [x] `plateform_front/src/hooks/useCommandPaletteKeyboard.ts`
- [x] `plateform_front/src/hooks/useCopyToClipboard.ts`
- [x] `plateform_front/src/hooks/useDownloadFile.ts`
- [x] `plateform_front/src/hooks/useDragDrop.ts`
- [x] `plateform_front/src/hooks/useDynamicPlaceholder.ts`
- [x] `plateform_front/src/hooks/useGroupedConversations.ts`
- [x] `plateform_front/src/hooks/useIncompleteNodesGuard.tsx`
- [x] `plateform_front/src/hooks/useIsDark.ts`
- [x] `plateform_front/src/hooks/useThemedToast.tsx`
- [x] `plateform_front/src/hooks/useUnsavedChangesBlocker.ts`
- [x] `plateform_front/src/hooks/useUploadDocuments.ts`
- [x] `plateform_front/src/hooks/useUserInfo.ts`

**plateform_front/src/**

- [x] `plateform_front/src/index.css`
- [x] `plateform_front/src/index.tsx`

**plateform_front/src/lib/**

- [x] `plateform_front/src/lib/mixpanel.ts`
- [x] `plateform_front/src/lib/utils.ts`

**plateform_front/src/pages/Agents/AccessControl/**

- [x] `plateform_front/src/pages/Agents/AccessControl/index.tsx`

**plateform_front/src/pages/Agents/Analytics/**

- [x] `plateform_front/src/pages/Agents/Analytics/index.tsx`

**plateform_front/src/pages/Agents/Chat/**

- [x] `plateform_front/src/pages/Agents/Chat/index.tsx`

**plateform_front/src/pages/Agents/Deployment/**

- [x] `plateform_front/src/pages/Agents/Deployment/AccessControl.tsx`
- [x] `plateform_front/src/pages/Agents/Deployment/DashboardTab.tsx`
- [x] `plateform_front/src/pages/Agents/Deployment/Settings.tsx`
- [x] `plateform_front/src/pages/Agents/Deployment/VersionsHistory.tsx`
- [x] `plateform_front/src/pages/Agents/Deployment/data.ts`
- [x] `plateform_front/src/pages/Agents/Deployment/index.tsx`

**plateform_front/src/pages/Agents/Documents/**

- [x] `plateform_front/src/pages/Agents/Documents/index.tsx`

**plateform_front/src/pages/Agents/Settings/**

- [x] `plateform_front/src/pages/Agents/Settings/index.tsx`

**plateform_front/src/pages/Agents/Workflow/**

- [x] `plateform_front/src/pages/Agents/Workflow/CustomControls.tsx`
- [x] `plateform_front/src/pages/Agents/Workflow/MenuNodeCard.tsx`
- [x] `plateform_front/src/pages/Agents/Workflow/MenuNodeModal.tsx`
- [x] `plateform_front/src/pages/Agents/Workflow/NodeModal.tsx`
- [x] `plateform_front/src/pages/Agents/Workflow/index.tsx`

**plateform_front/src/pages/Agents/**

- [x] `plateform_front/src/pages/Agents/index.tsx`

**plateform_front/src/pages/Assistant/**

- [x] `plateform_front/src/pages/Assistant/Assistant.tsx`
- [x] `plateform_front/src/pages/Assistant/AssistantHome.tsx`
- [x] `plateform_front/src/pages/Assistant/AssistantList.tsx`

**plateform_front/src/pages/Auth/Layout/**

- [x] `plateform_front/src/pages/Auth/Layout/AuthDesktopLayout.tsx`
- [x] `plateform_front/src/pages/Auth/Layout/AuthLayout.tsx`
- [x] `plateform_front/src/pages/Auth/Layout/AuthLayoutContext.tsx`
- [x] `plateform_front/src/pages/Auth/Layout/AuthMobileLayout.tsx`

**plateform_front/src/pages/Auth/Login/**

- [x] `plateform_front/src/pages/Auth/Login/EmailForm.tsx`
- [x] `plateform_front/src/pages/Auth/Login/LoginForm.tsx`
- [x] `plateform_front/src/pages/Auth/Login/PasswordForm.tsx`
- [x] `plateform_front/src/pages/Auth/Login/index.tsx`

**plateform_front/src/pages/Auth/Password/**

- [x] `plateform_front/src/pages/Auth/Password/ApplyResetPassword.tsx`
- [x] `plateform_front/src/pages/Auth/Password/ResetPassword.tsx`
- [x] `plateform_front/src/pages/Auth/Password/index.tsx`

**plateform_front/src/pages/Auth/Register/**

- [x] `plateform_front/src/pages/Auth/Register/CreateAccountForm.tsx`
- [x] `plateform_front/src/pages/Auth/Register/Register.tsx`
- [x] `plateform_front/src/pages/Auth/Register/index.tsx`

**plateform_front/src/pages/Auth/Validate/**

- [x] `plateform_front/src/pages/Auth/Validate/ValidateAccountForm.tsx`
- [x] `plateform_front/src/pages/Auth/Validate/index.tsx`

**plateform_front/src/pages/Billing/**

- [x] `plateform_front/src/pages/Billing/index.tsx`

**plateform_front/src/pages/Dashboard/**

- [x] `plateform_front/src/pages/Dashboard/DashboardHeader.tsx`
- [x] `plateform_front/src/pages/Dashboard/data.ts`
- [x] `plateform_front/src/pages/Dashboard/index.tsx`

**plateform_front/src/pages/Legal/**

- [x] `plateform_front/src/pages/Legal/ContactPage.tsx`
- [x] `plateform_front/src/pages/Legal/NoticesPage.tsx`
- [x] `plateform_front/src/pages/Legal/PrivacyPage.tsx`
- [x] `plateform_front/src/pages/Legal/TermsPage.tsx`

**plateform_front/src/pages/Legal/data/**

- [x] `plateform_front/src/pages/Legal/data/legalNav.ts`
- [x] `plateform_front/src/pages/Legal/data/notices.ts`
- [x] `plateform_front/src/pages/Legal/data/privacy.ts`
- [x] `plateform_front/src/pages/Legal/data/terms.ts`
- [x] `plateform_front/src/pages/Legal/data/types.ts`

**plateform_front/src/pages/Legal/**

- [x] `plateform_front/src/pages/Legal/index.tsx`

**plateform_front/src/pages/NotFound/**

- [x] `plateform_front/src/pages/NotFound/index.tsx`

**plateform_front/src/pages/Onboarding/**

- [x] `plateform_front/src/pages/Onboarding/OnBoarding.tsx`
- [x] `plateform_front/src/pages/Onboarding/OnBoardingProvider.tsx`
- [x] `plateform_front/src/pages/Onboarding/OnboardingSessionError.tsx`
- [x] `plateform_front/src/pages/Onboarding/onboardingAnimations.css`

**plateform_front/src/pages/Onboarding/steps/**

- [x] `plateform_front/src/pages/Onboarding/steps/CompareIntelligenceStep.tsx`
- [x] `plateform_front/src/pages/Onboarding/steps/ImproveAssistantStep.tsx`
- [x] `plateform_front/src/pages/Onboarding/steps/StepConfig.ts`
- [x] `plateform_front/src/pages/Onboarding/steps/TestAssistantStep.tsx`
- [x] `plateform_front/src/pages/Onboarding/steps/compareIntelligenceCards.ts`

**plateform_front/src/pages/Onboarding/**

- [x] `plateform_front/src/pages/Onboarding/useOnboardingState.ts`

**plateform_front/src/pages/Profile/**

- [x] `plateform_front/src/pages/Profile/ProfileHero.tsx`
- [x] `plateform_front/src/pages/Profile/ProfileSidebar.tsx`
- [x] `plateform_front/src/pages/Profile/index.tsx`

**plateform_front/src/pages/Profile/sections/**

- [x] `plateform_front/src/pages/Profile/sections/AppearanceSection.tsx`
- [x] `plateform_front/src/pages/Profile/sections/PersonalInfoSection.tsx`
- [x] `plateform_front/src/pages/Profile/sections/ProfileSelectField.tsx`
- [x] `plateform_front/src/pages/Profile/sections/SecuritySection.tsx`

**plateform_front/src/**

- [x] `plateform_front/src/react-app-env.d.ts`
- [x] `plateform_front/src/reportWebVitals.ts`

**plateform_front/src/services/agent/**

- [x] `plateform_front/src/services/agent/agent.ts`
- [x] `plateform_front/src/services/agent/agentMembers.ts`

**plateform_front/src/services/agentRuntime/**

- [x] `plateform_front/src/services/agentRuntime/agentRuntime.ts`

**plateform_front/src/services/analytics/**

- [x] `plateform_front/src/services/analytics/analytics.ts`

**plateform_front/src/services/**

- [x] `plateform_front/src/services/api.ts`

**plateform_front/src/services/auth/**

- [x] `plateform_front/src/services/auth/auth.ts`

**plateform_front/src/services/billing/**

- [x] `plateform_front/src/services/billing/billing.ts`

**plateform_front/src/services/chat/**

- [x] `plateform_front/src/services/chat/chat.ts`

**plateform_front/src/services/credit/**

- [x] `plateform_front/src/services/credit/credit.ts`

**plateform_front/src/services/deployment/**

- [x] `plateform_front/src/services/deployment/deployment.ts`

**plateform_front/src/services/document/**

- [x] `plateform_front/src/services/document/document.ts`

**plateform_front/src/services/models/**

- [x] `plateform_front/src/services/models/models.ts`

**plateform_front/src/services/onboarding/**

- [x] `plateform_front/src/services/onboarding/onboarding.ts`

**plateform_front/src/services/tags/**

- [x] `plateform_front/src/services/tags/tag.ts`

**plateform_front/src/services/workflow/**

- [x] `plateform_front/src/services/workflow/workflow.ts`

**plateform_front/src/services/workspace/**

- [x] `plateform_front/src/services/workspace/workspace.ts`

**plateform_front/src/**

- [x] `plateform_front/src/setupTests.ts`

**plateform_front/src/store/**

- [x] `plateform_front/src/store/index.ts`
- [x] `plateform_front/src/store/navigationSlice.ts`
- [x] `plateform_front/src/store/reduxProvider.tsx`

**plateform_front/src/**

- [x] `plateform_front/src/tailwind.src.css`

**plateform_front/src/themeNew/components/**

- [x] `plateform_front/src/themeNew/components/accordion.ts`
- [x] `plateform_front/src/themeNew/components/badge.ts`
- [x] `plateform_front/src/themeNew/components/button.ts`
- [x] `plateform_front/src/themeNew/components/card.ts`
- [x] `plateform_front/src/themeNew/components/checkbox.ts`
- [x] `plateform_front/src/themeNew/components/divider.ts`
- [x] `plateform_front/src/themeNew/components/drawer.ts`
- [x] `plateform_front/src/themeNew/components/form-error-message.ts`
- [x] `plateform_front/src/themeNew/components/form-label.ts`
- [x] `plateform_front/src/themeNew/components/form.ts`
- [x] `plateform_front/src/themeNew/components/input.ts`
- [x] `plateform_front/src/themeNew/components/menu.ts`
- [x] `plateform_front/src/themeNew/components/modal.ts`
- [x] `plateform_front/src/themeNew/components/pin-input.ts`
- [x] `plateform_front/src/themeNew/components/popover.ts`
- [x] `plateform_front/src/themeNew/components/progress.ts`
- [x] `plateform_front/src/themeNew/components/radio.ts`
- [x] `plateform_front/src/themeNew/components/skeleton.ts`
- [x] `plateform_front/src/themeNew/components/slider.ts`
- [x] `plateform_front/src/themeNew/components/stepper.ts`
- [x] `plateform_front/src/themeNew/components/switch.ts`
- [x] `plateform_front/src/themeNew/components/table.ts`
- [x] `plateform_front/src/themeNew/components/tabs.ts`
- [x] `plateform_front/src/themeNew/components/textarea.ts`

**plateform_front/src/themeNew/foundations/**

- [x] `plateform_front/src/themeNew/foundations/blur.ts`
- [x] `plateform_front/src/themeNew/foundations/borderRadius.ts`
- [x] `plateform_front/src/themeNew/foundations/borderWidth.ts`
- [x] `plateform_front/src/themeNew/foundations/colorTokens.ts`
- [x] `plateform_front/src/themeNew/foundations/colors.ts`
- [x] `plateform_front/src/themeNew/foundations/fonts.ts`
- [x] `plateform_front/src/themeNew/foundations/heading.ts`
- [x] `plateform_front/src/themeNew/foundations/shadow.ts`
- [x] `plateform_front/src/themeNew/foundations/spacing.ts`
- [x] `plateform_front/src/themeNew/foundations/text.ts`
- [x] `plateform_front/src/themeNew/foundations/themeConfig.ts`
- [x] `plateform_front/src/themeNew/foundations/typography.ts`

**plateform_front/src/themeNew/**

- [x] `plateform_front/src/themeNew/index.scss`
- [x] `plateform_front/src/themeNew/index.ts`
- [x] `plateform_front/src/themeNew/scrollbar.ts`

**plateform_front/src/types/agent/**

- [x] `plateform_front/src/types/agent/agent.ts`

**plateform_front/src/types/analytics/**

- [x] `plateform_front/src/types/analytics/analytics.ts`

**plateform_front/src/types/assistant/**

- [x] `plateform_front/src/types/assistant/assistant.ts`

**plateform_front/src/types/chat/**

- [x] `plateform_front/src/types/chat/chat.ts`

**plateform_front/src/types/credit/**

- [x] `plateform_front/src/types/credit/credit.ts`

**plateform_front/src/types/deployment/**

- [x] `plateform_front/src/types/deployment/deployment.ts`

**plateform_front/src/types/document/**

- [x] `plateform_front/src/types/document/document.ts`

**plateform_front/src/types/models/**

- [x] `plateform_front/src/types/models/models.ts`

**plateform_front/src/types/onboarding/**

- [x] `plateform_front/src/types/onboarding/onboarding.ts`

**plateform_front/src/types/**

- [x] `plateform_front/src/types/user.ts`
- [x] `plateform_front/src/types/utils.ts`

**plateform_front/src/types/workflow/**

- [x] `plateform_front/src/types/workflow/workflow.ts`

**plateform_front/src/types/**

- [x] `plateform_front/src/types/workspace.ts`

**plateform_front/src/utils/**

- [x] `plateform_front/src/utils/agentAvatar.ts`

**plateform_front/src/utils/analytics/**

- [x] `plateform_front/src/utils/analytics/costUtils.ts`
- [x] `plateform_front/src/utils/analytics/dateUtils.ts`
- [x] `plateform_front/src/utils/analytics/heatmapUtils.ts`

**plateform_front/src/utils/**

- [x] `plateform_front/src/utils/apiError.ts`
- [x] `plateform_front/src/utils/date.ts`
- [x] `plateform_front/src/utils/documentFormatters.ts`
- [x] `plateform_front/src/utils/isNotNone.ts`

**plateform_front/src/utils/models/**

- [x] `plateform_front/src/utils/models/modelFormatters.ts`

**plateform_front/src/utils/**

- [x] `plateform_front/src/utils/standaloneToast.ts`
- [x] `plateform_front/src/utils/validateEmail.ts`

**plateform_front/**

- [x] `plateform_front/tsconfig.json`
- [x] `plateform_front/vercel.json`

### Périmètre `packages/workflow` (61 fichiers)


**packages/workflow/**

- [ ] `packages/workflow/.gitignore`
- [ ] `packages/workflow/CLAUDE.md`
- [ ] `packages/workflow/index.d.ts`
- [ ] `packages/workflow/package.json`

**packages/workflow/src/**

- [ ] `packages/workflow/src/components.ts`

**packages/workflow/src/components/**

- [ ] `packages/workflow/src/components/BoxIcon.tsx`
- [ ] `packages/workflow/src/components/WorkflowCanvas.tsx`

**packages/workflow/src/components/edges/**

- [ ] `packages/workflow/src/components/edges/GenEdge.tsx`
- [ ] `packages/workflow/src/components/edges/SettingsEdge.tsx`
- [ ] `packages/workflow/src/components/edges/edge-animations.css`
- [ ] `packages/workflow/src/components/edges/index.ts`

**packages/workflow/src/components/**

- [ ] `packages/workflow/src/components/index.ts`

**packages/workflow/src/components/nodes/**

- [ ] `packages/workflow/src/components/nodes/Common.tsx`
- [ ] `packages/workflow/src/components/nodes/NodeCard.tsx`
- [ ] `packages/workflow/src/components/nodes/NodeComponent.tsx`
- [ ] `packages/workflow/src/components/nodes/NodeHeader.tsx`
- [ ] `packages/workflow/src/components/nodes/NodeInputs.tsx`
- [ ] `packages/workflow/src/components/nodes/NodeOutputs.tsx`
- [ ] `packages/workflow/src/components/nodes/NodeShape.tsx`

**packages/workflow/src/components/nodes/SettingNodes/**

- [ ] `packages/workflow/src/components/nodes/SettingNodes/InstructionNode.tsx`
- [ ] `packages/workflow/src/components/nodes/SettingNodes/ModelNode.tsx`

**packages/workflow/src/components/nodes/**

- [ ] `packages/workflow/src/components/nodes/index.ts`

**packages/workflow/src/**

- [ ] `packages/workflow/src/edges.ts`
- [ ] `packages/workflow/src/graph.ts`

**packages/workflow/src/graph/**

- [ ] `packages/workflow/src/graph/create-flow-node.ts`
- [ ] `packages/workflow/src/graph/index.ts`
- [ ] `packages/workflow/src/graph/task-utils.ts`

**packages/workflow/src/graph/task/**

- [ ] `packages/workflow/src/graph/task/add-database.tsx`
- [ ] `packages/workflow/src/graph/task/add-instruction.tsx`
- [ ] `packages/workflow/src/graph/task/add-model.tsx`
- [ ] `packages/workflow/src/graph/task/add-query.tsx`
- [ ] `packages/workflow/src/graph/task/add-reranking.tsx`
- [ ] `packages/workflow/src/graph/task/add-response.tsx`
- [ ] `packages/workflow/src/graph/task/add-rewriter.tsx`
- [ ] `packages/workflow/src/graph/task/registry.tsx`

**packages/workflow/src/**

- [ ] `packages/workflow/src/hooks.ts`

**packages/workflow/src/hooks/**

- [ ] `packages/workflow/src/hooks/index.ts`
- [ ] `packages/workflow/src/hooks/useAppResponsive.ts`
- [ ] `packages/workflow/src/hooks/useCenterNodePosition.ts`
- [ ] `packages/workflow/src/hooks/useFixNodePosition.tsx`
- [ ] `packages/workflow/src/hooks/useFlowTypes.tsx`
- [ ] `packages/workflow/src/hooks/useNodeInformation.ts`
- [ ] `packages/workflow/src/hooks/useNodeSelection.ts`
- [ ] `packages/workflow/src/hooks/useWorkflowCanvas.ts`
- [ ] `packages/workflow/src/hooks/useWorkflowNodes.ts`

**packages/workflow/src/**

- [ ] `packages/workflow/src/index.ts`

**packages/workflow/src/layout/**

- [ ] `packages/workflow/src/layout/dagre.ts`
- [ ] `packages/workflow/src/layout/horizontal.ts`
- [ ] `packages/workflow/src/layout/index.ts`
- [ ] `packages/workflow/src/layout/types.ts`
- [ ] `packages/workflow/src/layout/vertical.ts`

**packages/workflow/src/**

- [ ] `packages/workflow/src/nodes.ts`
- [ ] `packages/workflow/src/types.ts`

**packages/workflow/src/types/**

- [ ] `packages/workflow/src/types/app-node.ts`
- [ ] `packages/workflow/src/types/edge.ts`
- [ ] `packages/workflow/src/types/index.ts`
- [ ] `packages/workflow/src/types/model-option.ts`
- [ ] `packages/workflow/src/types/task.ts`

**packages/workflow/src/utils/**

- [ ] `packages/workflow/src/utils/sanitize.ts`
- [ ] `packages/workflow/src/utils/serialize.ts`

**packages/workflow/**

- [ ] `packages/workflow/tsconfig.json`

### Périmètre `vitrine_front` (102 fichiers)


**vitrine_front/**

- [ ] `vitrine_front/.env.example`
- [ ] `vitrine_front/.gitignore`
- [ ] `vitrine_front/.prettierrc`
- [ ] `vitrine_front/CLAUDE.md`
- [ ] `vitrine_front/README.md`

**vitrine_front/_archive/**

- [ ] `vitrine_front/_archive/.gitignore`
- [ ] `vitrine_front/_archive/Dockerfile`
- [ ] `vitrine_front/_archive/README.md`

**vitrine_front/_archive/app/**

- [ ] `vitrine_front/_archive/app/globals.css`
- [ ] `vitrine_front/_archive/app/layout.tsx`
- [ ] `vitrine_front/_archive/app/page.tsx`
- [ ] `vitrine_front/_archive/app/providers.tsx`

**vitrine_front/_archive/**

- [ ] `vitrine_front/_archive/components.json`

**vitrine_front/_archive/components/**

- [ ] `vitrine_front/_archive/components/ChatSimulationPanel.tsx`
- [ ] `vitrine_front/_archive/components/FeaturesBentoSection.tsx`
- [ ] `vitrine_front/_archive/components/ModelCompatibilityStrip.tsx`
- [ ] `vitrine_front/_archive/components/SiteFooter.tsx`
- [ ] `vitrine_front/_archive/components/WorkflowPackagePreview.tsx`

**vitrine_front/_archive/components/ui/**

- [ ] `vitrine_front/_archive/components/ui/animatedGradiantBorder.tsx`
- [ ] `vitrine_front/_archive/components/ui/animatedSplineBorder.tsx`
- [ ] `vitrine_front/_archive/components/ui/input.tsx`
- [ ] `vitrine_front/_archive/components/ui/label.tsx`

**vitrine_front/_archive/**

- [ ] `vitrine_front/_archive/eslint.config.mjs`

**vitrine_front/_archive/lib/**

- [ ] `vitrine_front/_archive/lib/utils.ts`

**vitrine_front/_archive/**

- [ ] `vitrine_front/_archive/next.config.ts`
- [ ] `vitrine_front/_archive/package.json`
- [ ] `vitrine_front/_archive/postcss.config.mjs`
- [ ] `vitrine_front/_archive/tsconfig.json`

**vitrine_front/**

- [ ] `vitrine_front/eslint.config.js`
- [ ] `vitrine_front/index.html`
- [ ] `vitrine_front/package.json`

**vitrine_front/public/**

- [ ] `vitrine_front/public/robots.txt`

**vitrine_front/scripts/**

- [ ] `vitrine_front/scripts/shots.mjs`

**vitrine_front/src/**

- [ ] `vitrine_front/src/App.tsx`

**vitrine_front/src/components/**

- [ ] `vitrine_front/src/components/Chrome.module.css`
- [ ] `vitrine_front/src/components/Chrome.tsx`
- [ ] `vitrine_front/src/components/DemoCursor.module.css`
- [ ] `vitrine_front/src/components/DemoCursor.tsx`
- [ ] `vitrine_front/src/components/Logo.tsx`
- [ ] `vitrine_front/src/components/Panel.module.css`
- [ ] `vitrine_front/src/components/Panel.tsx`
- [ ] `vitrine_front/src/components/icoFaces.ts`
- [ ] `vitrine_front/src/components/reveal.ts`
- [ ] `vitrine_front/src/components/ui.module.css`
- [ ] `vitrine_front/src/components/ui.tsx`

**vitrine_front/src/**

- [ ] `vitrine_front/src/content.ts`
- [ ] `vitrine_front/src/main.tsx`

**vitrine_front/src/mockups/**

- [ ] `vitrine_front/src/mockups/AppSidebar.module.css`
- [ ] `vitrine_front/src/mockups/AppSidebar.tsx`
- [ ] `vitrine_front/src/mockups/BuilderCanvas.module.css`
- [ ] `vitrine_front/src/mockups/BuilderCanvas.tsx`
- [ ] `vitrine_front/src/mockups/builderGraph.ts`

**vitrine_front/src/motion/**

- [ ] `vitrine_front/src/motion/MotionContext.tsx`
- [ ] `vitrine_front/src/motion/reduced.ts`
- [ ] `vitrine_front/src/motion/scrubs.ts`
- [ ] `vitrine_front/src/motion/stage.ts`
- [ ] `vitrine_front/src/motion/store.ts`

**vitrine_front/src/sections/**

- [ ] `vitrine_front/src/sections/Analytics.module.css`
- [ ] `vitrine_front/src/sections/Analytics.tsx`
- [ ] `vitrine_front/src/sections/Assistants.module.css`
- [ ] `vitrine_front/src/sections/Assistants.tsx`
- [ ] `vitrine_front/src/sections/Builder.module.css`
- [ ] `vitrine_front/src/sections/Builder.tsx`
- [ ] `vitrine_front/src/sections/Connectors.module.css`
- [ ] `vitrine_front/src/sections/Connectors.tsx`
- [ ] `vitrine_front/src/sections/Contact.module.css`
- [ ] `vitrine_front/src/sections/Contact.tsx`
- [ ] `vitrine_front/src/sections/Footer.module.css`
- [ ] `vitrine_front/src/sections/Footer.tsx`
- [ ] `vitrine_front/src/sections/Hero.module.css`
- [ ] `vitrine_front/src/sections/Hero.tsx`
- [ ] `vitrine_front/src/sections/Problem.module.css`
- [ ] `vitrine_front/src/sections/Problem.tsx`
- [ ] `vitrine_front/src/sections/Share.module.css`
- [ ] `vitrine_front/src/sections/Share.tsx`
- [ ] `vitrine_front/src/sections/Steps.module.css`
- [ ] `vitrine_front/src/sections/Steps.tsx`
- [ ] `vitrine_front/src/sections/Why.module.css`
- [ ] `vitrine_front/src/sections/Why.tsx`

**vitrine_front/src/sections/builder/**

- [ ] `vitrine_front/src/sections/builder/BlockOverview.module.css`
- [ ] `vitrine_front/src/sections/builder/BlockOverview.tsx`
- [ ] `vitrine_front/src/sections/builder/ModelPicker.module.css`
- [ ] `vitrine_front/src/sections/builder/ModelPicker.tsx`
- [ ] `vitrine_front/src/sections/builder/NodePalette.module.css`
- [ ] `vitrine_front/src/sections/builder/NodePalette.tsx`
- [ ] `vitrine_front/src/sections/builder/NodePanel.module.css`
- [ ] `vitrine_front/src/sections/builder/NodePanel.tsx`
- [ ] `vitrine_front/src/sections/builder/useBuilderDemo.ts`

**vitrine_front/src/sections/connectors/**

- [ ] `vitrine_front/src/sections/connectors/useConnectorDemo.ts`

**vitrine_front/src/sections/hero/**

- [ ] `vitrine_front/src/sections/hero/Ingestion.module.css`
- [ ] `vitrine_front/src/sections/hero/Ingestion.tsx`

**vitrine_front/src/sections/share/**

- [ ] `vitrine_front/src/sections/share/ShareBrowser.module.css`
- [ ] `vitrine_front/src/sections/share/ShareBrowser.tsx`
- [ ] `vitrine_front/src/sections/share/useShareDemo.ts`

**vitrine_front/src/sections/**

- [ ] `vitrine_front/src/sections/useTypewriter.ts`

**vitrine_front/src/styles/**

- [ ] `vitrine_front/src/styles/global.css`
- [ ] `vitrine_front/src/styles/tokens.css`

**vitrine_front/src/**

- [ ] `vitrine_front/src/vite-env.d.ts`

**vitrine_front/**

- [ ] `vitrine_front/tsconfig.app.json`
- [ ] `vitrine_front/tsconfig.json`
- [ ] `vitrine_front/tsconfig.node.json`
- [ ] `vitrine_front/vite.config.ts`



### Périmètre `racine (monorepo)` (24 fichiers)


**.claude/commands/**

- [ ] `.claude/commands/maj-claude-md.md`

**.github/workflows/**

- [ ] `.github/workflows/jobs.yml`

**./**

- [ ] `.gitignore`
- [ ] `.gitmodules`

**.vscode/**

- [ ] `.vscode/settings.json`

**./**

- [ ] `CLAUDE.md`
- [ ] `README.md`

**architecture/**

- [ ] `architecture/agent-runtime-architecture-proposal.mmd`
- [ ] `architecture/agent-runtime-flow.mmd`
- [ ] `architecture/backend.mmd`
- [ ] `architecture/document-flow.mmd`

**./**

- [ ] `docker-compose.yml`

**docs/**

- [ ] `docs/beta_test_plan.md`
- [ ] `docs/demande_infrastructure_ecole.md`
- [ ] `docs/financial_strategy.md`

**docs/greenlight-review/**

- [ ] `docs/greenlight-review/beta_test_plan.md`

**docs/**

- [ ] `docs/lean_canvas.md`
- [ ] `docs/prompt_refacto_doc.md`
- [ ] `docs/theme-audit-report.md`

**./**

- [ ] `package.json`

**scripts/**

- [ ] `scripts/dev.sh`
- [ ] `scripts/migrate.sh`
- [ ] `scripts/start.sh`

**./**

- [ ] `vercel.json`
