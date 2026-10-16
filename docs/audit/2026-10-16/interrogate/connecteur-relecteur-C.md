## Findings

### 1. [warning] Re-sync deletes the working document before the new version is known to be ingestible
**Location**: plateform_back/src/connector/connector.service.ts:92-98 (syncGoogleDrive), plateform_back/src/document/document.service.ts:79-88 and 96-99 (ingestFile validation and name check)
**Finding**: sync downloads, then calls `documentService.delete(doc.id)` (RAG engine vectors + S3 object + DB row) and only then `ingestFile`. The deterministic checks in `ingestFile` run after the delete: empty buffer, `matchesDeclaredType` magic bytes, and the `findByName` conflict. The `shortcut:` comment only acknowledges "re-ingest fails".
**Evidence**: A Drive file renamed to the name of another document of the dataset has a newer `modifiedTime`. `download()` passes, `delete(doc.id)` removes the old document and its vectors, then `ingestFile` throws `ConflictException` (findByName hits the other document). The user gets a "failed" line, the agent has silently lost the document, and the next sync cannot restore it because there is no row left. The same happens for a Drive file whose content no longer matches its MIME type (for example a .docx replaced by a non-zip) or that was emptied. The 15 MB, MIME and magic-byte checks are pure functions of data already in memory before the delete.
**Suggestion**: Extract the validation and name-conflict check into a `DocumentService.assertIngestable(datasetId, file, { replacingId })` and call it before the delete. Better, add `replaceFile(docId, ...)` that ingests the new row and deletes the old one only once the new one is created (the unique index on `(datasetId, name)` needs the old row excluded or renamed).

### 2. [warning] An expired token mid-run throws away the report of the files already processed
**Location**: plateform_back/src/connector/connector.service.ts:114-117 (toFailure rethrow), :46-66 and :84-105 (loops)
**Finding**: `toFailure` rethrows `DriveAccessExpiredException` from inside the `catch` of the loop. The partially filled `result` is discarded and the client receives a 400.
**Evidence**: Import of 20 files with a token that expires after file 8 (Google tokens last about 1 hour, but a Picker left open or a slow run is enough): 8 files are stored and queued for indexing, the response is a 400, and the front shows "Import depuis Google Drive impossible". The user retries and gets "Déjà importé" for the 8 files. In sync, documents 1..n may already have been replaced when the 401 hits. The spec test "should stop the whole run" only asserts that the exception propagates, so this behaviour is pinned rather than checked for harm.
**Suggestion**: Stop the loop but return the partial result with a flag such as `{ imported, failed, aborted: 'ACCESS_EXPIRED' }`, or add the remaining files to `failed` with the expiry reason.

### 3. [warning] The OAuth access token travels in the JSON body, which Sentry captures with request data on any 5xx
**Location**: plateform_back/src/connector/dto/google-drive.request.ts:15-21, plateform_back/src/exeptions/interceptor.service.ts:21-23, plateform_back/src/sentry/instrument.ts:3-9
**Finding**: The "never stored, never logged" guarantee holds for the app code, but not for Sentry. `AllExceptionsFilter` calls `Sentry.captureException` for every non-HttpException and every 5xx. `Sentry.init` uses default options: no `beforeSend`, no `sendDefaultPii` or `dataCollection` handling, and `tracesSampleRate: 1.0`.
**Evidence**: Path: `POST .../connectors/google-drive/import` with `{ accessToken, fileIds }`, then for example a Prisma error in `getByDataset` (the first call of `importFromGoogleDrive`), then a 500, then `Sentry.captureException`. The Node SDK request-data integration attaches `req.body` by default. Sentry's server-side default scrubber matches key names such as `password`, `secret`, `api_key`, `access_token`, `auth`, but the key here is the camelCase `accessToken`, which I do not believe the default list matches. I could not verify the project's server-side data-scrubbing settings, so treat this as likely rather than confirmed. A 1-hour token with `drive.file` reads every file the user picked, so a Sentry leak is not negligible.
**Suggestion**: Send the token in an `Authorization`-style header (headers are stripped by default) or add a `beforeSend` that deletes `request.data.accessToken`. Add a test asserting the scrub.

