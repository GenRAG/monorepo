# Interrogation report: Reviewer D (back-end: auth, tenant isolation, credits, blocks pipeline, Prisma)

Scope: GenRAG at 904c1d3, clean tree. Read-only: nothing edited, no commits. Prior findings in AUDIT_REPORT.md were checked and cited by ID. The role-based authorization item is dropped per the coordinator's update (one workspace per user, no roles, by design).

Summary: 3 critical, 17 warning, 5 structural (code quality), 10 nits. The most serious: the playground is metered and blocked by credits, which contradicts the intent. The tenant filter the back-end builds is not what the only engine copy enforces. Several paid queries are never debited.

Base paths: BE = plateform_back/src, ENG = rag-engine/app.

## Findings

### 1. [critical] Playground is metered and blocked by credits; the intent says it is free
**Location**: BE/agent-runtime/agent-runtime.service.ts:38-44, 113, 117-119; BE/agent-runtime/agent-runtime.orchestrator.ts:133-135; BE/agent-runtime/agent-runtime.controller.ts:185-199
**Finding**: `playgroundStream` passes only `forceActiveWorkflow: true`. `skipUsageTracking` stays undefined, and the option defaults to metering. The playground therefore runs `checkOrThrow` (returns "Insufficient credits" at zero balance) and debits every answer through the transient sink. Open item B-21 is still in the code.
**Evidence**: `POST …/runtime/playground` → `playground()` → `playgroundStream()` → `_runTransientStream(..., {forceActiveWorkflow:true})` → `_startOrFail(..., recordFailureLog = !undefined = true)` → `_startRagStream` → `orchestrator.streamQuery({skipUsageTracking:false})` → `_prepare` → `checkOrThrow` (orchestrator:134). On completion, `TransientResultSink.onCompleted` (BE/agent-runtime/streaming/sinks/transient-result-sink.ts:156-167) calls `recordSafely` with `creditsUsed`, because `logCtx` is built at agent-runtime.service.ts:117-119. The spec at BE/agent-runtime/test/agent-runtime.service.spec.ts:118 asserts metering, so the suite encodes the conflict with the intent. The root CLAUDE.md table ("Playground … sans crédits") agrees with the intent.
**Suggestion**: Pass `skipUsageTracking: true` in `playgroundStream`. Make the billing mode a required explicit argument (see S1), not a boolean that defaults to metered. Change the spec to assert no debit and no `checkOrThrow`.

### 2. [critical] The tenant filter sent by the back-end is not enforced by the RAG engine copy; retrieval is either empty or unfiltered
**Location**: back: BE/rag-engine/rag-execution.service.ts:60-62, 236-243; BE/agent-runtime/agent-runtime.orchestrator.ts:144; BE/agent-runtime/agent-runtime.builder.ts:76-89. Engine: ENG/blocks/retrieve_block.py:33-34; ENG/schemas/rag.py:20-23, 96; ENG/pipelines/rag_pipeline.py:196, 204.
**Finding**: The builder writes per-block `org_ids` (dataset ids, min 1). pipeline.schema.ts:19-21 documents this as the isolation guarantee. The request, however, sends top-level `org_id = orgIdOverride ?? agentId`. The engine copy reads only the top-level field: `RetrieveBlock` filters on `self.org_id` (retrieve_block.py:33), `RetrieveBlockConfig` has no `org_ids` field, and pydantic ignores unknown keys. Documents are indexed under `org_id = datasetId` (rag-execution.service.ts:243, called from the document handler).
**Evidence**: (1) Agent queries send `org_id = agentId`, which matches no indexed point, so retrieval returns nothing. (2) If `org_id` is null, `query_filter` is None (retrieve_block.py:33-34), so the search covers every tenant's vectors: the filter fails open. (3) If someone fixes (1) by putting dataset ids in the top-level `org_id`, isolation rests on one string and the array guarantee stays dead. Caveat: only the versioned copy in rag-engine was read. It also lacks `DELETE /documents`, the `/models/*` routes that RagEngineController calls, and the typed NDJSON events the back-end parses (it streams text/plain, main.py:191-196). The newer `RAG-GenRag` clone named in CLAUDE.md is not in this checkout. The result is unverified against the deployed engine, and the back-end's own tests cannot show isolation holds.
**Suggestion**: The engine must filter on `org_ids` (MatchAny) and fail closed (error) when the field is missing. The back-end should send exactly the field the engine enforces. Add a contract test that runs the pipeline against the engine and proves tenant B's documents never come back for tenant A.

