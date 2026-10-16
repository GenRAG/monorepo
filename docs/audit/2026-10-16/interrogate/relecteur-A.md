# Reviewer A — interrogate report (origin/dev @ 904c1d3, plateform_back)

Read-only review. Prior audit IDs (AUDIT_REPORT.md) are cited where a finding re-hits an open item. Stripe: confirmed absent from the backend (no billing/webhook code; `CreditTransactionType.PURCHASE` exists but nothing writes it). Not reported as a finding.

## Findings

### 1. [critical] Any query that does not end in `SUCCESS` is never debited, so a client that disconnects gets the answer free
**Location**: `src/agent-runtime/streaming/rag-stream-forwarder.service.ts:30-38`, `src/agent-runtime/streaming/sinks/persisting-result-sink.ts:44-53`, `src/agent-runtime/streaming/sinks/transient-result-sink.ts:25-33`, `src/credit/usage-tracker.service.ts:34-54`
**Finding**: The forwarder's comment says the `close` handler exists so that "the usage of an already paid LLM call" gets recorded. It does record the call, but as `kind: 'error'`, and both sinks map that to `QueryLogStatus.ERROR`. `recordQuery` only debits when `status === SUCCESS` (`shouldDebit`, line 34) and writes `creditsUsed: 0` otherwise. The same happens when the RAG engine emits an `error` event after it has already streamed tokens, and when the answer is empty (`endedStreamErrorMessage`): the engine has billed tokens to the platform, and the workspace pays nothing.
**Evidence**: Here is the path for a scripted end user on `GET /assistants/:agentId/stream`. Chunks are relayed live (`BaseResultSink.emit`). The client closes the EventSource after the last `chunk` or `citedSources` event, before `end`. Teardown (`agent-runtime.service.ts:90-95`) calls `stream.destroy()`. Only `close` fires, and `settle({kind:'error'})` leads to `PersistingResultSink.onCompleted` taking the error branch, then `recordSafely({status: ERROR, creditsUsed})`, then `shouldDebit=false`. The full answer was delivered and nothing was debited. The forwarder test `rag-stream-forwarder.service.spec.ts:72-83` only checks that `kind:'error'` is produced. No test checks that a disconnect is billed. This is B-36, which the audit marks as handled, but only the logging half was fixed.
**Suggestion**: Decide billing from cost rather than from status. Debit whenever the RAG engine has reported spend (any tokens received, or a `cost_summary`). If no cost summary arrived, use a fallback minimum. Keep `status` for analytics only. Add a sink test: `close` after N tokens must enqueue a debit greater than 0.

### 2. [critical] The playground checks and debits credits, although the intent says it is free; unit tests lock this in
**Location**: `src/agent-runtime/agent-runtime.service.ts:38-44,113,117-119`, `src/agent-runtime/agent-runtime.orchestrator.ts:133-135`, `src/agent-runtime/test/agent-runtime.service.spec.ts:113-127`
**Finding**: `playgroundStream` passes only `{ forceActiveWorkflow: true }`. As a result `skipUsageTracking` is `undefined`, which causes three things:
- `_prepare` calls `usageTracker.checkOrThrow`, so the playground returns "Insufficient credits" when the balance is 0.
- `recordFailureLog` is `true`.
- `logCtx` is built, so `TransientResultSink` enqueues a `SUCCESS` record and the workspace is debited for every playground test.

`plateform_back/CLAUDE.md` also says "playground : test, sans persistance ni crédits". The spec named "should build a transient sink with a usage-tracking logCtx" asserts the billing behaviour, so the contradiction is now enforced by CI. This is B-21; the intent now settles the question.
**Evidence**: Call chain: `AgentRuntimeController.playground` → `playgroundStream` → `_runTransientStream(..., {forceActiveWorkflow:true})` → `_startOrFail(..., !undefined === true)` → `orchestrator.streamQuery({skipUsageTracking: false})` → `checkOrThrow`. Then `createTransient(subscriber, logCtx)` → `recordSafely({status: SUCCESS, creditsUsed})` → `decrement`.
**Suggestion**: Pass `skipUsageTracking: true` from `playgroundStream`. A free-but-abusable endpoint still needs a cap, so keep the throttle and consider a separate per-workspace playground counter. Invert the spec.

