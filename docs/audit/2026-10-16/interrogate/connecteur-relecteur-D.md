# Interrogate review: PR #93 Google Drive connector (904c1d3..fcba1e8)

Reviewer D. Read-only. Paths are relative to the repo root.

## Findings

### 1. [critical] Sync deletes the existing document before the replacement is proven ingestable
**Location**: plateform_back/src/connector/connector.service.ts:94-97 (delete at 96, re-ingest at 97); plateform_back/src/document/document.service.ts:89-90 (quota), :99 (name conflict), :104 (storage put), :124-126 (touchDataset, queue.add)
**Finding**: `syncGoogleDrive` calls `documentService.delete(doc.id, datasetId)` and only then `ingestFile(...)`. Every rejection `ingestFile` can raise after the delete leaves the dataset without the document: the quota check (`usedStorage + file.size > MAX_DATASET_STORAGE_BYTES`, where the old version's bytes are already freed, so a Drive file that grew can still fail), the name-conflict check (`findByName`, reached when a Drive rename lands on a name another document in the dataset already uses), the content-signature check (`matchesDeclaredType`, which `download()` does not run), a storage `put` failure, and a `queue.add` failure at line 126 (the row already exists, stuck in UPLOADED).
**Evidence**: Trace: sync loop (line 78) -> `delete` (line 96) removes the RAG document, the S3 object and the DB row -> `ingestFile` (line 97) throws -> caught at line 100 and reported as a failure. The next sync reads `getByDataset` (line 80), which no longer contains the row, so the loop never revisits it. The only recovery is a manual re-import through the Picker. A process restart between lines 96 and 97 has the same result. The only failure-path test (connector.service.spec.ts:174) covers a download failure, which happens before the delete. Nothing tests an ingest failure after the delete, so the data-loss path is not covered by CI.
**Suggestion**: Run every `ingestFile` rule against the replacement before deleting, with the old document excluded: size against quota net of `doc.size`, name conflict ignoring `doc.id`, signature, MIME. Then delete and ingest, which narrows the post-delete window to infrastructure failures. The cleaner fix is a `DocumentService.replace(docId, datasetId, file, origin)` that owns that ordering in one place. Add a test where the ingest fails after the delete.

### 2. [warning] Token expiry aborts the run, drops the results of files already processed, and leaves the UI stale
**Location**: plateform_back/src/connector/connector.service.ts:119 (`toFailure` rethrows), :43-63 (import loop), :78-101 (sync loop); plateform_back/src/connector/connector.controller.ts:26,35; plateform_front/src/services/connector/connector.ts:29,38 (`invalidatesTags`); plateform_front/src/hooks/connector/useGoogleDrive.ts:73,87 (error path)
**Finding**: On `DriveAccessExpiredException` the whole method rejects. The 400 response carries no counts. Files already ingested (import) or already deleted and re-ingested (sync) are not reported. RTK Query applies `invalidatesTags` only on a fulfilled mutation, so the document list is not refreshed. After a sync, the list still shows the old row, whose document no longer exists (opening it returns 404), and the new versions do not appear until a reload. The user is shown "Import depuis Google Drive impossible" for a run that changed data.
**Evidence**: `toFailure` line 119 `throw error` is reached from the catch blocks at lines 61-62 and 99-100, which aborts the method. The controller returns it as a 400 through `AllExceptionsFilter`. The mutation rejects, and `invalidatesTags` is skipped.
**Suggestion**: Stop the loop and return the partial result with an `expired: true` flag, marking the remaining files as failed with a reason. Then the response always describes what changed. Keep the 400 only when nothing was processed. On the front, refresh the dataset tags on the error path too.

### 3. [warning] Drive HTTP errors are collapsed into one "inaccessible" bucket, and failures are labelled by raw id
**Location**: plateform_back/src/connector/google-drive.client.ts:70 (`403 || 404 -> DriveFileUnavailableError`); plateform_back/src/connector/connector.service.ts:121-124 (message), :44 (`let name = fileId`)
**Finding**: 403 and 404 are treated the same. Drive also returns 403 for rate limits (`userRateLimitExceeded`, `rateLimitExceeded`), for download quota, and for exports over the size limit. Google documents a 10 MB cap on `files.export`, so a large Google Doc or Slides deck gets "supprimé, plus partagé avec ce compte, ou quota Google atteint", which is the wrong reason. A rate limit hit mid-run marks every remaining file as inaccessible, with no retry and no stop. In the import loop, a metadata failure is reported under the raw Drive id (`name = fileId`), which is the case where the user most needs a readable name.
**Evidence**: `request()` (lines 65-72) never reads the response body, so Drive's `error.errors[].reason` is lost. Lines 44 and 62 show the id fallback.
**Suggestion**: Parse the reason from the JSON body. Map `exportSizeLimitExceeded` to a specific "trop volumineux pour l'export (10 Mo)" message. Map rate-limit reasons to "réessayez plus tard" and stop the run as with an expired token. Keep "inaccessible" for file-level 403/404. Send the picker's `docs[].name` from the front so failures can be labelled before any Drive call.

### 4. [warning] No per-request timeout, no byte cap on reads, no deadline or cap on the sync loop, and no guard against double clicks
**Location**: plateform_back/src/connector/google-drive.client.ts:56 (`arrayBuffer()` reads the whole body), :66 (`fetch` without `signal`); plateform_back/src/connector/connector.service.ts:77-78 (sync over every Drive document of the dataset); plateform_front/src/components/Dataset/Detail/DatasetSourcesTab.tsx:135-136 (`isLoading` only, the button is not disabled while the Google popup is open)
**Finding**: A stalled Drive response holds the request with no limit. `download()` buffers the whole body before `ingestFile` applies its 15 MB check. For exports, the only bound is Google's own cap, which the code does not enforce. Sync has no document count limit: a dataset with 300 Drive documents runs about 600 sequential Drive calls inside one HTTP request. The comment at line 77 says "past ~100", but nothing enforces it. When the client gives up (proxy timeout), Node does not cancel the handler, so the loop keeps deleting and re-ingesting after the user sees an error. A second click starts a second run, because the button is not disabled while the popup is open.
**Evidence**: The loop at lines 78-101 has no break and no deadline. Line 66 has no `AbortSignal`. Concurrent runs are mostly contained by the unique indexes and by `delete` returning NotFound, but they produce spurious "Document not found" failures and double the Drive load.
**Suggestion**: Use `signal: AbortSignal.timeout(30_000)` per call. Stream the body through a byte counter capped at `MAX_FILE_SIZE`. Cap documents per sync call, or move both loops into a BullMQ job keyed by dataset, which also gives at most one run per dataset. The shortcut comments already plan the job. Disable the sync button while a run or popup is pending.

### 5. [warning] Documents stuck in UPLOADED make sync refuse them forever, and the health card polls forever
**Location**: plateform_back/src/document/document.service.ts:124-126 (`touchDataset` and `queue.add` with no compensation after `create`); plateform_back/src/connector/connector.service.ts:81-83 (skip with "réessayez dans quelques minutes"); plateform_front/src/components/Agents/Analytics/DocumentHealthCard.tsx:31,36 (5 s polling while uploaded + processing > 0)
**Finding**: If `queue.add` throws after the row is created, the row stays UPLOADED with no job, and nothing moves it to FAILED. The upload path has the same gap, but this PR makes it visible. Sync refuses such a document with a message promising a retry that will never happen, and it never calls the existing `retry` path. The health card polls every 5 s with no cap for as long as any document is UPLOADED or PROCESSING, so one stuck row keeps the analytics page polling the endpoint, which now also loads workflow definitions (about four queries per call).
**Evidence**: Lines 107-126 of `ingestFile` have no try/catch around `documentQueue.add`. Line 82 of the sync loop skips the document unconditionally for UPLOADED/PROCESSING.
**Suggestion**: On `queue.add` failure, set the row to FAILED, mirroring the storage cleanup on create failure. In sync, treat UPLOADED/PROCESSING rows older than a threshold as stale: retry them or report an actionable message. Cap the health polling, for example by stopping after a few minutes.

### 6. [warning] Analytics now depends on the runtime builder, and the dataset rule lives in the wrong layer
**Location**: plateform_back/src/agent-analytics/agent-analytics.service.ts:24,50 (`RagPipelineBuilder` injected, `resolveDatasetIds` called); plateform_back/src/agent-analytics/agent-analytics.module.ts:13,37 (imports `AgentRuntimeModule`); plateform_back/src/agent-runtime/agent-runtime.module.ts:37 (exports `RagPipelineBuilder` for this one caller); plateform_back/src/agent-runtime/agent-runtime.builder.ts (`resolveDatasetIds`, `loadRawBlocks`)
**Finding**: A health statistic in analytics pulls the whole agent-runtime module (its providers, the usage-recording processor, the streaming forwarder) into the analytics graph, and makes the builder a public export for that single caller. "Which datasets does the deployed retriever search" is dataset resolution, and `DatasetService.resolveOrgIdsForAgent` already owns that rule. The new method is a second place where it is assembled. The `getDocumentStatusCounts` `where` change and `getDocumentHealth` have no tests: `agent-analytics/test/` only has a repository spec, and it does not cover `getDocumentStatusCounts`.
**Evidence**: `RagPipelineBuilder` is in `AgentRuntimeModule.exports` (line 37) and is injected only in `AgentAnalyticsService` (line 24) among the modules shown.
**Suggestion**: Move `resolveDatasetIds` into the dataset module (or a small resolver it owns) that both the builder and analytics import, and drop the `AgentRuntimeModule` import from analytics. Add a repository test for `datasetId: { in: [] }` returning zero, and a service test for `getDocumentHealth`.

### 7. [warning] Two near-identical loops, two validation layers, and two sources of truth for file size
**Location**: plateform_back/src/connector/connector.service.ts:42-63 and :78-101 (loops); :106-114 (`download` checks MIME and size from metadata); plateform_back/src/document/document.service.ts:27-32 (`IngestFileInput` has both `buffer` and `size`), :79-87 (re-checks MIME and size on the buffer), :90 (quota uses `file.size`); plateform_back/src/connector/google-drive.client.ts:61 (`size: buffer.length`)
**Finding**: `ingestFile` checks `buffer.length` against `MAX_FILE_SIZE` but uses `file.size` for the quota. Nothing enforces that the two agree. The connector sets both from the same buffer today, but any caller can make them diverge and bypass one check. The MIME allowlist is checked in `download()` and again in `ingestFile`. Both loops repeat the same getFile, try, ingest, toFailure shape.
**Evidence**: `IngestFileInput.size` is a second field for information the buffer already carries. Lines 111 and 63 of the two files show the duplicated checks.
**Suggestion**: Drop `size` from `IngestFileInput` and use `buffer.length`. Extract one `assertIngestable({ mimeType, size })` shared by the metadata pre-check and `ingestFile`. Extract one `processDriveFile(datasetId, token, file, existingDocId?)` helper called by both loops.

### 8. [warning] Ad-hoc special case in the retriever tab: the first base is special-cased in three places, one of them by swapping the callback
**Location**: plateform_front/src/components/Agents/Workflow/NodeModalContent/Datasets/RetrieverDatasetsTab.tsx:22 (`noop`), :50-51 (`isAddingFirstBase` swaps `onAdd` for `noop`), :63 (button gated on `others.length`), :120-122 (picker hidden or relabelled)
**Finding**: The rule "attaching the first base does not restrict the retriever" is spread across three conditionals in one component. It is implemented by replacing the pick callback with `noop`, so the attach path silently drops `onAdd`. Any future logic in `onAdd`, such as a dirty flag or a toast, will be skipped for the first base without warning. This is the branching-in-random-places pattern the lens calls out.
**Evidence**: Lines 50-51 compute the flag and pass `noop`. Lines 63 and 120 each re-derive the same state.
**Suggestion**: Compute one value, for example `mode: "first" | "limit"`, and let the pick handler decide whether to call `onAdd`, instead of swapping callbacks. Derive the three UI variants from that value.

### 9. [nit] The picker shows folders that the backend cannot import
**Location**: plateform_front/src/lib/googlePicker.ts:79 (`setIncludeFolders(true)`)
**Finding**: A selected folder id reaches the backend, and `download()` rejects it with "Type de fichier non supporté" for each folder. The user sees a per-folder failure with no explanation.
**Suggestion**: Either hide folders (`setIncludeFolders(false)`) or expand them server-side. Decide explicitly rather than leaving the mismatch.

### 10. [nit] Outcome categories and messages are wrong in three places
**Location**: plateform_back/src/connector/connector.service.ts:49-52 ("Déjà importé" pushed into `failed`); plateform_back/src/document/document.service.ts:119 (any P2002 on create is reported as a name conflict); plateform_front/src/hooks/connector/useGoogleDrive.ts:82 (`pluralize(unchanged, "déjà à jour", "déjà à jour")`)
**Finding**: A no-op skip is counted as a failure, so the toast shows it as a warning. The P2002 mapping also fires for the `[datasetId, source, externalId]` unique index, which a double-import of the same Drive file hits, so the user is told the wrong constraint was violated. The pluralize call passes the same string for both forms.
**Suggestion**: Add a `skipped` bucket. Check the constraint name or the target before mapping P2002 to a name conflict. Write the plain string.

### 11. [nit] Concurrency raised from 2 to 5 with a hard-coded value taken from another file
**Location**: plateform_back/src/document/document.processor.ts:12 (`concurrency: 5`), comment citing rag-engine/app/main.py (`num_workers=5`)
**Finding**: The effective load on the RAG engine is 5 times the number of backend replicas. The coupling to another file is only a comment.
**Suggestion**: Make it an environment setting, for example `DOCUMENT_INDEXING_CONCURRENCY`, so the coupling is explicit and tunable.

### 12. [nit] Access token reaches Redux action history
**Location**: plateform_front/src/hooks/connector/useGoogleDrive.ts (token passed as the RTK mutation argument)
**Finding**: RTK does not keep mutation args in the `mutations` slice (`node_modules/@reduxjs/toolkit/src/query/core/buildSlice.ts:421-435` stores only requestId, status, endpointName, startedTimeStamp). The `mutationThunk/pending` action does carry `meta.arg.originalArgs`, including `accessToken`, and Redux DevTools shows it in development. Low risk, but it contradicts "never stored".
**Suggestion**: Accept it as-is, or use a non-RTK call for the token-bearing request.

### 13. [nit] Naming and DTO base class
**Location**: plateform_back/src/connector/dto/google-drive.request.ts:14,22 (`GoogleDriveImportRequest extends GoogleDriveSyncRequest`); plateform_back/src/connector/google-drive.client.ts:59 (`${file.name}${exported.extension}`)
**Finding**: The import DTO inherits from a class named for sync, though it is really the shared auth envelope; rename to `GoogleDriveAuthRequest`. The export filename appends `.pdf` unconditionally, so a Doc named "rapport.pdf" becomes "rapport.pdf.pdf". The manual import accepts files by extension as well as MIME (`plateform_front/src/hooks/useUploadDocuments.ts`, `isAcceptedFile`), but the connector keys only on the MIME Drive reports, which may be `application/octet-stream` for some `.md` or `.txt` files. Those would be filtered out of the Picker and rejected. This last point is unverified against live Drive metadata.
**Suggestion**: Rename the base class. Append the extension only when the name does not already end with it. Verify Drive's reported MIME for `.md` and `.txt` before deciding whether the connector needs an extension fallback.

## Checked without a finding

- Guard chain on both routes (`JwtAuthGuard`, `WorkspaceMemberGuard`, `DatasetBelongsToWorkspaceGuard`), and every repository call is scoped by `datasetId`. No cross-workspace path found.
- No SSRF surface: import ids are regex-validated (`google-drive.request.ts`), encoded with `encodeURIComponent`, and the base URL is fixed.
- The token is not stored or passed to the document layer. Pino serializers log only the URL path. Sentry request bodies are gated by `httpBodies` (SDK defaults, `sendDefaultPii` not set), so the token is not expected in events.
- Import dedupe is backed by the unique index `[datasetId, source, externalId]` (`plateform_back/prisma/schema/document.prisma:35`), so concurrent imports cannot create duplicates.
- Re-sync is idempotent when nothing changed (`modifiedTime <= externalModifiedAt` short-circuits, lines 85-88), and concurrent sync runs cannot double-ingest the same row, because only one `delete` of a given id succeeds.
- Upload path behaviour is preserved: the controller checks moved into `ingestFile` keep the same messages and order for empty and MIME errors.
- The RAG `X-API-Key` header on job polling and the `indexDocument` timeouts are consistent with the rest of the service.
- The analytics `where` change and the builder's `resolveOrgIdsForAgent` semantics agree (an empty `datasetIds` falls back to all attached datasets in both).

## Summary

Highest priority: finding 1 (sync can permanently delete a document and nothing recovers it) and finding 2 (partial runs are reported as failures and the list goes stale). Both sit in the sync and import flows that the intent asks to be correct. Findings 3 to 5 are reliability and error-reporting gaps on the same paths.