### 3. [critical] Paid queries are not debited on several deterministic paths; a missing cost summary is billed as 1 credit
**Location**: BE/credit/usage-tracker.service.ts:8, 21, 34-46; BE/agent-runtime/streaming/sinks/persisting-result-sink.ts:110-132; BE/agent-runtime/streaming/sinks/runtime-result-sink.interface.ts:40-50; BE/agent-runtime/streaming/rag-stream-accumulator.ts:201-204, 212-219; BE/rag-engine/ndjson-line-buffer.ts:97-115; BE/rag-engine/rag-execution.service.ts:139, 148; BE/agent-runtime/streaming/rag-stream-forwarder.service.ts:93-111; BE/agent-runtime/agent-runtime.service.ts:151-155
**Finding**:
(a) `recordQuery` debits only when status is SUCCESS (usage-tracker:34). A stream that ends with a RAG `error` event after tokens were produced, or with an empty answer (`EMPTY_ANSWER_MESSAGE`, interface:49), is stored as ERROR with `creditsUsed: 0`. The engine may already have spent on the LLM.
(b) With no `cost_summary` event, `creditsUsed` is undefined, and `recordQuery` falls back to `COST_PER_QUERY = 1` (usage-tracker:8, 21).
(c) The streaming path never calls `NdjsonLineBuffer.flush()`, so an unterminated last line is lost. That is often the cost summary. `sendQuery` does flush (rag-execution:139), so the two paths disagree. Parse failures are swallowed silently (ndjson-line-buffer:110-112).
(d) `total_cost_usd` comes from an unvalidated cast (accumulator:202). If it is missing or a string, `costToCredits` returns NaN (credit-pricing.ts:74-77). Prisma rejects `decrement: NaN`, the job retries 5 times, and neither the debit nor the AgentQueryLog row is written.
(e) A client disconnect is recorded as ERROR with 0 credits (forwarder 'close' → sink). This is B-36, still open.
(f) If `_initConversation` fails after the RAG stream starts, the stream is destroyed without `forward()` (agent-runtime.service.ts:151-155). The call is never recorded.
**Evidence**: Each item follows the chain RAG event → accumulator → `sink.onCompleted` → `creditsUsed()` / status → `RuntimeUsageRecorder` → processor → `recordQuery`. Existing specs cover the happy path only (usage-tracker, sink and processor specs). None covers error-with-cost, missing cost summary, or NaN. The intent says debits "must never be skipped".
**Suggestion**: Decide the billing rule once. Debit the real reported cost whenever the engine reports one, regardless of answer status. Keep a flat charge only as an explicit, alerted fallback. Validate the cost summary at the boundary (Zod: finite number ≥ 0). Flush at end-of-stream in the streaming path. Report parse failures to Sentry instead of dropping them.

### 4. [warning] A debit can be applied twice: the usage job has no idempotency key
**Location**: BE/agent-runtime/usage/runtime-usage-recorder.ts:19-25 (no `jobId`); BE/credit/usage-tracker.service.ts:36-59; BE/agent-runtime/usage/usage-recording.processor.ts:52-56
**Finding**: The decrement and the AgentQueryLog insert are not keyed by any request id. Retries use `attempts: 5`.
**Evidence**: BullMQ re-queues stalled active jobs (lock expired after a crash or a blocked event loop) and runs them again. If the first run's transaction committed, the rerun decrements again and inserts a second log row. The intent says "must never double-debit".
**Suggestion**: Use a deterministic `jobId` (the stream/request UUID). Add a unique index on `AgentQueryLog(requestId)`, and insert the log and debit in one transaction that does nothing when the log already exists.

### 5. [warning] Overdraft: the balance is checked at start and debited at the end, with no reservation
**Location**: BE/credit/usage-tracker.service.ts:62-69; BE/agent-runtime/agent-runtime.orchestrator.ts:133-135, 73-94; sinks as in finding 3
**Finding**: `checkOrThrow` reads the balance once, before the stream. The debit happens at completion. The comment at usage-tracker:37-41 accepts negative balances without bound.
**Evidence**: N streams started at balance 1 all pass the check. Each then debits its own cost. Throttles are per IP per route (agent-runtime.controller.ts:186-187, conversation.controller.ts:41-42) and in memory per instance (app.module.ts:71, no storage configured). They therefore multiply across IPs and replicas.
**Suggestion**: Reserve an estimate atomically (`UPDATE … SET balance = balance - est WHERE balance >= est`) and reconcile at completion. Or cap in-flight streams per workspace.