### 3. [warning] Login, OTP and reset lockouts share one counter that a successful password login clears, so the OTP brute-force cap can be bypassed
**Location**: `src/auth/auth.service.ts:94-115`, `src/auth/token.service.ts:69-93`, `src/auth/login-attempt.service.ts:19-38`, `src/app.module.ts:29`
**Finding**: Login, email verification and password reset all use the same key, `login:attempts:<email>`. `verifyUser` calls `loginAttempt.reset(email)` at line 111, before the `isEmailVerified` check at line 113. In production, an attacker who registered an address they do not own (for example a victim's corporate email, before the victim signs up) knows the password but not the OTP. The attacker can:
1. Send 4 wrong codes to `/auth/verification-token`.
2. Log in successfully. The counter resets, then the login fails with "Account not verified".
3. Repeat.

The 5-attempt lockout never triggers. Two more weaknesses add to this:
- `isBlocked` followed by `recordFailure` is check-then-act. N parallel requests all pass `isBlocked` before any `incr`.
- `ThrottlerModule.forRoot` has no storage, so the per-IP limits are in-memory, per instance, and reset on restart.

Together, per-IP throttling is the only real bound on a 900k-code space. A successful brute force yields a verified account under someone else's email. It then chains into finding 9 and B-11(2).
**Evidence**: `verifyUser` order: `isBlocked` (94) → `findOneWithCredentials` (98) → `bcrypt.compare` (105) → `reset` (111) → `if (isProduction && !user.isEmailVerified) throw` (113). `verifyEmailToken` checks the same key (`isBlocked(email)`, line 69).
**Suggestion**: Use separate keys per flow (`login:`, `otp-verify:`, `otp-reset:`). Only reset the login key after every login precondition has passed. Do increment and compare atomically (`INCR` first, then reject if the result is over the max). Back the throttler with Redis (`ThrottlerStorageRedisService`).

### 4. [warning] The credit debit is not idempotent, can overdraw under concurrency, and keeps no ledger
**Location**: `src/agent-runtime/usage/runtime-usage-recorder.ts:18-30`, `src/agent-runtime/usage/usage-recording.processor.ts:21-41`, `src/credit/usage-tracker.service.ts:34-69`, `prisma/schema/agent.prisma:50-64`
**Finding**: There are four problems.
- **Double debit**: `usageQueue.add` has no `jobId`, and the debit transaction has no idempotency key. BullMQ delivers at least once. If the worker dies after the commit but before the ack, the job is marked stalled and replayed, so the workspace is debited twice and a duplicate `AgentQueryLog` is written. Nothing detects it.
- **Unbounded overdraft**: `checkOrThrow` reads `balance <= 0` before the query and the debit happens later, asynchronously. Many concurrent streams, whether from one tenant or from several AgentMembers of a shared assistant, all pass with balance = 1. The overdraft grows with concurrency × cost per query. The code comment accepts going negative "by one query", but nothing limits it to one.
- **Skipped debit**: the debit and `agentQueryLog.create` share a transaction, and `AgentQueryLog.agentId` has an FK with `onDelete: Cascade`. If the agent is deleted before the job runs (Redis backlog, retry backoff), the insert fails with P2003, the debit rolls back, and all 5 retries fail. The query is never billed.
- **No ledger**: `CreditTransactionType.USAGE` exists but nothing writes it. Usage history lives only in `AgentQueryLog`, which is cascade-deleted with the agent. The balance therefore cannot be reconciled against `CreditTransaction`, even though `CLAUDE.md` says to "always use $transaction for credits + CreditTransaction".

**Evidence**: `grep -rn USAGE src` finds only the queue name. `recordQuery` writes `creditBalance.update` + `agentQueryLog.create` and nothing else.
**Suggestion**: Generate a `queryId` (cuid) when the query starts. Use it as the BullMQ `jobId` and as the primary key of a `CreditTransaction{type: USAGE}` row (on P2002, skip the job). Store `agentId` as plain data, not an FK, so the ledger survives agent deletion. If overdraft must be bounded, reserve an estimated amount atomically at check time (`UPDATE ... SET balance = balance - :est WHERE balance >= :est`), then settle the difference.

### 5. [warning] Production snapshots can be changed without a deploy through `PATCH workflow/activate`
**Location**: `src/workflow/workflow.controller.ts:40-43`, `src/workflow/workflow.repository.ts:39-54`, `src/workflow/workflow.service.ts:75-82`, `src/agent-runtime/agent-runtime.builder.ts:34-38`, `src/deployment/deployment.service.ts:93-108`
**Finding**: The design treats snapshots (`isActive:false`, created by `deploy`) as immutable: production loads `findByVersion(prodVersion)`. But `PATCH .../workflow/activate {id}` activates any workflow of the agent, including the production snapshot. After that, `PATCH .../workflow` (`update` → `findActive` → `update(workflow.id)`) rewrites that snapshot in place, and production behaviour changes immediately with no `AgentVersion` row. `rollback` also writes through `update(active)`, so it overwrites the production snapshot in the same state. `CLAUDE.md` says "Ne jamais activer un snapshot à la main", yet the API exposes exactly that. The front never calls `activate` (`grep activate plateform_front/src/services` returns nothing), so the endpoint is dead.
**Evidence**: Steps: deploy, which creates v5 and sets `AgentVersion.workflowVersion=5`. Then `PATCH activate {id: v5}`, which sets v5 active. Then `PATCH workflow {definition: X}`, which sets v5's definition to X. The next `/assistants/:id/stream` runs X.
**Suggestion**: Delete the `activate` route and `WorkflowRepository.activate`. Also refuse `update` on a workflow whose version is referenced by an `AgentVersion`, or add an `isSnapshot` flag checked at the repository layer.

### 6. [warning] The pipeline is validated only when it runs, so an invalid or ungrounded pipeline can be deployed to end users
**Location**: `src/workflow/dto/create-workflow.request.ts` (`@IsObject() definition`), `src/deployment/deployment.service.ts:65-91`, `src/agent-runtime/agent-runtime.builder.ts:22-58,64-90`
**Finding**: `Workflow.definition` is accepted as any object when the workflow is created or updated. `deploy` only checks `nodes[].data.isPlaceholder`. `PipelineSchema` first runs inside `buildPipeline` on every query, so a broken `blocks` array reaches production and every end-user query returns 422. Two related problems:
- Dataset bindings are not part of the snapshot. `resolveRetrieveBlocks` resolves the live `AgentDataset` rows on every query, so detaching a dataset in the editor changes production at once.
- When no dataset resolves, the retrieve block is silently dropped (lines 80-83). The production agent then answers from the LLM alone and is billed as `SUCCESS`, which contradicts "answers exclusively from these documents". Only the first retrieve block's `datasetIds` are used for every retrieve block (line 69).

Validation sits in the wrong layer: the system boundary is the write, and the read side only re-checks.
**Suggestion**: Run `buildPipeline` (or `PipelineSchema` plus dataset resolution) in `deploy` and reject on failure. Store the resolved `org_ids` in the snapshot. When a retrieve block resolves to nothing in production, fail the query with a clear error instead of answering without retrieval.

### 7. [warning] The backend's `blocks` contract has drifted from BLOCKS_FORMAT.md and from the only engine in the repo, and tenants control `collection_name`/`top_k`
**Location**: `src/rag-engine/pipeline.schema.ts:8-35`, `src/rag-engine/rag-execution.service.ts:60-64,274-281`, `rag-engine/BLOCKS_FORMAT.md:57,100-163`, `rag-engine/app/blocks/retrieve_block.py:13-34`
**Finding**: Tenant isolation now depends on the engine honouring `retrieve.org_ids` (an array of dataset ids). Nothing in the repo shows that it does:
- BLOCKS_FORMAT.md documents only a top-level `org_id`.
- The versioned `rag-engine/` filters on a single `org_id` and has no `org_ids`.
- The backend still sends `org_id: agentId` at the top level (line 62).

If the deployed engine behaves like the local copy, retrieval filters on the agentId, and documents indexed under `datasetId` are never found. If it falls back to top-level `org_id`, any vectors still indexed under agent ids from before the datasets migration can still be retrieved.

There is more drift. `z.object` strips unknown keys, so documented fields are silently dropped: `rerank.top_k`, `rerank.provider`, and `query_rewrite.model_name` (the doc uses `model_name`, the schema uses `model`). `collection_name` is a free string from the tenant's stored definition, and `top_k` has no upper bound (the doc says max 100). Both are tenant input forwarded with the platform API key. Separately, `waitForJob` polls `/job/:id/status` without `X-API-Key` (line 280). If the real API protects that route, every indexing job fails.
**Suggestion**: Make one schema the contract: generate it from the engine, or vendor it, and add a contract test against the real API. Set `collection_name` on the server and drop it from tenant input. Add `.max(100)` on `top_k`. Stop sending the top-level `org_id`, or send something that cannot match. Add the API key on job polling.

### 8. [warning] In production, logout does not clear the cookie, and a blacklist failure is swallowed, so the session survives
**Location**: `src/auth/auth.controller.ts:70-78`, `src/auth/auth.service.ts:47-52,57-70`
**Finding**: The cookie is set with `secure: true, sameSite: 'none'` in production. `clearCookie('Authentication', { httpOnly: true, path: '/' })` sends a deletion cookie with no `SameSite` attribute, which browsers treat as Lax, and no `Secure` flag. The front is cross-site (that is why the cookie is `SameSite=None`). Chromium rejects a Lax `Set-Cookie` on a cross-site fetch response, so the browser keeps the token. The server-side blacklist is therefore the only thing that revokes the session, and `logout` wraps it in `catch {}`. If Redis is unavailable, logout returns `{success:true}` and the token stays valid until expiry. The blacklist also needs Redis persistence (AOF/RDB) to survive a restart (`CLAUDE.md` mentions this). Nothing enforces or checks it.
**Suggestion**: Clear the cookie with the same options it was set with. Factor them into one `authCookieOptions()` used by both calls. Let a blacklist failure surface as a 5xx, or log and report it to Sentry.

### 9. [warning] Google login signs into any existing account with that email, whatever its verification state or history
**Location**: `src/auth/auth.service.ts:151-180`, `src/users/users.service.ts:54-67`
**Finding**: `loginWithGoogle` looks up `findOneWithCredentials({email})` and logs into that row. It does not check whether that row's email was ever proven by its current holder. Two ways a row can claim an email nobody proved:
- `PATCH /users/me` changes `email` without re-verification and keeps `isEmailVerified=true` (B-11(2), still open).
- An unverified password registration, verified through finding 3.

When the real owner later clicks "Sign in with Google", they land in the attacker's account, whose password the attacker knows. Everything they upload or configure is then exposed. The B-02 fix covered the token audience, not account linking.
**Suggestion**: Only link Google to an existing row if that row's email was verified through an OTP sent to that same address. Otherwise reject, or require an explicit linking step. Re-verify the email in `updateProfile` (reset `isEmailVerified` and send an OTP).

### 10. [warning] State-changing SSE GETs (credit spend, conversation writes) stay CSRF-able even if B-04 moves to `SameSite=Lax`
**Location**: `src/conversation/conversation.controller.ts:40-54`, `src/agent-runtime/agent-runtime.controller.ts:326-340`
**Finding**: `GET /assistants/:agentId/stream?query=...` creates a Conversation and Message rows and debits the agent's workspace. The playground GET debits as well (finding 2). With today's `SameSite=None`, any site can trigger these with `<img>` or `EventSource({withCredentials})`. CORS only blocks reading the response, not executing the request. B-04 proposes `SameSite=Lax` as the fix, but Lax still sends cookies on top-level GET navigations, so a link or redirect to the stream URL keeps working. The B-04 remediation has to cover these GETs.
**Suggestion**: Require a custom header (EventSource cannot set one, so use `fetch`-based SSE) or a per-request token, or check `Origin`/`Sec-Fetch-Site` on the runtime routes.

### 11. [warning] The document lifecycle has races that leave searchable vectors for deleted documents
**Location**: `src/document/document.service.ts:171-192,211-225`, `src/document/handlers/index-document.handler.ts:22-38`, `src/rag-engine/rag-execution.service.ts:259-272`
**Finding**: There are two races.
- **Delete during indexing**: `delete` calls the engine delete first and treats a 404 as "never indexed". While a job is still running in the engine (`indexDocument` → `waitForJob`, up to 300 s), that 404 is expected. The row and the S3 object are then deleted, the engine finishes ingesting, and the vectors stay in `org_id=datasetId` permanently. The deleted content keeps appearing in answers for every agent attached to the dataset. The handler's final `updateStatus` then throws P2025 and the job retries; each retry fails at the first `updateStatus`, so nothing cleans up.
- **Retry ignores status**: `retry` does not check `status === FAILED`. It can re-enqueue an `INDEXED` document, or one whose job is still in flight. That produces duplicate or concurrent ingests of the same `(org_id, filename)`. It is only rate-limited by `updatedAt`.

**Suggestion**: Refuse delete and retry unless status is `INDEXED`/`FAILED` and `FAILED` respectively. Alternatively, add a `DELETING` state that the handler checks after `indexDocument` returns, so it removes the vectors itself.

### 12. [warning] The `add_dataset_model` migration fails on any database with documents, and orphans the old vectors and files
**Location**: `prisma/schema/migrations/20261005224546_add_dataset_model/migration.sql:1-8,19-20`
**Finding**: The migration drops `Document.agentId` and adds `"datasetId" TEXT NOT NULL` with no default and no backfill. Prisma's own header warns that this "is not possible if the table is not empty". On a populated production database the migration aborts. The only way forward is `migrate reset`, which deletes data. Even if the table were cleared by hand, two things remain: the vectors indexed under `org_id = agentId` (still reachable per finding 7), and the S3 objects under the old keys. No code cleans either up. The later `20261010120000_document_name_unique` adds a unique index that also fails if duplicate names exist (B-16).
**Suggestion**: Do it in two steps: add the column as nullable, backfill one dataset per agent through `AgentDataset`, then set NOT NULL. Add a one-off job to re-index or delete the agent-scoped vectors.

### 13. [warning] The intent requires ADMIN/EDITOR/VIEWER roles, but the code has none, and the leftover M:N membership model only adds complexity
**Location**: `prisma/schema/migrations/20261011120000_remove_user_roles/migration.sql`, `src/workspace/guards/workspace-member.guard.ts:12`, `src/workspace/workspace.repository.ts:88-125`, `src/users/user.repository.ts:59-81`, root `CLAUDE.md` (feature table: "rôles ADMIN / EDITOR / VIEWER")
**Finding**: Commit 1a910ed removed `UserWorkspace.role` and `WorkspaceRolesGuard`. Every member can now do everything. The role-based check in the intent is not implemented, and the root `CLAUDE.md` still advertises it. The code now assumes one user per workspace, but it keeps the many-to-many machinery for a model that no longer exists:
- the `UserWorkspace` join table with a composite primary key;
- a Postgres advisory lock plus count to enforce "one workspace per user", rather than a constraint;
- the "sole member" counting loop in user deletion;
- a membership lookup on every request.

**Suggestion**: If single-owner is the product decision, use `Workspace.ownerId String @unique`. The advisory lock, the count, the delete loop and the join table all go away, and the guard becomes `workspace.ownerId === user.userId`. Then fix the root `CLAUDE.md` and the intent text. If collaboration will come back, reintroduce roles as data plus one guard, rather than as conventions.

### 14. [nit] End-user access does not depend on the agent being in production, and `getSourceUrl` serves any file by name
**Location**: `src/conversation/guard/agent-access.guard.ts:13`, `src/conversation/conversation.repository.ts:26-36,94-96`, `src/conversation/conversation.service.ts:86-91`
**Finding**: `hasAgentAccess` ignores `Agent.status`. Only the stream rechecks `PRODUCTION`. An AgentMember of a stopped or never-deployed agent can still list conversations and fetch presigned URLs. `getSourceUrl` returns a URL for any document in any dataset attached to the agent, whether or not it was ever cited. Raw files in those datasets are therefore downloadable by external end users who guess or enumerate names.
**Suggestion**: Check the status in `AgentAccessGuard`. Limit `getSourceUrl` to names that appear in the caller's own message `metadata.sources`.

### 15. [nit] The global filter logs and echoes the full URL, including `?query=` user questions
**Location**: `src/exeptions/interceptor.service.ts:26-38`
**Finding**: `app.module.ts:39-45` strips query strings from request logs, because SSE questions travel in the URL. `AllExceptionsFilter` logs `path: request.url` unstripped, and logs it at `error` level for every 4xx, including 401/429 on the stream routes. So user questions still end up in logs and in the response body.
**Suggestion**: Use `request.url.split('?')[0]` (or `request.path`) for both the log and the body. Log 4xx at `warn`.

### 16. [nit] Smaller correctness issues
- `src/agent/agent-member.service.ts:8`: `addMember` looks up `email` without `toLowerCase().trim()`. Emails are stored normalized, so "Alice@X.com" returns 404 for an existing user.
- `src/workspace/guards/workspace-member.guard.ts:12`: the `request.body?.workspaceId` fallback is unused by every route. It is a trap: a future route could authorize on the body id while the service uses another one. Remove it.
- `src/retention/retention-cleanup.service.ts:26-27`: retention deletes conversations by `createdAt`, so a conversation still in daily use is wiped N days after it started. Use `updatedAt`. This is separate from the docs mismatch in B-22.
- `src/workflow/workflow.service.ts:11-33` / `src/deployment/deployment.repository.ts` (`createWithAgentUpdate`): version numbers are computed with read-max-plus-one. Concurrent saves or deploys return P2002 as a 500, and the B-24 "one active workflow" gap allows two active rows.
