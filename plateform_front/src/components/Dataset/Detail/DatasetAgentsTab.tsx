import { HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";
import useThemedToast from "hooks/useThemedToast";
import { useDetachDatasetFromAgentMutation } from "services/dataset/dataset";
import { DatasetEntity } from "types/dataset/dataset";
import { getAgentAvatar } from "utils/agentAvatar";
import { getApiErrorMessage } from "utils/apiError";

interface DatasetAgentsTabProps {
    dataset: DatasetEntity;
    workspaceId: string;
    onAddAgents: () => void;
}

export const DatasetAgentsTab = ({ dataset, workspaceId, onAddAgents }: DatasetAgentsTabProps) => {
    const navigate = useNavigate();
    const toast = useThemedToast();
    const [detach, { isLoading, originalArgs }] = useDetachDatasetFromAgentMutation();

    const handleDetach = async (agentId: string) => {
        try {
            await detach({ workspaceId, id: dataset.id, agentId }).unwrap();
        } catch (error) {
            toast({
                title: "Impossible de retirer l'agent",
                description: getApiErrorMessage(error) || "Veuillez réessayer.",
                status: "error",
                duration: 5000,
            });
        }
    };

    return (
        <VStack align="stretch" spacing={4} pt={4}>
            <HStack justify="space-between">
                <Text variant="body-sm-muted">Ces agents peuvent répondre à partir des documents de cette base.</Text>
                <Button size="sm" variant="superPrimary" leftIcon={Plus} onClick={onAddAgents}>
                    Ajouter à un agent
                </Button>
            </HStack>

            {dataset.agents.length === 0 ? (
                <Text
                    variant="body-sm-muted"
                    textAlign="center"
                    py={10}
                    borderWidth="1px"
                    borderStyle="dashed"
                    borderColor="borderDefault"
                    borderRadius="12px"
                >
                    Aucun agent n&apos;utilise encore cette base.
                </Text>
            ) : (
                <Stack spacing={2}>
                    {dataset.agents.map((agent) => {
                        const avatar = getAgentAvatar(agent.name);
                        return (
                            <HStack
                                key={agent.id}
                                px={4}
                                py={3}
                                bg="surfaceCard"
                                borderWidth="1px"
                                borderStyle="solid"
                                borderColor="borderDefault"
                                borderRadius="12px"
                                justify="space-between"
                            >
                                <HStack
                                    spacing={3}
                                    cursor="pointer"
                                    onClick={() =>
                                        void navigate(`/workspaces/${workspaceId}/agents/${agent.id}/datasets`)
                                    }
                                >
                                    <BoxIcon
                                        size="sm"
                                        letters={agent.name.charAt(0).toUpperCase()}
                                        bg={avatar.bg}
                                        color={avatar.color}
                                    />
                                    <Text variant="body-sm-semibold">{agent.name}</Text>
                                </HStack>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => void handleDetach(agent.id)}
                                    isLoading={isLoading && originalArgs?.agentId === agent.id}
                                >
                                    Retirer
                                </Button>
                            </HStack>
                        );
                    })}
                </Stack>
            )}
        </VStack>
    );
};