### 6. [warning] End users charge the owner's workspace with no per-member bound; members can fetch whole source files
**Location**: BE/agent/agent-member.service.ts:144-164; BE/conversation/conversation.repository.ts:26-36, 94-96; BE/agent-runtime/agent-runtime.service.ts:134, 140; BE/conversation/conversation.controller.ts:62-67; BE/conversation/conversation.service.ts:160-166; prisma/schema/document.prisma:87-88
**Finding**: Any workspace member can add any registered account by email. That account's queries bill the owner's workspace with no per-member quota (only the IP throttle). `hasAgentAccess` also lets a member call `/assistants/:agentId/sources/url?title=`. That returns a 15-minute presigned URL of the whole original file, for any document in any dataset attached to the agent, not only documents cited in an answer. The name lookup is `findFirst` across datasets, while uniqueness is per dataset. Two datasets with the same file name therefore return an arbitrary file. This is the B-16 family.
**Suggestion**: Add a per-member quota or a separate end-user credit pool. Resolve sources by document id stored with the cited sources in the message metadata. Decide explicitly whether end users may download source files at all.

### 7. [warning] Prototype-key dispatch: one NDJSON line can throw inside the socket read path
**Location**: BE/agent-runtime/streaming/rag-stream-accumulator.ts:183, 215; BE/rag-engine/rag-execution.service.ts:115-134 (dispatch at 132); BE/rag-engine/ndjson-line-buffer.ts:109
**Finding**: `handlers` is a plain object literal, and the lookup uses the untrusted `type` from the JSON line.
**Evidence**: `handlers["__proto__"]` is `Object.prototype`. Calling `?.()` on it throws a TypeError inside the 'data' listener. `"constructor"` and `"toString"` resolve to functions. Their return values are pushed as "events" and emitted to clients through `encodeSseEvent`. The source is the engine, so trust is medium. A single bad line should still not crash the API.
**Suggestion**: Use a `Map` lookup or `Object.hasOwn`. Validate the line shape (type must be one of the enum) with Zod.

### 8. [warning] Google sign-in links to any existing account by email without verification
**Location**: BE/auth/auth.service.ts:168-179 (link at 170, login at 179); BE/auth/auth.service.ts:72-89 (register); BE/users/users.service.ts:31-38
**Finding**: `register` lets anyone create a local account for any email with their own password. The account is unverified, and nothing proves the mailbox is theirs. Google sign-in then finds that row and logs into it without checking `isEmailVerified` and without touching the password.
**Evidence**: The squatter's password works once the victim completes an email OTP, because `verifyUser` only requires `isEmailVerified` (auth.service.ts:113-115; `verifyEmailAndLogin`).
**Suggestion**: Refuse to link to an account whose email GenRAG never verified. Or, when linking, clear the local password and existing tokens.

### 9. [warning] The login lockout is check-then-act, and its counter can outlive its purpose
**Location**: BE/auth/login-attempt.service.ts:23-34; BE/auth/auth.service.ts:94-109, 186-215; BE/auth/token.service.ts:148-170
**Finding**: `isBlocked` reads the counter before the bcrypt compare (about 100 ms). Increments happen only after the compare.
**Evidence**: A burst of parallel guesses all see count < 5 and all get checked. `recordFailure` does `INCR`, then `EXPIRE` only when `count === 1`. A crash or a failed EXPIRE between them leaves a key with no TTL, and `isBlocked` has no expiry. The account is then locked until someone edits Redis. Four copies of this boilerplate exist (auth.service ×2, token.service ×2).
**Suggestion**: Increment before comparing and reject when over the limit. Set the TTL atomically (Lua, or `SET … NX EX` plus `INCR`). Use one helper for all four flows (see S2).

