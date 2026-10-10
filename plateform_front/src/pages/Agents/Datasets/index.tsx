import { useMemo } from "react";
import { Center, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { AgentDatasetRow } from "components/Agents/Datasets/AgentDatasetRow";
import { AgentDatasetsEmptyState } from "components/Agents/Datasets/AgentDatasetsEmptyState";
import { AgentDatasetsSection } from "components/Agents/Datasets/AgentDatasetsSection";
import { AgentDatasetsSummary } from "components/Agents/Datasets/AgentDatasetsSummary";
import Button from "components/ui/Button";
import WorkspaceHeader from "components/ui/WorkspaceHeader";
import useThemedToast from "hooks/useThemedToast";
import {
    useAttachDatasetToAgentMutation,
    useDetachDatasetFromAgentMutation,
    useGetWorkspaceDatasetsQuery,
} from "services/dataset/dataset";
import { useGetActiveWorkflowQuery } from "services/workflow/workflow";
import { getApiErrorMessage } from "utils/apiError";
import { getAgentDatasetUsage } from "utils/dataset/agentDatasetUsage";

export const AgentDatasets = () => {
    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();
    const toast = useThemedToast();
    const { data: datasets = [], isLoading, isError, refetch } = useGetWorkspaceDatasetsQuery(workspaceId);
    const { data: workflow } = useGetActiveWorkflowQuery({
        workspaceId,
        agentId,
    });
    const [attach, attachState] = useAttachDatasetToAgentMutation();
    const [detach, detachState] = useDetachDatasetFromAgentMutation();

    const { attached, available } = useMemo(() => {
        const isAttached = (agents: { id: string }[]) => agents.some((agent) => agent.id === agentId);
        return {
            attached: datasets.filter((d) => isAttached(d.agents)),
            available: datasets.filter((d) => !isAttached(d.agents)),
        };
    }, [datasets, agentId]);

    const run = async (mutation: typeof attach | typeof detach, datasetId: string) => {
        try {
            await mutation({ workspaceId, id: datasetId, agentId }).unwrap();
        } catch (error) {
            toast({
                title: "Modification impossible",
                description: getApiErrorMessage(error) || "Veuillez réessayer.",
                status: "error",
                duration: 5000,
            });
        }
    };

    const isPending = (state: typeof attachState, datasetId: string) =>
        state.isLoading && state.originalArgs?.id === datasetId;

    const renderBody = () => {
        if (isLoading) {
            return (
                <Stack spacing={2}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} h="68px" borderRadius="14px" />
                    ))}
                </Stack>
            );
        }
        if (isError) {
            return (
                <Center py={10} flexDirection="column" gap={3}>
                    <Text color="textError">Impossible de charger les bases de connaissances.</Text>
                    <Button size="sm" variant="secondary" onClick={() => void refetch()}>
                        Réessayer
                    </Button>
                </Center>
            );
        }
        if (datasets.length === 0) return <AgentDatasetsEmptyState kind="no-dataset" workspaceId={workspaceId} />;
        return (
            <VStack align="stretch" spacing={8}>
                <AgentDatasetsSummary attached={attached} total={datasets.length} />

                <AgentDatasetsSection title="Utilisées par cet agent" count={attached.length}>
                    {attached.length === 0 ? (
                        <AgentDatasetsEmptyState kind="none-attached" workspaceId={workspaceId} />
                    ) : (
                        attached.map((dataset) => (
                            <AgentDatasetRow
                                key={dataset.id}
                                dataset={dataset}
                                workspaceId={workspaceId}
                                isExcluded={
                                    workflow && getAgentDatasetUsage(workflow.definition, dataset.id) !== "used"
                                }
                                action={{
                                    label: "Retirer",
                                    variant: "ghost",
                                    onClick: () => void run(detach, dataset.id),
                                    isLoading: isPending(detachState, dataset.id),
                                }}
                            />
                        ))
                    )}
                </AgentDatasetsSection>

                <AgentDatasetsSection title="Autres bases de l'entreprise" count={available.length}>
                    {available.length === 0 ? (
                        <AgentDatasetsEmptyState kind="all-attached" workspaceId={workspaceId} />
                    ) : (
                        available.map((dataset) => (
                            <AgentDatasetRow
                                key={dataset.id}
                                dataset={dataset}
                                workspaceId={workspaceId}
                                action={{
                                    label: "Ajouter",
                                    variant: "secondary",
                                    onClick: () => void run(attach, dataset.id),
                                    isLoading: isPending(attachState, dataset.id),
                                }}
                            />
                        ))
                    )}
                </AgentDatasetsSection>
            </VStack>
        );
    };

    return (
        <VStack w="100%" h="100%" align="stretch" spacing={0} overflow="hidden">
            <WorkspaceHeader
                title="Bases de connaissances"
                description="Choisissez les bases dans lesquelles cet agent cherche ses réponses."
            />
            <VStack
                align="stretch"
                spacing={6}
                px={{ base: 4, md: 16 }}
                py={{ base: 4, md: 8 }}
                overflow="auto"
                flex={1}
            >
                {renderBody()}
            </VStack>
        </VStack>
    );
};