### 4. [warning] Outgoing Drive calls have no timeout and all the work runs in one unbounded HTTP request
**Location**: plateform_back/src/connector/google-drive.client.ts:64-70 (`fetch` without `signal`), connector.service.ts:84-105 (sync loop without cap)
**Finding**: `fetch` is called without `AbortSignal.timeout`. Import is capped at 20 files, but sync iterates over every GOOGLE_DRIVE document of the dataset (no cap, one metadata call per document, plus download, delete and ingest for each changed one). The `shortcut:` says "past ~100 documents" but nothing enforces it.
**Evidence**: A Drive call that stalls hangs the request indefinitely, since Nest has no default request timeout. The sequential loop of 20 downloads of up to 15 MB plus S3 puts takes well beyond typical proxy limits (Vercel/ELB 30-60 s). The client gets a gateway error while the server keeps importing, and a retry then reports "Déjà importé". The `@Throttle` of 10/min per IP does not serialize two simultaneous syncs of the same dataset. Both read the same document snapshot, both download, and one then fails on `delete` with "Document not found".
**Suggestion**: Add `AbortSignal.timeout(...)` on every Drive request and a hard cap on documents per sync call. A per-dataset lock (Redis `SET NX`) would stop import and sync overlapping.

### 5. [warning] Deleted, trashed or unexportable Drive files are not really handled, and the error is mislabelled
**Location**: plateform_back/src/connector/google-drive.client.ts:5 (`FILE_FIELDS`) and :66-68, connector.service.ts:110-114
**Finding**: (a) `FILE_FIELDS` does not request `trashed`, and Drive returns 200 for a trashed file, so a file moved to the bin stays "unchanged" (trashing does not reliably bump `modifiedTime`) or is re-imported, and its content stays indexed and answerable forever. (b) A file deleted or unshared yields 404/403, so the document stays in the dataset, marked failed on every sync, with no persisted state (no column or status), so the UI cannot show "source missing". (c) Every 403 is mapped to `DriveFileUnavailableError` and displayed as "supprimé, plus partagé ou quota". But 403 also covers `exportSizeLimitExceeded` (Docs over 10 MB, a likely case), disabled Drive API and `userRateLimitExceeded`. A 429 falls through to a generic `Error` and shows "Erreur inattendue", logged at error level.
**Evidence**: The only deleted-file test asserts the document is kept (connector.service.spec.ts:196). The spec's "idempotent, deleted/renamed handled" requirement is only met for rename.
**Suggestion**: Request `trashed`, and treat it like a 404. Parse the Google error `reason` from the response body to map `exportSizeLimitExceeded` / rate limit to specific messages. Decide explicitly what a missing source does (keep, flag, or remove) and record it.

### 6. [warning] Analytics now depends on the whole runtime module, and the health query re-resolves workflows and logs on every poll
**Location**: plateform_back/src/agent-analytics/agent-analytics.module.ts:13, agent-analytics.service.ts:48-51, agent-runtime.builder.ts:55-61, plateform_front DocumentHealthCard.tsx (5 s polling)
**Finding**: To reuse `resolveDatasetIds`, `AgentAnalyticsModule` imports `AgentRuntimeModule` (orchestrator, credits, conversation, query logs) and `AgentRuntimeModule` exports `RagPipelineBuilder`. This is a heavy coupling for a read-only stats module, and a circular import risk if the runtime ever consumes analytics. `getDocumentHealth` is now: production version lookup, workflow fetch, attached datasets query, then the groupBy. The front polls it every 5 s while any document is UPLOADED/PROCESSING (which an import of 20 Drive files makes common). `resolveOrgIdsForAgent` also does `logger.warn` for every ignored dataset id, so a stale `datasetIds` entry in a retrieve block produces a warning line every 5 s per open card.
**Evidence**: Call chain: card poll, `AgentAnalyticsService.getDocumentHealth`, `RagPipelineBuilder.resolveDatasetIds`, `loadRawBlocks`, `resolveOrgIdsForAgent`. Naming also conflates "org ids" (RAG engine identifiers) and dataset ids: the analytics repo filters `datasetId in orgIds`, which is only correct because `org_id == datasetId` today.
**Suggestion**: Move dataset resolution to a small provider in `dataset/` (or export the builder from a leaner module). Rename the method to return dataset ids, and downgrade the warn to debug in the read-only path.

