import { useState } from "react";
import { useUploadDocumentMutation } from "services/document/document";

export enum Status {
    PROCESSING = "processing",
    COMPLETED = "completed",
    ERROR = "error",
}

export interface UploadedSource {
    id?: string;
    type: "file";
    name: string;
    status: Status;
    progress: number;
    metadata: {
        pages: number;
        documents: number;
        estimatedTime: string;
    };
}

const useUploadDocuments = (
    workspaceId?: string | null,
    agentId?: string | null,
) => {
    const [sources, setSources] = useState<UploadedSource[]>([]);
    const [uploadDocument] = useUploadDocumentMutation();

    const uploadDocuments = async (
        files: FileList,
    ): Promise<UploadedSource[]> => {
        const timestamp = Date.now();
        const newSources: UploadedSource[] = Array.from(files).map(
            (file, index) => ({
                id: `${timestamp}-${index}-${file.name}`,
                type: "file" as const,
                name: file.name,
                status: Status.PROCESSING,
                progress: 0,
                metadata: {
                    pages: 0,
                    documents: 1,
                    estimatedTime: "2-3 min",
                },
            }),
        );

        setSources((prev) => [...prev, ...newSources]);

        Array.from(files).forEach(async (file, index) => {
            const sourceId = newSources[index]?.id;
            try {
                if (workspaceId && agentId) {
                    await uploadDocument({
                        workspaceId,
                        agentId,
                        file,
                    }).unwrap();
                } else {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }

                setSources((prev) => {
                    const updated = [...prev];

                    if (!sourceId) return updated;

                    const idx = updated.findIndex((s) => s.id === sourceId);

                    if (idx === -1) return updated;

                    updated[idx] = {
                        ...updated[idx],
                        status: Status.COMPLETED,
                        progress: 100,
                    };
                    return updated;
                });
            } catch (error) {
                console.error(`Failed to upload file: ${file.name}`, error);
                setSources((prev) => {
                    const updated = [...prev];

                    const idx = updated.findIndex((s) => s.id === sourceId);

                    if (idx === -1) return updated;

                    updated[idx] = {
                        ...updated[idx],
                        status: Status.ERROR,
                        progress: 0,
                    };
                    return updated;
                });
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

    return { sources, uploadDocuments, removeSource, clearSources };
};

export default useUploadDocuments;
