# Reviewer B — PR #93 Google Drive connector (diff 904c1d3..fcba1e8)

All locations are at fcba1e8 (`git show fcba1e8:<path>`). The checked-out branch (`fix/claude-audit-refacto`) is 5 commits ahead, so line numbers can differ there.

## Findings

### 1. [critical] Re-sync deletes the document before the checks that can reject its new version, so a deterministic failure removes it for good
**Location**: plateform_back/src/connector/connector.service.ts:92-97 (and :106-115), plateform_back/src/document/document.service.ts:79-123, :223-237
**Finding**: `syncGoogleDrive` downloads the new version, then calls `documentService.delete(doc.id)`, then `ingestFile`. The pre-download check `download()` (:106-115) only covers the Drive metadata (MIME type in `GOOGLE_EXPORTS`/`ALLOWED_MIME_TYPES`, `size` <= 15 MB). Every other rejection in `ingestFile` runs **after** the delete:
- `findByName` conflict (:99-101). Concrete case: the Drive file was renamed (a rename is a Drive change) to a name another document of the dataset already uses, for example a manual upload `Rapport.pdf` while the Google Doc is now titled `Rapport` (exported as `Rapport.pdf`). See also finding 2, which makes these collisions common.
- quota (:89-94). Deleting the old version frees its size, but a bigger new version can still go over `MAX_DATASET_STORAGE_BYTES`.
- `matchesDeclaredType` (:85). For example, a `.txt`/`.md` file in Drive that now contains a NUL byte.
- infrastructure errors: `storage.put`, `documentRepository.create`, `documentQueue.add`. If `documentQueue.add` fails, the row and the S3 object even stay behind with status UPLOADED and are never indexed.
`delete()` has already removed the vectors from the RAG engine (`ragEngineService.deleteDocument`), the S3 object and the row. So the deployed agent loses the document right away.
**Evidence**: The run goes `sync` → `download` (metadata checks only) → `delete` (engine, storage, row) → `ingestFile` → throws `ConflictException`/`BadRequestException` → `toFailure` reports `{name, reason}`. The next sync reads `getByDataset(..., GOOGLE_DRIVE)`, the document is no longer there, and nothing re-imports it. The sync is therefore not idempotent and not self-healing, which goes against the "re-sync idempotent" intent. The `shortcut:` comment (:94-95) treats this as rare, but the triggers above are ordinary user actions (rename, growing file). No test covers it: the spec's sync cases are "unchanged", "replace", "download fails", "indexing running" and "deleted from Drive". None of them is "ingest refuses after delete".
**Suggestion**: Split `ingestFile` into a pure `assertIngestable(datasetId, file, { replacing?: doc })`: content checks, quota computed as `used - doc.size + file.size`, and a name conflict check that ignores `doc.id`. Call it before `delete`. Better still, replace in place: put the new S3 key, `update` the row (name, size, storageKey, external*, status=UPLOADED), queue indexing, then delete the old engine entry and the old S3 key. Add the "rename into an existing name" test.

### 2. [warning] Drive titles go through `sanitizeFilename`'s `basename`: every title containing `/` is cut down to its last segment, which creates garbage names and collisions
**Location**: plateform_back/src/connector/google-drive.client.ts:59; plateform_back/src/lib/filename.util.ts (`basename(name).replace(/[^\w.-]/g, '_')`); document.service.ts:96-101
**Finding**: A Drive title is not a path, and `/` is legal and common in it, especially in Google Docs with dates. `download()` builds `filename = \`${file.name}.pdf\`` and `ingestFile` then applies `basename`:
- `CR réunion 12/03/2026` becomes `2026.pdf`.
- `Point 19/03/2026` also becomes `2026.pdf`. The second import is refused with "Un document nommé « 2026.pdf » existe déjà".
- `Notes 2024/` becomes `.pdf`.
`[^\w.-]` also turns every accented letter into `_`. So the name the engine cites in answers and shows in the UI (`2026.pdf`) has nothing to do with the document.
**Evidence**: `path.basename('CR 12/03/2026.pdf') === '2026.pdf'`. The RAG engine keys documents on `(org_id, filename)` (comment at document.service.ts:98). Collisions therefore show up as refused imports (finding 1 turns them into deletions during a sync). `sanitizeFilename` itself already existed, but this PR sends it a new kind of input: free-text titles instead of browser `File.name` values, which never contain `/`.
**Suggestion**: For connector origins, replace path separators instead of taking the basename (for example `name.replace(/[\\/]/g, '-')`, then the character filter). Better: keep the display `name` separate from a unique engine/storage key built from the document id. That also removes the name-uniqueness constraint that makes connectors fragile.