### 10. [warning] Deleting a document while it is queued or indexing leaves orphan vectors and masks the real error
**Location**: BE/document/handlers/index-document.handler.ts:77-88, 98-116; BE/document/document.repository.ts:60-74 (`update`, not `updateMany`); BE/document/document.service.ts:211-225; BE/document/document.processor.ts:23-43
**Finding**: Delete removes the row and the vectors that do not exist yet. The job then indexes the file, so vectors are stored under the name and org with no row.
**Evidence**: `updateStatus(INDEXED)` throws P2025 because the row is gone. The `catch` calls `retrying`/`failed`, which throw P2025 again. BullMQ therefore records a Prisma error instead of the original one. It retries 5 times and keeps the job (`removeOnFail: false`, with the base64 payload, B-17).
**Suggestion**: Use `updateMany` for status writes and stop when 0 rows match. After indexing, check that the row still exists. If it does not, delete the vectors by name. Or cancel the job in `delete`.

### 11. [warning] Document and dataset deletion can get stuck or half-finish
**Location**: BE/rag-engine/rag-execution.service.ts:259-272 (generic Error at 269-271); BE/document/document.service.ts:215-220; BE/dataset/dataset-cleanup.processor.ts:30-37
**Finding**: The engine's "not present" answer (200 with `file_deleted: false`) becomes a generic Error. `DocumentService.delete` only tolerates AxiosError 404, so the delete returns 500, the row stays, and the user cannot remove the document. In the cleanup job, the loop throws on the first failing document. The S3 objects of all later documents are never deleted, and the job ends failed after 5 attempts.
**Suggestion**: Apply one "absent means success" rule in `RagEngineService`. Process each document independently and aggregate failures.

### 12. [warning] Rollback overwrites the editable draft and is not atomic
**Location**: BE/deployment/deployment.service.ts:93-119 (update of the active workflow at 106-108; deployment creation in a separate transaction at 110-118); BE/workflow/workflow.service.ts:134-141
**Finding**: The active workflow is the draft the builder edits. Rollback replaces its definition in place, so the previous draft is lost. The workflow table keeps no history for in-place updates.
**Evidence**: If `createDeploymentAndEmitEvents` then fails, the draft has changed and production has not.
**Suggestion**: Roll back by repointing only the production snapshot (`workflowVersion`), and leave the draft alone. If the draft change must stay, do both writes in one transaction.

### 13. [warning] Two active workflows can coexist
**Location**: BE/workflow/workflow.service.ts:70-93 (updateMany then create, unlocked); prisma/schema/workflow.prisma:11 (only `@@unique([agentId, version])`); BE/workflow/workflow.repository.ts:9-13 (`findFirst` with no order)
**Finding**: Two concurrent `POST …/workflow` requests each run `updateMany` before either insert commits, so neither sees an active row to flip. Both inserts commit with `isActive = true`.
**Evidence**: `findActive` and `buildPipeline` then pick an arbitrary one. This extends B-24, whose partial unique index is still missing.
**Suggestion**: Add a partial unique index on `(agentId) WHERE "isActive"`, or lock the agent row (`SELECT … FOR UPDATE`) inside the transaction.

### 14. [warning] Deploy accepts workflows that cannot run; the no-dataset case silently drops retrieval
**Location**: BE/deployment/deployment.service.ts:65-80 (placeholders only); BE/agent-runtime/agent-runtime.builder.ts:45-55 (Zod only at query time), 80-83 (retrieve block dropped); BE/workflow/dto/create-workflow.request.ts:32-33 (`@IsObject()`); ENG/blocks/answer_block.py:28
**Finding**: `deploy` snapshots any JSON object that has no placeholder node and makes it production. The next end-user query then fails with 422 for everyone. The Zod path list is also shown to end users (builder:53-54). Conversely, an agent with no attached dataset gets its retrieve block removed, and the answer block runs with no context. The answer prompt says "Use ONLY information from the provided context documents", but there is no context, so answers are not grounded in documents.
**Suggestion**: Run `PipelineSchema` on save and before deploy. When a retrieve block resolves to no dataset, return an explicit error instead of answering. Keep Zod details out of client messages.

