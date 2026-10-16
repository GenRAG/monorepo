# Interrogate — Reviewer B (data-side first)

Scope: `origin/dev` @ 904c1d3, `plateform_back/` (+ `rag-engine/` copy and `packages/workflow/src/utils/serialize.ts` for the blocks contract). Read-only. I started from the Prisma schema and migrations, then credits and usage, the RAG pipeline and streaming, documents and datasets, then auth and guards. Issues that AUDIT_REPORT.md lists as still open are cited by ID. Issues it lists as fixed are not reported again.

## Findings

### 1. [critical] The dataset migration cannot run on the production database; the container will crash-loop or documents will be lost
**Location**: `plateform_back/prisma/schema/migrations/20261005224546_add_dataset_model/migration.sql:19-20`, `plateform_back/Dockerfile` (`CMD npx prisma migrate deploy && yarn start:prod`)
**Finding**: The migration drops `Document.agentId` and adds `"datasetId" TEXT NOT NULL` with no default and no backfill. Prisma's own warning in the file says so: "This is not possible if the table is not empty". There is no data step that creates one `Dataset` per agent, moves the documents into it and links it through `AgentDataset`.
**Evidence**: `origin/main` (d7f34d1) still has `Document.agentId` (`git show origin/main:plateform_back/prisma/schema/document.prisma:11`). Its last migration is `20260907194858`. So the next deploy of `dev` runs this migration against a `Document` table that holds the beta customers' rows. `ALTER TABLE ... ADD COLUMN ... NOT NULL` fails on a non-empty table. The Dockerfile runs `migrate deploy` before `start:prod`, so the server never boots. The only manual way past it is to empty `Document`, which loses every customer document record. Even with a hand-written backfill, the vectors already in the engine were indexed under `org_id = agentId` (the old indexing path). The new path indexes and searches by `datasetId` (`index-document.handler.ts:29`, `dataset.service.ts:146-159`). The old vectors become unreachable and are never deleted.
**Suggestion**: Split it into an expand/backfill/contract sequence. Add `datasetId` as nullable. In SQL, create one dataset per agent that has documents, link it with `AgentDataset` and set `Document.datasetId`. Then set the column `NOT NULL` and drop `agentId`. Plan a re-index job (or an engine-side relabel of `org_id`) for the existing vectors. Test the migration against a copy of the `main` schema that has rows in it.

### 2. [critical] Onboarding bonus credits can be minted without limit by deleting the demo agent
**Location**: `src/onboarding/onboarding.service.ts:194-195,230-236`, `prisma/schema/onboarding.prisma` (`agentId @unique`, `agent ... onDelete: Cascade`), `src/agent/agent.controller.ts:47-51`
**Finding**: Whether the bonus is granted is decided by `countByWorkspace(workspaceId) === 0`. That counts `OnboardingSession` rows. A session row is deleted in cascade with its demo agent, and any workspace member can delete the agent.
**Evidence**: The loop is:
1. `POST /workspaces/:ws/onboarding/start` creates the demo agent and session and grants +20 credits.
2. `DELETE /workspaces/:ws/agents/:demoAgentId` deletes the agent. The `OnboardingSession` goes with it through `onDelete: Cascade`.
3. `start` runs again. `findByUserAndWorkspace` returns null and `countByWorkspace` returns 0, so it grants +20 again.

Each round also creates a new "Documents de démonstration" dataset (`:227`) that is never removed, and resets the per-step onboarding query quotas. Nothing else limits this: no throttling on `start`, and no check of existing `CreditTransaction` rows.
**Suggestion**: Base eligibility on durable state the user cannot delete. Either check for an existing `CreditTransaction` with `metadata.source = 'onboarding_bonus'` for the workspace, inside the same transaction as the grant, or add a `Workspace.onboardingBonusGrantedAt` column set atomically with the grant.

