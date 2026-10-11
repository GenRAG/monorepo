import { useCallback } from "react";
import useApiErrorToast from "hooks/useApiErrorToast";
import { useAttachDatasetToAgentMutation } from "services/dataset/dataset";
import { DatasetEntity } from "types/dataset/dataset";

/** Attaches the dataset to the agent first when needed, then runs `onPicked`. */
export const usePickDataset = (workspaceId: string, agentId: string, onPicked: (datasetId: string) => void) => {
    const notifyError = useApiErrorToast();
    const [attach, { isLoading }] = useAttachDatasetToAgentMutation();

    const pick = useCallback(
        async (dataset: DatasetEntity, needsAttach: boolean) => {
            if (needsAttach) {
                try {
                    await attach({ workspaceId, id: dataset.id, agentId }).unwrap();
                } catch (error) {
                    notifyError("Impossible d'ajouter la base à l'agent", error);
                    return;
                }
            }
            onPicked(dataset.id);
        },
        [attach, workspaceId, agentId, onPicked, notifyError],
    );

    return { pick, isAttaching: isLoading };
};
