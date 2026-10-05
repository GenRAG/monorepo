import { Box, Skeleton, VStack, Stack } from "@chakra-ui/react";
import DataPrivacy from "components/Deployment/Settings/DataPrivacy";
import RGPDBanner from "components/Deployment/Settings/RGPDBanner";
import { UserRights } from "components/Deployment/Settings/UserRights";
import { QueryLogsTable } from "components/Deployment/Settings/QueryLogsTable";
import DangerZone from "components/ui/DangerZone";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteAgentMutation, useGetAgentByIdQuery, useUpdateAgentMutation } from "services/agent/agent";
import WorkspaceHeader from "components/ui/WorkspaceHeader";
import useThemedToast from "hooks/useThemedToast";
import { getApiErrorMessage } from "utils/apiError";

const AgentDangerZone = () => {
    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();
    const navigate = useNavigate();
    const { data: agent } = useGetAgentByIdQuery({ workspaceId, id: agentId }, { skip: !agentId });
    const [deleteAgent, { isLoading }] = useDeleteAgentMutation();
    const toast = useThemedToast();

    const handleDelete = async () => {
        try {
            await deleteAgent({ workspaceId, id: agentId }).unwrap();
        } catch (err: unknown) {
            toast({
                title: "Erreur lors de la suppression",
                description: getApiErrorMessage(err) || "L'agent n'a pas pu être supprimé. Veuillez réessayer.",
                status: "error",
                duration: 5000,
            });
            return;
        }
        await navigate(`/workspaces/${workspaceId}/agents`);
    };

    return (
        <DangerZone
            title="Supprimer cet agent"
            description="Supprime définitivement l'agent, ses documents, conversations et workflows."
            buttonLabel="Supprimer l'agent"
            modalTitle="Supprimer l'agent"
            modalDescription={
                <>
                    Voulez-vous vraiment supprimer <strong>{agent?.name ?? "cet agent"}</strong> ? Toutes les
                    conversations, documents et workflows associés seront supprimés définitivement.
                </>
            }
            onConfirm={handleDelete}
            isLoading={isLoading}
        />
    );
};

export const Settings = () => {
    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();
    const [apiLogs, setApiLogs] = useState(true);

    const { data: agent } = useGetAgentByIdQuery({ workspaceId, id: agentId }, { skip: !agentId });
    const [updateAgent] = useUpdateAgentMutation();

    const handleRetentionDaysChange = (v: number | null) => {
        void updateAgent({ workspaceId, id: agentId, retentionDays: v });
    };

    return (
        <Stack flex={1} minH={0} spacing={0} overflow="hidden">
            <WorkspaceHeader title="Paramètres" description="Gérez les paramètres de votre agent." />
            <Box flex={1} minH={0} overflowY="auto" p={6}>
                <VStack spacing={5} align="stretch" mx="auto">
                    <RGPDBanner />
                    {agent ? (
                        <DataPrivacy
                            apiLogs={apiLogs}
                            onApiLogsChange={setApiLogs}
                            retentionDays={agent.retentionDays ?? null}
                            onRetentionDaysChange={handleRetentionDaysChange}
                        />
                    ) : (
                        <Skeleton h="220px" borderRadius="12px" />
                    )}
                    {apiLogs && <QueryLogsTable />}
                    <UserRights />
                    <AgentDangerZone />
                </VStack>
            </Box>
        </Stack>
    );
};