### 15. [warning] A migration cannot run on a populated database and does not migrate data
**Location**: prisma/schema/migrations/20261005224546_add_dataset_model/migration.sql (header warning; `DROP COLUMN "agentId"`; `ADD COLUMN "datasetId" TEXT NOT NULL`)
**Finding**: PostgreSQL rejects `ADD COLUMN … NOT NULL` without a default when rows exist. The file's own header says so. No backfill moves agent documents to datasets. Vectors indexed under `org_id = agentId` (old model) are unreachable under the dataset model (see finding 2).
**Suggestion**: Verify the deployed migration history (the `20260504…_reset` migration suggests databases were reset before). Add a backfill migration (one Dataset per agent, move rows), and re-key or re-index vectors.

### 16. [warning] End-user conversations survive account deletion and stay readable by the owner
**Location**: prisma/schema/conversation.prisma:5, 12 (`userId` nullable, `onDelete: SetNull`); BE/users/user.repository.ts:192-214 (user delete does not touch conversations); BE/agent/agent-export.controller.ts:19-43
**Finding**: Deleting an end-user account nulls `Conversation.userId`. The messages stay, appear in the workspace owner's JSON and CSV exports, and can no longer be opened by the user, since `ConversationAccessGuard` compares `userId`.
**Suggestion**: Delete, or explicitly anonymize, the user's conversations in the same transaction, and document the choice.

### 17. [warning] Security posture depends on NODE_ENV alone
**Location**: BE/auth/auth.service.ts:31, 47-52, 86-88, 113-115; BE/auth/token.service.ts:139, 211
**Finding**: Any environment without `NODE_ENV=production` (staging, preview) skips email verification. It sends the cookie without `Secure` and with `SameSite=Lax`. It sends no mail unless `SEND_EMAILS` is set. Nothing validates the combination.
**Suggestion**: Use explicit flags (`COOKIE_SECURE`, `REQUIRE_EMAIL_VERIFICATION`), validated at boot, or refuse to start without them.

### 18. [warning] Guards fail open or fall back to non-workspace ids
**Location**: BE/agent/guard/agent-workspace.guard.ts:10-13 (`return true` when ids are missing); BE/workspace/guards/workspace-member.guard.ts:12 (`params.id ?? body.workspaceId`); compare BE/dataset/guard/dataset-workspace.guard.ts:76-77 ("Never fail open")
**Finding**: Every current route using `AgentBelongsToWorkspaceGuard` has both params, so there is no live hole. The pattern is latent. A future route with `:id` and no `workspaceId` would be checked against a non-workspace id, or against a body field.
**Suggestion**: One guard factory with explicit parameter names, failing closed, with no body fallback.

### 19. [warning] Full questions end up in error logs
**Location**: BE/exeptions/interceptor.service.ts:171-177 (`path: request.url`) and 179-184; BE/app.module.ts:81-82 (the pino serializer strips query strings "user questions on the SSE routes")
**Finding**: SSE routes carry the question in `?query=` (BE/conversation/conversation.controller.ts:40-46; BE/agent-runtime/agent-runtime.controller.ts:188-191). Any exception on those routes (the 400 for queries over 4000 characters, a 401) logs the full query through the global filter, which bypasses the serializer.
**Suggestion**: Log `request.route?.path ?? request.path`, as the serializer does.

### 20. [warning] Cross-tenant write-path risk in the onboarding `orgIdOverride` boundary
**Location**: BE/agent-runtime/agent-runtime.builder.ts:76-78; BE/agent-runtime/agent-runtime.service.ts:46-55; BE/onboarding/onboarding.service.ts:234-241
**Finding**: `orgIdOverride` is used verbatim as the sole `org_ids` entry, skipping `resolveOrgIdsForAgent` (which enforces attachment and workspace). It is safe today because only the literal `'onboarding'` reaches it. The invariant is only as strong as its callers.
**Suggestion**: Make the override a typed, named constant (for example `DEMO_TENANT`) instead of a free string parameter, so no caller can pass a user-derived value.

## Structural findings (code-quality lens)

### S1. Billing policy is spread over five places, with booleans that default to "meter"
**Location**: BE/agent-runtime/agent-runtime.service.ts:19-23, 113, 117-119; BE/agent-runtime/agent-runtime.orchestrator.ts:44, 73-94, 104; sinks (transient-result-sink.ts:137-173, persisting-result-sink.ts:91-132); usage-tracker.service.ts:34
**Finding**: `skipUsageTracking` and `forceActiveWorkflow` are optional booleans, and omitting one means "meter". Each sink re-derives status and credits. `executeQuery` records usage directly instead of through the queue (B-37). Finding 1 is the direct consequence: the safe mode is not the default.
**Suggestion**: One `settleUsage(outcome, billing)` function returns the usage record. `billing` is a required union, `{kind:'free'} | {kind:'metered', workspaceId, agentId}`, passed by every entry point. The status and credit rules of finding 3 then live in one function with a table-driven unit test. This removes three sink branches and the boolean plumbing.

