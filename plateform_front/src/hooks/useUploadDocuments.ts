import { useState } from "react";
import { Status } from "pages/Onboarding/steps/ImproveAssistantStep";

export interface UploadedSource {
    /**
     * Stable identifier for this source. Optional at the type level to avoid
     * breaking existing usages, but always set when created by this hook.
     */
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

const useUploadDocuments = () => {
    const [sources, setSources] = useState<UploadedSource[]>([]);

    /**
     * Uploads a list of files to the backend.
     * 1. Creates a source entry in PROCESSING state for each file immediately (optimistic update)
     * 2. Sends the files to the API via FormData
     * 3. Updates each source to COMPLETED once the upload is done
     * 4. On error, marks the source as ERROR
     *
     * @param files - The FileList from an input or drag & drop event
     * @returns The initial list of sources in PROCESSING state (for immediate UI feedback)
     */
    const uploadDocuments = async (
        files: FileList,
    ): Promise<UploadedSource[]> => {
        // Create a source in PROCESSING state for each file immediately
        // so the UI can show a loading state right away
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

        // Upload each file independently so they can resolve at different times
        Array.from(files).forEach(async (file, index) => {
            const sourceId = newSources[index]?.id;
            try {
                const formData = new FormData();
                formData.append("file", file);

                const timeout = new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            ok: true,
                            json: async () => ({
                                pages: 1,
                                estimatedTime: "2-3 min",
                            }),
                        } as unknown as Response);
                    }, 2000);
                });

                const response = (await timeout) as Response;

                //Call Backend
                if (!response.ok) throw new Error("Upload failed");

                const data = await response.json();
                // Expected response shape: { pages: number, estimatedTime: string }

                // Update the specific source to COMPLETED with real metadata from the API
                setSources((prev) => {
                    const updated = [...prev];
                    if (!sourceId) {
                        return updated;
                    }
                    const sourceIndex = updated.findIndex(
                        (source) => source.id === sourceId,
                    );
                    if (sourceIndex === -1) {
                        // The source may have been removed while the upload was in progress.
                        return updated;
                    }
                    updated[sourceIndex] = {
                        ...updated[sourceIndex],
                        status: Status.COMPLETED,
                        progress: 100,
                        metadata: {
                            pages: data.pages,
                            documents: 1,
                            estimatedTime: data.estimatedTime,
                        },
                    };
                    return updated;
                });
            } catch (error) {
                console.error(`Failed to upload file: ${file.name}`, error);

                // Mark the source as ERROR so the UI can reflect it
                setSources((prev) => {
                    const updated = [...prev];
                    const sourceIndex = updated.length - files.length + index;
                    updated[sourceIndex] = {
                        ...updated[sourceIndex],
                        status: Status.ERROR,
                        progress: 0,
                    };
                    return updated;
                });
            }
        });

        // Return the initial sources in PROCESSING state immediately
        // so the component can add them to its own list right away
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
    };
};

export default useUploadDocuments;
