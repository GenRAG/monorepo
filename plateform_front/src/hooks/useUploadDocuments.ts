import { useState } from "react";
import { useUploadDocumentMutation } from "services/document/document";

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
const MAX_POLLS = 40; // 2 minutes max

const pollDocumentStatus = async (
    documentId: string,
    sourceId: string,
    workspaceId: string,
    agentId: string,
    setSources: React.Dispatch<React.SetStateAction<UploadedSource[]>>,
) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL ?? "";
    let polls = 0;

    const check = async (): Promise<void> => {
        if (polls >= MAX_POLLS) {
            setSources((prev) =>
                prev.map((s) =>
                    s.id === sourceId ? { ...s, status: Status.ERROR } : s,
                ),
            );
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

            if (doc.status === "INDEXED") {
                setSources((prev) =>
                    prev.map((s) =>
                        s.id === sourceId
                            ? { ...s, status: Status.COMPLETED, progress: 100 }
                            : s,
                    ),
                );
            } else if (doc.status === "FAILED") {
                setSources((prev) =>
                    prev.map((s) =>
                        s.id === sourceId ? { ...s, status: Status.ERROR } : s,
                    ),
                );
            } else {
                setTimeout(check, POLL_INTERVAL_MS);
            }
        } catch {
            setTimeout(check, POLL_INTERVAL_MS);
        }
    };

    setTimeout(check, POLL_INTERVAL_MS);
};

const useUploadDocuments = (
    workspaceId?: string | null,
    agentId?: string | null,
    maxFiles = 3,
) => {
    const [sources, setSources] = useState<UploadedSource[]>([]);
    const [uploadDocument] = useUploadDocumentMutation();

    const isAtMaxFiles =
        sources.filter((s) => s.status !== Status.ERROR).length >= maxFiles;

    const uploadDocuments = async (
        files: FileList,
    ): Promise<UploadedSource[]> => {
        const validSources = sources.filter((s) => s.status !== Status.ERROR);
        const remaining = maxFiles - validSources.length;
        const filesToUpload = Array.from(files).slice(0, remaining);

        if (filesToUpload.length === 0) return [];

        const timestamp = Date.now();
        const newSources: UploadedSource[] = filesToUpload.map(
            (file, index) => ({
                id: `${timestamp}-${index}-${file.name}`,
                type: "file" as const,
                name: file.name,
                status: Status.UPLOADING,
                progress: 0,
            }),
        );

        setSources((prev) => [...prev, ...newSources]);

        filesToUpload.forEach(async (file, index) => {
            const sourceId = newSources[index].id;
            try {
                if (workspaceId && agentId) {
                    const doc = await uploadDocument({
                        workspaceId,
                        agentId,
                        file,
                    }).unwrap();

                    setSources((prev) =>
                        prev.map((s) =>
                            s.id === sourceId
                                ? {
                                      ...s,
                                      status: Status.PROCESSING,
                                      progress: 50,
                                      documentId: doc.id,
                                  }
                                : s,
                        ),
                    );

                    await pollDocumentStatus(
                        doc.id,
                        sourceId,
                        workspaceId,
                        agentId,
                        setSources,
                    );
                } else {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    setSources((prev) =>
                        prev.map((s) =>
                            s.id === sourceId
                                ? {
                                      ...s,
                                      status: Status.PROCESSING,
                                      progress: 50,
                                  }
                                : s,
                        ),
                    );
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    setSources((prev) =>
                        prev.map((s) =>
                            s.id === sourceId
                                ? {
                                      ...s,
                                      status: Status.COMPLETED,
                                      progress: 100,
                                  }
                                : s,
                        ),
                    );
                }
            } catch {
                setSources((prev) =>
                    prev.map((s) =>
                        s.id === sourceId ? { ...s, status: Status.ERROR } : s,
                    ),
                );
            }
        });

        return newSources;
    };

    const removeSource = (index: number) => {
        setSources((prev) => prev.filter((_, i) => i !== index));
    };

    const clearSources = () => {
        setSources([]);
    };

    return {
        sources,
        uploadDocuments,
        removeSource,
        clearSources,
        isAtMaxFiles,
    };
};

export default useUploadDocuments;
