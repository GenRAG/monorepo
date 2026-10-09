import { useCallback } from "react";
import useThemedToast from "hooks/useThemedToast";
import { useAttachDatasetToAgentMutation } from "services/dataset/dataset";
import { DatasetEntity } from "types/dataset/dataset";
import { getApiErrorMessage } from "utils/apiError";

/** Attaches the dataset to the agent first when needed, then runs `onPicked`. */
export const usePickDataset = (workspaceId: string, agentId: string, onPicked: (datasetId: string) => void) => {
    const toast = useThemedToast();
    const [attach, { isLoading }] = useAttachDatasetToAgentMutation();

    const pick = useCallback(
        async (dataset: DatasetEntity, needsAttach: boolean) => {
            if (needsAttach) {
                try {
                    await attach({ workspaceId, id: dataset.id, agentId }).unwrap();
                } catch (error) {
                    toast({
                        title: "Impossible d'ajouter la base à l'agent",
                        description: getApiErrorMessage(error) || "Veuillez réessayer.",
                        status: "error",
                        duration: 5000,
                    });
                    return;
                }
            }
            onPicked(dataset.id);
        },
        [attach, workspaceId, agentId, onPicked, toast],
    );

    return { pick, isAttaching: isLoading };
};