### 3. [warning] The Google access token is attached to Sentry events for these routes
**Location**: plateform_back/src/connector/dto/google-drive.request.ts:14-20 (`accessToken` in the JSON body); plateform_back/src/sentry/instrument.ts (no `httpIntegration`/`beforeSend` options); plateform_back/src/exeptions/interceptor.service.ts:22-24
**Finding**: The intent says "no token leakage in logs/DB/Sentry". `@sentry/nestjs` 10.62 records incoming request bodies (up to 10 KB, default `maxIncomingRequestBodySize: 'medium'`) on the isolation scope. It does this whether or not `sendDefaultPii`/`dataCollection` is set: `requestdata.js` explicitly attaches "body data that's already on the scope" (`include.data: true`). So any error captured during a `/connectors/google-drive/*` request carries `{ accessToken, fileIds }`. That covers any non-HttpException that `AllExceptionsFilter` sends to Sentry, for example a Prisma failure in `getByDataset` at connector.service.ts:36/:70. pino is fine: its `req` serializer drops the body.
**Evidence**: The path is `node_modules/@sentry/core/build/cjs/integrations/http/server-subscription.js:55-56` → `patchRequestToCaptureBody` → `isolationScope.setSDKProcessingMetadata({ normalizedRequest: { data } })` → `requestdata.js:26` "Always attach body data … gates write-time, not read-time". Nothing in `instrument.ts` overrides this. The token is short-lived and scoped to `drive.file`, but it is a live bearer credential for the user's Google account, sent to a third party.
**Suggestion**: In `Sentry.init`, use `integrations: [Sentry.httpIntegration({ ignoreIncomingRequestBody: (url) => url.includes('/connectors/') })]`, or a `beforeSend` that deletes `event.request.data.accessToken`. Either one also covers the existing `/auth/*` passwords.

### 4. [warning] A Drive file moved to the trash is never detected, and a deleted one stays indexed forever
**Location**: plateform_back/src/connector/google-drive.client.ts:5 (`FILE_FIELDS` has no `trashed`); connector.service.ts:86-91, :120-125
**Finding**: `files.get` returns trashed files with 200, and they can still be downloaded until they are permanently deleted. Since `trashed` is not requested, a trashed file counts as "unchanged" (or is re-imported if it was edited) and its content keeps being served by the agent with no signal. After the permanent deletion, the 404 only produces a toast line ("Inaccessible …") on every sync. The spec even pins this ("should report a document deleted from Drive without removing it from the dataset"). Nothing marks the document as stale, so the user has to work out which documents of a 100-document toast to delete by hand. The intent asks for "deleted/renamed Drive files handled".
**Evidence**: The sync loop handles only `modifiedTime` and errors. No field of `Document` records "source gone", and `DocumentStatus` has no such state.
**Suggestion**: Request `trashed` and treat `trashed === true` like a 404. For gone files, either delete them (with a confirmation in the front) or store a flag (`externalMissingAt`) and surface it in the documents list, instead of a transient toast.

### 5. [warning] Long synchronous request with no timeout or abort; a proxy timeout or an expired token throws away the partial result
**Location**: plateform_back/src/connector/google-drive.client.ts:65-72 (`fetch` with no `signal`); connector.service.ts:43-64, :78-103, :119
**Finding**: One HTTP request does up to 20 × (metadata call + download of up to 15 MB + S3 put + DB + queue), sequentially. A sync does it for every Drive document. No `AbortSignal.timeout` is set, so a stalled Drive response holds the request until undici's 300 s defaults, and the work is not cancelled when the client goes away. When a proxy or load balancer times out first, the front shows "Import depuis Google Drive impossible" while the server keeps importing. The user retries and gets "Déjà importé" for every file. Likewise, `toFailure` rethrows `DriveAccessExpiredException` mid-run. The files already imported are then reported as nothing: only a 400 "Accès expiré" comes back. The `shortcut:` comments look at scale (number of files); they do not cover these failure semantics.
**Evidence**: `request()` → `fetch(url, { headers })` with no timeout; `importFromGoogleDrive` returns `result` only after the loop, and the rethrow at :119 escapes the loop.
**Suggestion**: Add `signal: AbortSignal.timeout(30_000)` to Drive calls. On `DriveAccessExpiredException`, stop the loop but return the partial result (for example `failed` filled with the remaining files plus an `accessExpired: true` flag) instead of throwing. Or, as the comment already plans, move to a BullMQ job and poll it.