### 3. [critical] A client that disconnects gets a free query: aborted streams are never debited (follows up B-36)
**Location**: `src/agent-runtime/streaming/rag-stream-forwarder.service.ts:30-38`, `src/agent-runtime/streaming/sinks/persisting-result-sink.ts:44-53`, `src/agent-runtime/streaming/sinks/transient-result-sink.ts:25-34`, `src/credit/usage-tracker.service.ts:34,54`
**Finding**: The `close` listener was added so that "the usage of an already paid LLM call" gets recorded. But it settles as `kind: 'error'`. Both sinks then record `QueryLogStatus.ERROR`, and `recordQuery` only debits when `status === SUCCESS` (`creditsUsed` is stored as 0 otherwise). So a disconnect is logged and never billed.
**Evidence**: The engine sends answer tokens, then `cost_summary`, then ends. A scripted client (or a closed tab) reads the `chunk` events and drops the connection after the last token, before `end`. The path is `_observe` teardown, then `stream.destroy()`, then `close`, then `settle({kind:'error'})`, then `recordSafely({status: ERROR})`, so nothing is debited. The balance never moves, `checkOrThrow` keeps passing, and the client gets unlimited full answers on the persisted assistant and the onboarding stream. This goes against the intent that a debit is never skipped.
**Suggestion**: Do not let the client's lifetime control the upstream stream. On client disconnect, stop forwarding but let the RAG stream drain, so that `cost_summary` arrives and the normal SUCCESS debit runs. Alternatively, debit `costToCredits(costSummary)`, or a minimum, for any stream that produced tokens, whatever its status. Add a forwarder test covering "close after tokens" that asserts a debit.

### 4. [critical] The playground is billed and blocked at 0 credits; intent says it is free, and the tests lock in the wrong behavior (re-confirms B-21)
**Location**: `src/agent-runtime/agent-runtime.service.ts:38-44,113,117-119`, `src/agent-runtime/agent-runtime.orchestrator.ts:133-135`, `src/agent-runtime/test/agent-runtime.service.spec.ts:113-128`
**Finding**: `playgroundStream` only passes `{ forceActiveWorkflow: true }`, so `skipUsageTracking` is false. The effects:
- `_prepare` calls `checkOrThrow`: an agent author with 0 credits cannot test at all.
- `_startOrFail(..., recordFailureLog = true)` logs `OUT_OF_CREDITS` and `ERROR` rows.
- `logCtx` is set, so `TransientResultSink` debits real credits on success.
**Evidence**: The intent says "playground is free by design" and `plateform_back/CLAUDE.md:25` says "sans persistance ni crédits". The unit test "should build a transient sink with a usage-tracking logCtx" asserts the billing behavior, so CI protects the bug. Playground queries also land in `AgentQueryLog`, which mixes test traffic into production analytics and consumption.
**Suggestion**: Pass `skipUsageTracking: true` from `playgroundStream` and invert the test. If playground usage should still be visible, record it with its own status or flag rather than as SUCCESS with credits.

### 5. [warning] Usage recording can double-debit, can silently drop debits, and leaves no ledger entry
**Location**: `src/agent-runtime/usage/runtime-usage-recorder.ts:18-30`, `src/agent-runtime/usage/usage-recording.processor.ts:21-41`, `src/credit/usage-tracker.service.ts:36-59`, `prisma/schema/agent.prisma` (`AgentQueryLog.agent ... onDelete: Cascade`)
**Finding**: There are three related gaps:
- **Not idempotent.** BullMQ delivers at least once: `attempts: 5`, stalled-job recovery, and no `jobId`. `recordQuery` has no idempotency key; `AgentQueryLog` has no unique request id. A worker that commits the `$transaction` and then crashes or loses its lock before acking gets the job again, and `balance` is decremented twice.
- **Debits can be lost.** `recordSafely` is fire-and-forget. If `queue.add` fails (Redis blip), the debit is only logged. The intent says "never be skipped".
- **No ledger.** The debit updates `CreditBalance` without writing a `CreditTransaction` of type `USAGE`, which breaks the project rule "crédits + `CreditTransaction` en transaction" (`plateform_back/CLAUDE.md:39`). The only trace of consumption is `AgentQueryLog`, which has no `workspaceId` and cascades with `Agent`. Deleting an agent therefore erases every record of the credits it consumed, and `balance` can no longer be reconciled with `SUM(transactions)`.
**Suggestion**: Generate a `requestId` when the stream starts. Use it as the BullMQ `jobId` and as a unique column on the usage record. Inside the same transaction, create a `CreditTransaction{type: USAGE, amount: -n, workspaceId, metadata:{agentId, requestId}}`, and make the insert conflict-safe (`ON CONFLICT DO NOTHING`, then decrement only if a row was inserted). Await `queue.add` before emitting `done`, or fall back to a synchronous write.

