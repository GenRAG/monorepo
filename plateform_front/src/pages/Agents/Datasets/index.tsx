import { useMemo } from "react";
import { Center, HStack, Icon, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { Info } from "lucide-react";
import { useParams } from "react-router-dom";
import { AgentDatasetRow } from "components/Agents/Datasets/AgentDatasetRow";
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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <VStack align="stretch" spacing={2}>
        <Text variant="caption-xs-semibold" color="textLabel" textTransform="uppercase" letterSpacing="0.06em">
            {title}
        </Text>
        {children}
    </VStack>
);

/** Which knowledge bases the agent may search. Documents themselves are managed from the Bases page. */
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
                        <Skeleton key={i} h="60px" borderRadius="12px" />
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
        return (
            <VStack align="stretch" spacing={8}>
                <Section title={`Utilisées par cet agent (${attached.length})`}>
                    {attached.length === 0 ? (
                        <Text variant="body-sm-muted">
                            Aucune base : l&apos;agent répond sans consulter de documents. Ajoutez-en une ci-dessous.
                        </Text>
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
                </Section>

                <Section title="Autres bases de l'entreprise">
                    {available.length === 0 ? (
                        <Text variant="body-sm-muted">
                            Toutes vos bases sont déjà utilisées par cet agent. Créez-en d&apos;autres depuis la page
                            Bases.
                        </Text>
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
                </Section>
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
                px={{ base: 6, md: 16 }}
                py={{ base: 4, md: 8 }}
                overflow="auto"
                flex={1}
            >
                <HStack spacing={2} p={3} borderRadius="10px" bg="surfaceSubtle" align="start">
                    <Icon as={Info} boxSize={4} color="textLabel" mt={0.5} />
                    <Text variant="body-xs-muted">
                        Par défaut, l&apos;agent cherche dans toutes les bases ajoutées ici. Pour n&apos;en utiliser que
                        certaines, ajoutez des blocs « Base de connaissances » à la Recherche dans l&apos;onglet
                        Architecture.
                    </Text>
                </HStack>
                {renderBody()}
            </VStack>
        </VStack>
    );
};