### S2. OTP and lockout logic is duplicated
**Location**: BE/auth/auth.service.ts:91-128, 182-227; BE/auth/token.service.ts:105-142, 144-184, 186-214
**Finding**: Two issue flows and two verify flows repeat the same resend throttle, lockout, expiry and compare code.
**Suggestion**: An `OtpService` with `issue(kind)` and `verify(kind)`. `verify` increments before comparing (finding 9). Roughly 120 lines disappear, and the enumeration fix for B-43 lands in one place.

### S3. Two NDJSON consumers implement the same protocol
**Location**: BE/agent-runtime/streaming/rag-stream-accumulator.ts:183-215; BE/rag-engine/rag-execution.service.ts:115-134
**Finding**: `sendQuery` has its own dispatcher, and only it calls `flush()`. The two disagree (finding 3c), and the lookup bug (finding 7) exists twice.
**Suggestion**: `sendQuery` should consume the same accumulator as the streaming path. There is then one flush rule and one handler table.

### S4. Error mapping and write scoping are ad hoc
**Location**: P2025→404 in BE/agent/agent.service.ts:59-64, BE/workflow/workflow.service.ts:121-130, BE/workspace/workspace.service.ts:164-171; P2002→409 in BE/users/users.service.ts:59-66, BE/document/document.service.ts:104-110. Id-only writes: BE/agent/agent.repository.ts:94-100, BE/dataset/dataset.repository.ts:80-82, BE/document/document.repository.ts:70-74, BE/workflow/workflow.repository.ts:34-36.
**Finding**: Each service maps Prisma errors itself. Repositories write by id, and authorization happens in an earlier read.
**Suggestion**: Map Prisma errors in one place (the exception filter, or a helper). Scope writes with `where: {id, workspaceId}` using `updateMany`/`deleteMany` and check the count. This also closes the P2025 masking in finding 10.

### S5. Repeated plumbing
**Location**: `@CurrentUser(CurrentUserPipe)` in about a dozen controller parameters (BE/users/pipes/user-validation.pipe.ts:287-298), on top of `JwtStrategy.validate`'s own lookup (BE/auth/strategies/jwt.strategy.ts:88-91). `@UseGuards(ThrottlerGuard)` plus `@Throttle` on nine routes (BE/auth/auth.controller.ts:16-65; BE/conversation/conversation.controller.ts:41; BE/onboarding/onboarding.controller.ts:74, 99; BE/agent-runtime/agent-runtime.controller.ts:40).
**Finding**: Each request does two user lookups. The throttle guard is repeated per route.
**Suggestion**: `JwtStrategy` returns `UserSafe` and the pipe goes away. A global ThrottlerGuard with per-route `@Throttle` removes the repetition and also resolves B-13.

## Nits

