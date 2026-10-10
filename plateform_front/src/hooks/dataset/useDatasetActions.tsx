import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DatasetAction } from "components/Dataset/DatasetActionsMenu";
import { DatasetAgentsModal } from "components/Dataset/Modals/DatasetAgentsModal";
import { DatasetFormModal, DatasetFormValues } from "components/Dataset/Modals/DatasetFormModal";
import { DeleteDatasetModal } from "components/Dataset/Modals/DeleteDatasetModal";
import useThemedToast from "hooks/useThemedToast";
import { useUpdateDatasetMutation } from "services/dataset/dataset";
import { DatasetEntity } from "types/dataset/dataset";
import { getApiErrorMessage } from "utils/apiError";

type ModalAction = Exclude<DatasetAction, "open">;

/** Menu actions of a dataset (library card / row, detail header) and the modals they open. */
export const useDatasetActions = (workspaceId: string, { onDeleted }: { onDeleted?: () => void } = {}) => {
    const navigate = useNavigate();
    const toast = useThemedToast();
    const [updateDataset, { isLoading: isUpdating }] = useUpdateDatasetMutation();
    const [target, setTarget] = useState<{
        action: ModalAction;
        dataset: DatasetEntity;
    } | null>(null);

    const handleAction = (action: DatasetAction, dataset: DatasetEntity) => {
        if (action === "open") {
            void navigate(`/workspaces/${workspaceId}/datasets/${dataset.id}`);
            return;
        }
        setTarget({ action, dataset });
    };

    const close = () => setTarget(null);
    const datasetFor = (action: ModalAction) => (target?.action === action ? target.dataset : null);

    const handleRename = async (values: DatasetFormValues) => {
        if (!target) return;
        try {
            await updateDataset({
                workspaceId,
                id: target.dataset.id,
                ...values,
            }).unwrap();
            close();
        } catch (error) {
            toast({
                title: "Modification impossible",
                description: getApiErrorMessage(error) || "Veuillez réessayer.",
                status: "error",
                duration: 5000,
            });
        }
    };

    const modals = (
        <>
            <DatasetFormModal
                mode="edit"
                isOpen={target?.action === "rename"}
                onClose={close}
                onSubmit={handleRename}
                isSubmitting={isUpdating}
                initialValues={{
                    name: datasetFor("rename")?.name,
                    description: datasetFor("rename")?.description ?? "",
                }}
            />
            <DatasetAgentsModal dataset={datasetFor("agents")} workspaceId={workspaceId} onClose={close} />
            <DeleteDatasetModal
                dataset={datasetFor("delete")}
                workspaceId={workspaceId}
                onClose={close}
                onDeleted={onDeleted}
            />
        </>
    );

    return {
        handleAction,
        openAgentsModal: (dataset: DatasetEntity) => handleAction("agents", dataset),
        modals,
    };
};