### 6. [warning] The tenant filter and other block fields sent to the RAG API do not match the versioned engine's contract
**Location**: `src/rag-engine/rag-execution.service.ts:62` (top-level `org_id`), `src/agent-runtime/agent-runtime.orchestrator.ts:144` (`orgId: orgIdOverride ?? agentId`), `src/rag-engine/pipeline.schema.ts:8-12,21`, `rag-engine/app/pipelines/rag_pipeline.py:113-121`, `rag-engine/app/blocks/retrieve_block.py:33-34`, `rag-engine/app/schemas/rag.py:12-14`, `rag-engine/BLOCKS_FORMAT.md` (retrieve params)
**Finding**: The backend sends two different tenant keys:
- `retrieve.org_ids = [datasetIds]`. The isolation comment in `pipeline.schema.ts` depends on this one, but neither `BLOCKS_FORMAT.md` nor the versioned engine defines it, so Pydantic drops it silently.
- A top-level `org_id = agentId`. This is the only key the versioned engine reads: `RetrieveBlock(org_id=org_id)` filters `org_id == agentId`.

Documents are indexed under `org_id = datasetId` (`index-document.handler.ts:29`). Against this engine, every dataset-backed agent therefore retrieves nothing. Against an engine that does read `org_ids`, `agentId` is a meaningless second filter. `RAG-GenRag/` is not in the checkout, so I could not verify which engine runs in production.

Two more mismatches in the same contract:
- `RewriteBlock` requires `model`, but the engine reads `model_name` (`schemas/rag.py:14`; `serialize.ts:19` emits `model`). The rewriter model the user picks is ignored, and the engine bills its default.
- `deleteDocument` calls `DELETE /documents`, which the engine copy does not expose (`app/main.py` routes). `document.service.ts:218-219` and `dataset-cleanup.processor.ts:34` treat any 404 as "never indexed". A missing route also returns 404, so vectors would silently never be deleted.
**Suggestion**: Settle on one contract and write it into `BLOCKS_FORMAT.md` and the engine copy: `org_ids` on retrieve, and drop or neutralize the top-level `org_id`. Fix `model` → `model_name` for `query_rewrite`. Only treat 404 as success when the body says the document was not found.

### 7. [warning] Workflow definitions are validated only at query time, so an invalid or abusive pipeline can be deployed to production (relates to B-28)
**Location**: `src/workflow/dto/create-workflow.request.ts:23`, `src/workflow/workflow.service.ts:11-34,75-82`, `src/deployment/deployment.service.ts:74-80`, `src/agent-runtime/agent-runtime.builder.ts:51-55`, `src/rag-engine/pipeline.schema.ts:17-18`
**Finding**: `definition` is `@IsObject()` and nothing more. `deploy` only checks `isPlaceholder`. `PipelineSchema` runs only in `buildPipeline`, so a deployed agent whose blocks fail Zod returns 422 to every end user, and nothing catches it at deploy time. The fields that do pass through Zod are user-controlled and unbounded:
- `collection_name: z.string()` lets a stored workflow point retrieval at any Qdrant collection on the engine.
- `top_k: z.number().int().positive()` accepts values like `1e6`, while BLOCKS_FORMAT says max 100. That is a cost and DoS lever on the shared engine.
**Suggestion**: Validate `definition.blocks` with a "stored" variant of the schema (`datasetIds` instead of `org_ids`) in `WorkflowService.create/update` and again in `DeploymentService.deploy`. Set `collection_name` on the server instead of accepting it from the client. Cap `top_k` (e.g. `.max(100)`).

