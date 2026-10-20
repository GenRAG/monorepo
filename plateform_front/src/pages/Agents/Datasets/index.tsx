import { Center, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { AgentDatasetRow } from "components/Agents/Datasets/AgentDatasetRow";
import { AgentDatasetsEmptyState } from "components/Agents/Datasets/AgentDatasetsEmptyState";
import { AgentDatasetsSection } from "components/Agents/Datasets/AgentDatasetsSection";
import { AgentDatasetsSummary } from "components/Agents/Datasets/AgentDatasetsSummary";
import Button from "components/ui/Button";
import WorkspaceHeader from "components/ui/WorkspaceHeader";
import { useAgentDatasets } from "hooks/dataset/useAgentDatasets";
import useApiErrorToast from "hooks/useApiErrorToast";
import { useAttachDatasetToAgentMutation, useDetachDatasetFromAgentMutation } from "services/dataset/dataset";
import { useGetActiveWorkflowQuery } from "services/workflow/workflow";
import { getAgentDatasetUsage } from "utils/dataset/agentDatasetUsage";

export const AgentDatasets = () => {
    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();
    const notifyError = useApiErrorToast();
    const {
        datasets,
        attached,
        others: available,
        isLoading,
        isError,
        refetch,
    } = useAgentDatasets(workspaceId, agentId);
    const { data: workflow } = useGetActiveWorkflowQuery({
        workspaceId,
        agentId,
    });
    const [attach, attachState] = useAttachDatasetToAgentMutation();
    const [detach, detachState] = useDetachDatasetFromAgentMutation();

    const run = async (mutation: typeof attach | typeof detach, datasetId: string) => {
        try {
            await mutation({ workspaceId, id: datasetId, agentId }).unwrap();
        } catch (error) {
            notifyError("Modification impossible", error);
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
            <VStack align="stretch" spacing={6} p={{ base: 4, md: 5 }} overflow="auto" flex={1}>
                {renderBody()}
            </VStack>
        </VStack>
    );
};
