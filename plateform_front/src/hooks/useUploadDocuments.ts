import { useRef, useState } from "react";
import { useUploadDocumentMutation } from "services/document/document";
import { DocumentStatus } from "types/document/document";
import mixpanel from "lib/mixpanel";

export const ACCEPTED_TYPES = [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "text/x-markdown",
    "text/html",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
export const ACCEPTED_EXTENSIONS = [".pdf", ".txt", ".md", ".html", ".htm", ".docx"];

const isAcceptedFile = (file: File): boolean => {
    if ((ACCEPTED_TYPES as readonly string[]).includes(file.type)) return true;
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return ACCEPTED_EXTENSIONS.includes(ext);
};

export enum Status {
    UPLOADING = "uploading",
    PROCESSING = "processing",
    COMPLETED = "completed",
    ERROR = "error",
}

export interface UploadedSource {
    id: string;
    documentId?: string;
    type: "file";
    name: string;
    status: Status;
    progress: number;
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;

const useUploadDocuments = (workspaceId?: string | null, agentId?: string | null, maxFiles = 3, initialCount = 0) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [sources, setSources] = useState<UploadedSource[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadDocument] = useUploadDocumentMutation();
    const cancelledPolls = useRef<Set<string>>(new Set());

    const sessionValidCount = sources.filter((s) => s.status !== Status.ERROR).length;
    const isAtMaxFiles = initialCount + sessionValidCount >= maxFiles;
    const isDone = sources.length > 0;
    const allDone =
        sources.length > 0 && sources.every((s) => s.status === Status.COMPLETED || s.status === Status.ERROR);

    const pollDocumentStatus = (documentId: string, sourceId: string): void => {
        const backendUrl = (process.env.REACT_APP_BACKEND_URL ?? "").replace(/\/$/, "");
        let polls = 0;

        const check = async (): Promise<void> => {
            if (cancelledPolls.current.has(sourceId)) return;
            if (polls >= MAX_POLLS) {
                setSources((prev) => prev.map((s) => (s.id === sourceId ? { ...s, status: Status.ERROR } : s)));
                return;
            }
            polls++;

            try {
                const response = await fetch(
                    `${backendUrl}/workspaces/${workspaceId}/agents/${agentId}/documents/${documentId}`,
                    { credentials: "include" },
                );
                if (!response.ok) throw new Error("Fetch failed");
                const doc = await response.json();

                if (cancelledPolls.current.has(sourceId)) return;

                if (doc.status === DocumentStatus.INDEXED) {
                    setSources((prev) =>
                        prev.map((s) => (s.id === sourceId ? { ...s, status: Status.COMPLETED, progress: 100 } : s)),
                    );
                } else if (doc.status === DocumentStatus.FAILED) {
                    setSources((prev) => prev.map((s) => (s.id === sourceId ? { ...s, status: Status.ERROR } : s)));
                } else {
                    setTimeout(check, POLL_INTERVAL_MS);
                }
            } catch {
                if (!cancelledPolls.current.has(sourceId)) {
                    setTimeout(check, POLL_INTERVAL_MS);
                }
            }
        };

        setTimeout(check, POLL_INTERVAL_MS);
    };

    const uploadFilesInternal = async (filesToUpload: File[], updateSources = true): Promise<UploadedSource[]> => {
        const timestamp = Date.now();
        const newSources: UploadedSource[] = filesToUpload.map((file, index) => ({
            id: `${timestamp}-${index}-${file.name}`,
            type: "file" as const,
            name: file.name,
            status: Status.UPLOADING,
            progress: 0,
        }));

        if (updateSources) setSources((prev) => [...prev, ...newSources]);

        await Promise.allSettled(
            filesToUpload.map(async (file, index) => {
                const sourceId = newSources[index].id;
                try {
                    if (workspaceId && agentId) {
                        const doc = await uploadDocument({ workspaceId, agentId, file }).unwrap();
                        mixpanel.track("document_uploaded", {
                            agent_id: agentId,
                            document_id: doc.id,
                            file_size_bytes: file.size,
                            mime_type: file.type,
                        });
                        setSources((prev) =>
                            prev.map((s) =>
                                s.id === sourceId
                                    ? { ...s, status: Status.PROCESSING, progress: 50, documentId: doc.id }
                                    : s,
                            ),
                        );
                        pollDocumentStatus(doc.id, sourceId);
                    }
                } catch {
                    newSources[index].status = Status.ERROR;
                    setSources((prev) => prev.map((s) => (s.id === sourceId ? { ...s, status: Status.ERROR } : s)));
                }
            }),
        );

        return newSources;
    };

    // Kept for backwards compatibility (ImproveAssistantStep uses this directly with a FileList)
    const uploadDocuments = async (files: FileList): Promise<UploadedSource[]> => {
        const validSources = sources.filter((s) => s.status !== Status.ERROR);
        const remaining = maxFiles - initialCount - validSources.length;
        const filesToUpload = Array.from(files).slice(0, remaining);
        if (filesToUpload.length === 0) return [];
        return uploadFilesInternal(filesToUpload);
    };

    // Add files to the pending selection after validating their type.
    // Returns which files were accepted and which were rejected so the caller can show feedback.
    const addFiles = (files: FileList | null): { valid: File[]; rejected: File[] } => {
        if (!files) return { valid: [], rejected: [] };

        const valid: File[] = [];
        const rejected: File[] = [];

        Array.from(files).forEach((file) => {
            if (isAcceptedFile(file)) valid.push(file);
            else rejected.push(file);
        });

        setSelectedFiles((prev) => [...prev, ...valid]);
        return { valid, rejected };
    };

    const removeSelectedFile = (index: number): void => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Upload all pending selectedFiles, then clear the selection.
    // isUploading is true while initial mutations are in flight; polling continues after.
    const handleUpload = async (): Promise<{ erroredFiles: string[] }> => {
        if (selectedFiles.length === 0 || !workspaceId || !agentId) return { erroredFiles: [] };
        setIsUploading(true);
        const filesToUpload = selectedFiles;
        setSelectedFiles([]);
        const results = await uploadFilesInternal(filesToUpload);
        setIsUploading(false);
        return { erroredFiles: results.filter((s) => s.status === Status.ERROR).map((s) => s.name) };
    };

    const removeSource = (id: string): void => {
        cancelledPolls.current.add(id);
        setSources((prev) => prev.filter((s) => s.id !== id));
    };

    const reset = (): void => {
        setSelectedFiles([]);
        setSources([]);
        setIsUploading(false);
    };

    return {
        selectedFiles,
        sources,
        isUploading,
        isDone,
        allDone,
        isAtMaxFiles,
        uploadDocuments,
        addFiles,
        removeSelectedFile,
        handleUpload,
        removeSource,
        reset,
    };
};

export default useUploadDocuments;