### 8. [warning] Rollback overwrites the active draft workflow in place, losing undeployed work
**Location**: `src/deployment/deployment.service.ts:104-108` → `src/workflow/workflow.service.ts:75-82`
**Finding**: `rollback` calls `workflowService.update(agentId, targetDefinition)`. That updates the row with `isActive: true` in place: the current draft is replaced and no history row is created. Production does not need this, because it already runs the snapshot `target.workflowVersion` through `findProductionDeployedWorkflowVersion`.
**Evidence**: Scenario: edit the builder (saved with `PATCH /workflow`, not deployed), then roll back to v2. The draft edits are gone, and `GET /workflow/history` does not have them because the update mutated the row instead of adding a version.
**Suggestion**: Only record the deployment pointing at the target version. If the builder should show the rolled-back definition, add it as a new version (`create`) instead of `update`.

### 9. [warning] The document lifecycle has no state guards: retries duplicate vectors, deleting a document leaves vectors that can still be retrieved, and the quota can be exceeded
**Location**: `src/document/document.service.ts:77-82,171-193,211-225`, `src/document/handlers/index-document.handler.ts:22-41`, `rag-engine/app/services/vector_db.py:33` (`id=uuid.uuid4().hex`)
**Finding**: Three separate problems:
- **Retry duplicates vectors.** `retry` only checks `updatedAt` age, not `status === FAILED`. Retrying an `INDEXED` document re-ingests it, and the engine creates new point ids, so the same chunks appear twice in retrieval. Retrying a `PROCESSING` document whose job is slow (it can wait up to 300 s in `waitForJob`) starts a second, concurrent job.
- **Deleted documents stay searchable.** `delete` can run while an index job is in flight: the engine delete returns 404 ("not indexed yet") and is ignored, then the row is deleted. The job then finishes `/ingest`, so vectors tagged `(org_id=datasetId, filename)` stay in a dataset that is still attached to agents and keep being retrieved. Afterwards `updateStatus(INDEXED)` throws P2025, and the retry fails at its first `updateStatus`, so nothing removes them.
- **Quota can be exceeded.** The check reads `getTotalSize` and only later does the `create`, without a lock, so parallel uploads all pass. The quota is also per dataset, and the number of datasets per workspace is unlimited.
**Suggestion**: Accept `retry` only from `FAILED`, using a conditional `updateMany({where:{id,status:FAILED}})`. On delete, mark a `DELETING` status that the handler checks after ingest, and if set, call the engine delete itself. Enforce the quota with a conditional insert or an advisory lock per dataset (or per workspace).

### 10. [warning] Per-IP throttling on the SSE routes caps a whole B2B customer behind one NAT at 20 questions per minute
**Location**: `src/conversation/conversation.controller.ts:41-42`, `src/agent-runtime/agent-runtime.controller.ts:40-41`, `src/onboarding/onboarding.controller.ts:99-100`, `src/app.module.ts:29`, `src/main.ts:14`
**Finding**: `ThrottlerGuard` uses `req.ip` as its default tracker. With `trust proxy 1`, every employee of a client company behind one egress IP shares the same 20/min bucket on `/assistants/:agentId/stream`, and every user gets a 429. `ThrottlerModule` also uses its in-memory store, so once the back runs more than one instance the limits are per process.
**Suggestion**: Track authenticated routes by `user.userId`, optionally with a per-agent or per-workspace budget. Use a Redis throttler storage (Redis is already a dependency).

### 11. [warning] There are no role checks, contrary to the stated intent; isolation rests on an invariant the database does not enforce, and one guard fails open
**Location**: `prisma/schema/migrations/20261011120000_remove_user_roles/migration.sql`, `src/workspace/guards/workspace-member.guard.ts:9-21`, `src/workspace/workspace.repository.ts:97-99`, `src/agent/guard/agent-workspace.guard.ts:13`
**Finding**: The intent requires ADMIN/EDITOR/VIEWER checks. The code has no role model at all: the column and enum were dropped, and any member can delete agents, deploy, export conversations and so on. This is only safe because every workspace has exactly one user. The only thing enforcing that is the advisory lock in `WorkspaceRepository.create`. There is no unique constraint on `UserWorkspace.workspaceId`, so any future invite or seed path silently turns every member into an admin. The root `CLAUDE.md` still lists ADMIN/EDITOR/VIEWER. Separately, `AgentBelongsToWorkspaceGuard` returns `true` when `workspaceId` or the agent id is missing. `DatasetBelongsToWorkspaceGuard:14` deliberately throws in that case ("Never fail open"). Every current mount does have `:workspaceId`, so this is not exploitable today, but it is a trap for the next controller.
**Suggestion**: Either restore roles as the intent says, or make the single-user invariant structural (`@@unique([workspaceId])` on `UserWorkspace`) and fix the docs. Make the agent guard fail closed like the dataset guard.