### 6. [warning] Document health pulls the whole agent runtime module into analytics; the logic that resolves which datasets an agent uses sits in the wrong layer
**Location**: plateform_back/src/agent-analytics/agent-analytics.module.ts:13; agent-analytics.service.ts:48-51; plateform_back/src/agent-runtime/agent-runtime.builder.ts:55-75; agent-runtime.module.ts:37
**Finding**: To read "which datasets does the deployed workflow search", `AgentAnalyticsModule` now imports `AgentRuntimeModule`: orchestrator, SSE controller, usage BullMQ queue and processor, credit, conversation. `RagPipelineBuilder` gains a second public responsibility (`resolveDatasetIds`) that has nothing to do with building a pipeline. "Production workflow version, else active workflow, then its blocks" (`loadRawBlocks`) is workflow-domain logic, and `resolveOrgIdsForAgent` already lives in `DatasetService`.
**Evidence**: The coupling goes analytics → runtime. Any future runtime → analytics dependency (for example recording metrics) becomes a circular import that needs `forwardRef`.
**Suggestion**: Move `loadRawBlocks` to `WorkflowService` (`findDeployedOrActiveBlocks(agentId, forceActive)`) and `resolveDatasetIds` to `DatasetService`. Both the builder and analytics then depend on those, and `AgentRuntimeModule` no longer needs to export the builder.

### 7. [nit] Every Drive 403 is reported to the user as "supprimé / plus partagé"
**Location**: plateform_back/src/connector/google-drive.client.ts:70; connector.service.ts:120-125
**Finding**: Drive also returns 403 for `exportSizeLimitExceeded` (a Google Doc too large to export, 10 MB), `cannotDownloadFile` (downloads restricted by the owner) and `userRateLimitExceeded`. A 429 ends up as "Erreur inattendue". The user is told the file was deleted when it was simply too large or restricted.
**Suggestion**: Read `error.errors[0].reason` from the JSON body and map the export-size and download-restricted reasons to their own messages.

### 8. [nit] The Picker loader can hang forever and leave the Google Drive card stuck on "Import…"
**Location**: plateform_front/src/lib/googlePicker.ts:46-50; plateform_front/src/hooks/connector/useGoogleDrive.ts:47-62
**Finding**: If `api.js` loads but `window.gapi` is undefined (script replaced or blocked by an extension, CSP), `window.gapi?.load(...)` does nothing. The promise then never settles, `pickAndImport` never reaches `finally`, and `isPicking` stays `true`. The card is disabled until the page is reloaded. Since `pickerApi` is cached, later clicks would hang too, but they cannot happen because the card is disabled.
**Suggestion**: `if (!window.gapi) return reject(new Error("Picker"))` in `onload`, plus a load timeout.

### 9. [nit] A concurrent duplicate import is reported as a name conflict
**Location**: plateform_back/src/document/document.service.ts:117-121; prisma/schema/document.prisma (`@@unique([datasetId, source, externalId])`)
**Finding**: The `alreadyImported` set is a snapshot taken at the start of the request. Two imports of the same file at the same time (two tabs) hit the `externalId` unique index, which is correct, but every `P2002` is translated into "Un document nommé « … » existe déjà". The message is wrong when the index that was hit is the external-id one.
**Suggestion**: Check `error.meta?.target` and return "Déjà importé dans cette base" for the external-id index.

### 10. [nit] `@Throttle({ default: { limit: 10, ttl: 60_000 } })` changes nothing
**Location**: plateform_back/src/connector/connector.controller.ts:13-14; app.module.ts:30
**Finding**: `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])` is already the default. The decorator and its comment suggest a stricter, connector-specific limit that does not exist. Given finding 5 (each call can hold minutes of work), a real lower limit, or a per-dataset lock against parallel syncs, would make sense. Otherwise, remove the decorator.

## Checked, no finding
- Cross-tenant access: `JwtAuthGuard` + `WorkspaceMemberGuard` + `DatasetBelongsToWorkspaceGuard` protect both routes, the service only ever uses the route's `datasetId`, and `delete(doc.id, datasetId)` is scoped to the dataset.
- SSRF: the host is fixed (`googleapis.com`). `fileIds` are validated with `^[\w-]+$` and `encodeURIComponent`, and `externalId` comes from Drive's own `file.id`.
- Size and type limits: binary files are checked on `size` before download, exports are capped by Google at 10 MB, below the 15 MB limit. `ingestFile` now re-checks the size, type and signature for every source. The manual upload keeps the same checks, since the controller passes through to `ingestFile`.
- Duplicates: the DB enforces `(datasetId, source, externalId)` uniqueness.
- Google Docs and Slides export to `application/pdf`, which passes `matchesDeclaredType`.
- Sync skips UPLOADED/PROCESSING documents. Retries keep the status at PROCESSING (`retrying`), so a pending BullMQ retry is not raced.
- RTK tags: the connector mutations invalidate the same tags as upload/delete, including the stats query that drives `driveCount`.
- `RetrieverDatasetsTab` first-base `noop` and the `DocumentHealthCard` polling look correct.
- `X-API-Key` on job polling is correct.

Not checked: whether a Drive rename bumps `modifiedTime` (if it does not, renames are never picked up by the sync); behaviour of the real Google Picker and OAuth popup; e2e tests.