### 7. [nit] Size limit relies on Drive metadata, and the body is buffered without a cap
**Location**: plateform_back/src/connector/connector.service.ts:121-122, google-drive.client.ts:55
**Finding**: `Number(file.size ?? 0) > MAX_FILE_SIZE` lets a binary file with no `size` field through. Google-native exports have no size at all and are fully buffered with `Buffer.from(await response.arrayBuffer())` (two copies in memory) before `ingestFile` finally enforces 15 MB on the real buffer. Practical risk is bounded (Google caps exports at 10 MB, 20 files per import), so this is hygiene rather than an exploit.
**Suggestion**: Reject when `size` is missing for non-native files, and stream the body with a byte counter that aborts above `MAX_FILE_SIZE`.

### 8. [nit] Misleading conflict message for a concurrent duplicate Drive import
**Location**: plateform_back/src/document/document.service.ts:111-118
**Finding**: The `P2002` branch always reports "Un document nommé « X » existe déjà". With this PR a P2002 can also come from the new `(datasetId, source, externalId)` unique index (two concurrent imports of the same file passing the stale `alreadyImported` snapshot). The user then sees a name conflict for a file that was simply imported twice.
**Suggestion**: Inspect `error.meta.target` and return "Déjà importé dans cette base" for the externalId index.

### 9. [nit] Queue concurrency is coupled to a constant in another repo, and is per instance
**Location**: plateform_back/src/document/document.processor.ts:11-13
**Finding**: `concurrency: 5` is justified by a comment about `rag-engine/app/main.py num_workers=5`. BullMQ concurrency is per process, so two back replicas give 10 concurrent jobs against 5 engine workers, and the retry/backoff logic (5 attempts) will amplify timeouts. This is a hardcoded magic number that can silently drift. A 20-file Drive import now also saturates the engine for all other tenants.
**Suggestion**: Read it from config (`DOCUMENT_INDEX_CONCURRENCY`) and document the per-instance semantics.

### 10. [nit] Verification gaps in the tests
**Location**: plateform_back/src/connector/test/connector.service.spec.ts
**Finding**: No test covers: token expiry after a partial success (finding 2), ingest failure after the delete in sync (finding 1, the test at :174 only covers a download failure, which is the safe case), trashed files, a `size`-less binary file, concurrent import and sync, or a Sentry/log scrub of the token. `ConnectorController` (guards, throttle, DTO validation of `fileIds`, 20-item cap, unique constraint) has no test at all, so the cross-tenant guard chain (`WorkspaceMemberGuard` + `DatasetBelongsToWorkspaceGuard` on the new route) is only verified by reading.

## Checked, no problem found
- SSRF: the host is fixed (`www.googleapis.com`), `fileId` is validated by `^[\w-]+$` and `encodeURIComponent`d, and `doc.externalId` comes from the DB.
- Cross-tenant: both new routes sit behind JwtAuthGuard, WorkspaceMemberGuard and DatasetBelongsToWorkspaceGuard, and sync only touches documents of `datasetId`.
- Token in logs and DB: not persisted. `logger.error(error)` in `toFailure` receives fetch errors that do not carry the header. The pino serializers drop the body. The only leak path I found is Sentry (finding 3).
- Upload path: validation moved into `ingestFile` keeps the same checks and order. The multer limit (`MAX_FILE_SIZE`) is unchanged.
- X-API-Key on the job status poll is a correct fix.