### 12. [nit] Overlapping questions in one conversation show the wrong answers
**Location**: `src/agent-runtime/agent-runtime.service.ts:263-276` (USER message written at stream start), `src/agent-runtime/streaming/sinks/persisting-result-sink.ts:88-93` (AGENT message at the end), `src/conversation/conversation.service.ts:59-84`, `src/agent/agent-export.controller.ts:56-73`
**Finding**: Questions and answers are paired by adjacency in `createdAt` order. Two streams on the same `conversationId` (two tabs, or a retry before the first answer arrives) store `U1, U2, A1, A2`. History and export then show Q1 with no answer, Q2 with A1, and A2 is dropped. There is no `replyTo` link, and the duplicated pairing logic (B-30) has the same flaw in both places.
**Suggestion**: Store `replyToId` (or a turn id) on AGENT messages and pair on it.

### 13. [nit] Logout can report success while the session is still valid
**Location**: `src/auth/auth.service.ts:57-70`, `src/auth/auth.controller.ts:76`
**Finding**: The `catch {}` meant for "decode failed" also swallows Redis errors from `blacklist()`, so the response is `{success:true}` while the JWT is still accepted. In production the cookie is set `SameSite=None; Secure` (`auth.service.ts:47-52`), but `clearCookie` sends it without `secure`/`sameSite`. In a cross-site fetch response, Chromium blocks that Lax-by-default `Set-Cookie`, so the browser keeps the cookie, and revocation depends only on the blacklist write that may have failed.
**Suggestion**: Only swallow decode errors. Pass the same `secure`/`sameSite` options to `clearCookie` that `login` uses.

### 14. [nit] Note: there is no Stripe or purchase code in the backend
**Location**: `src/credit/*`, `src/plans/plans.config.ts`, `prisma/schema/credit.prisma`
**Finding**: Nothing writes `CreditTransactionType.PURCHASE` and nothing changes `Workspace.plan`. Every workspace stays `FREE` with 180 credits; `PRO`/`BUSINESS`/`ENTERPRISE` are reachable only by manual DB edits. The docs that mention Stripe or billing describe code that does not exist.

## Re-confirmed open items from AUDIT_REPORT.md (still present on 904c1d3)
- **B-04**: the cookie is `SameSite=None` in production, there is no CSRF protection, and `urlencoded` bodies are accepted.
- **B-11 (2)**: `PATCH /users/me` changes the email without re-verification and keeps `isEmailVerified=true` (`users.service.ts:54-67`). Combined with Google login matching on email alone (`auth.service.ts:170`), an account can claim a not-yet-registered address that a victim later uses through Google.
- **B-15**: `text/html` is still accepted (`document.controller.ts:28`). `matchesDeclaredType` only checks for NUL bytes, and S3 serves the file with `Content-Type: text/html` through presigned URLs (`s3.strategy.ts:23-31`).
- **B-19**: changing or resetting the password does not revoke existing JWTs (`jwt.strategy.ts:28-36`).
- **B-24**: indexes are still missing on `Message(conversationId, createdAt)`, `Conversation(agentId, userId, updatedAt)`, `CreditTransaction(workspaceId, type)` and `AgentMember(userId)`, and nothing guarantees a single active `Workflow`.
- **B-35**: deleting a user, workspace or agent still leaves S3 objects and vectors behind. Only the dataset and single-document delete paths clean up.
- **B-37**: `executeQuery` (onboarding `compare`) still records usage directly.
- **B-42**: the login lockout is still per email.
