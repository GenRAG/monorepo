import type { Edge } from "@xyflow/react";
import { serializeWorkflow, type AppNode, type WorkflowDefinition } from "@genrag/workflow";
import { useCreateWorkflowMutation, useUpdateWorkflowMutation } from "services/workflow/workflow";
import { useIncompleteNodesGuard } from "hooks/useIncompleteNodesGuard";
import useThemedToast from "hooks/useThemedToast";
import mixpanel from "lib/mixpanel";

interface UseSaveWorkflowParams {
    workspaceId: string;
    agentId: string;
    workflowExists: boolean;
    onSaved: () => void;
}

export const useSaveWorkflow = ({ workspaceId, agentId, workflowExists, onSaved }: UseSaveWorkflowParams) => {
    const toast = useThemedToast();
    const { checkIncompleteNodes } = useIncompleteNodesGuard();
    const [updateWorkflow, { isLoading: isUpdating }] = useUpdateWorkflowMutation();
    const [createWorkflow, { isLoading: isCreating }] = useCreateWorkflowMutation();

    const save = async (nodes: AppNode[], edges: Edge[]) => {
        if (!checkIncompleteNodes(nodes)) return;

        const definition: WorkflowDefinition = serializeWorkflow(nodes, edges);
        const params = { workspaceId, agentId, definition };

        try {
            if (workflowExists) {
                await updateWorkflow(params).unwrap();
            } else {
                await createWorkflow(params).unwrap();
            }
            mixpanel.track("workflow_saved", { agent_id: agentId });
            onSaved();
            toast({
                title: "Workflow enregistré",
                description: "Votre workflow d'execution a été enregistré avec succès.",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch {
            toast({
                title: "Erreur lors de l'enregistrement",
                description: "Une erreur est survenue lors de l'enregistrement de votre workflow.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return { save, isSaving: isUpdating || isCreating };
};