- N1. Enumeration oracles beyond B-43: resend-verification-token returns 400 only for unknown emails (BE/auth/token.service.ts:114-116). reset-password returns 400 "Please wait" only for known emails (token.service.ts:193-197).
- N2. BE/agent/agent-member.service.ts:144-145 and BE/agent/agent-member.repository.ts:13-15 do not normalize the email, so `Alice@X.com` never matches the stored lowercase row. Same class as B-11(1), which was fixed only in the profile path.
- N3. BE/auth/auth.service.ts:57-70: logout trusts `jwtService.decode` (no signature check) and writes a blacklist key for any jti. Use `verify` with `ignoreExpiration`. The endpoint is unauthenticated and not throttled.
- N4. BE/agent-runtime/agent-query-log.repository.ts:30-43 and agent-runtime.controller.ts:30-36: page and limit get only `ParseIntPipe`. `page=0` gives a negative skip, which Prisma rejects, so the response is a 500. `getByDatasetPaginated` (BE/document/document.service.ts:151-157) clamps only the maximum.
- N5. BE/agent-runtime/agent-runtime.service.ts:225 detects out-of-credits with `instanceof ForbiddenException`. Any other Forbidden is reported as "Insufficient credits" and logged as OUT_OF_CREDITS. Use a dedicated error class.
- N6. BE/conversation/guard/conversation-access.guard.ts:49-58 ignores `:agentId` (conversation.controller.ts:56-60). The route accepts any agentId in the path.
- N7. BE/agent-runtime/agent-runtime.orchestrator.ts:90-93 emits AGENT_QUERY_COMPLETED with no listener. The listener file registers only deployed and status-changed events.
- N8. Config is read per request with `getOrThrow` (BE/auth/auth.service.ts:36, 62, 159, 204; BE/auth/token.service.ts:110, 160, 190; BE/document/document.service.ts:198), so a missing variable is a 500 at first use, not a boot failure. `new OAuth2Client()` is built on every Google login (auth.service.ts:152).
- N9. Credit and plan enums: `CreditTransactionType.USAGE` and `PURCHASE` are never written, and `Workspace.plan` never changes after creation. There is no Stripe code in the backend (only a spec fixture). The CLAUDE.md "Crédits & billing → Stripe" row describes a flow that does not exist yet.
- N10. `DocumentProcessor.extractErrorMessage` (BE/document/document.processor.ts:46-54) stores the engine's `detail` in `indexError`, which workspace users can read.

## Verification gaps

- No test exercises the real guard chain across tenants. B-48 is still open.
- No contract test runs against a real engine (finding 2). The versioned engine lacks the back-end's endpoints and event format, so the back-end's end-to-end path cannot be exercised from this checkout.
- The billing specs (usage-tracker, sinks, processor) cover the happy path only. None covers findings 1, 3 or 4.
- Not verified: how Sentry serializes AxiosError. `error.config` carries the `X-API-Key` header, and engine errors reach `AllExceptionsFilter` unwrapped (BE/rag-engine/rag-execution.service.ts). Also not verified: the `RAG-GenRag` clone (absent) and the deployed migration state (finding 15).

## Verified as fixed (not re-reported)

B-01 (onboarding agent check, onboarding.service.ts:255), B-02 (aud and email_verified check, auth.service.ts:158-166), B-03 (activate scoped by agent, workflow.repository.ts:41), B-05 (tsbuildinfo untracked), B-07 (isSafeModelId, rag-execution.service.ts:15-19), B-08 (StringDecoder, ndjson-line-buffer.ts:88-91), B-09 (interceptor.service.ts:150-165), B-10 (formula neutralization in agent-export), B-11(1) (profile email normalization), B-12 (RESERVED_STEP_DATA_KEYS), B-14 (ownership check before stream), B-18 (port default), B-31 (partial).

## Open prior items re-confirmed

- B-04: `SameSite=None` cookie with no CSRF protection (BE/auth/auth.service.ts:47-52). Form-encoded POSTs are accepted because `main.ts` does not restrict body parsing. This is the highest-impact open item.
- B-13: no global ThrottlerGuard (BE/app.module.ts:71), and the in-memory store is per instance.
- B-15: `text/html` is served from S3 with no Content-Disposition (BE/storage/s3.strategy.ts:52-54).
- B-16: documents are identified by name in the engine (see findings 6 and 11).
- B-17: base64 payload kept in failed jobs (BE/document/document.service.ts:122).
- B-19: sessions survive a password change (BE/users/users.service.ts:76-89).
- B-20: Sentry at 100% sampling (BE/sentry/instrument.ts:6).
- B-21: see finding 1.
- B-24: missing indexes, and no single-active-workflow constraint (see finding 13).
- B-26: `/docs` public (BE/main.ts:37). B-27: no helmet.
- B-30: export controller duplicates the query and pairing logic (see S4 and S5).
- B-34: 180 credits per new workspace.
- B-35: S3 objects and vectors are not deleted on user, workspace or agent deletion (BE/users/user.repository.ts:192-214).
- B-36: see finding 3e. B-37: see S1.
- B-42: lockout keyed only by email (BE/auth/login-attempt.service.ts:19-21).
- B-43: enumeration on register and member add (see N1).
- B-44: OTP HMAC keyed with `JWT_SECRET` (BE/auth/token.service.ts:99-103).
- B-46: the 120 s axios timeout covers headers only (BE/rag-engine/rag-execution.service.ts:181).
- B-11(2): email change with no re-verification (BE/users/users.service.ts:54-67).
