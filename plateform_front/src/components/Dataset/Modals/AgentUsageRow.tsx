import { Checkbox, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";
import { useGetActiveWorkflowQuery } from "services/workflow/workflow";
import { AgentPreview } from "types/agent/agent";
import { getAgentAvatar } from "utils/agentAvatar";
import { getAgentDatasetUsage } from "utils/dataset/agentDatasetUsage";

interface AgentUsageRowProps {
    agent: AgentPreview;
    workspaceId: string;
    datasetId: string;
    isChecked: boolean;
    onToggle: () => void;
}

/** One agent in the "use in agents" list, warning when its workflow would not search this dataset. */
export const AgentUsageRow = ({ agent, workspaceId, datasetId, isChecked, onToggle }: AgentUsageRowProps) => {
    const { data: workflow } = useGetActiveWorkflowQuery({ workspaceId, agentId: agent.id }, { skip: !isChecked });
    const usage = workflow ? getAgentDatasetUsage(workflow.definition, datasetId) : "used";
    const avatar = getAgentAvatar(agent.name);

    return (
        <Checkbox
            isChecked={isChecked}
            onChange={onToggle}
            colorScheme="green"
            spacing={3}
            alignItems="flex-start"
            px={3}
            py={2.5}
            borderRadius="10px"
            cursor="pointer"
            _hover={{ bg: "surfaceHover" }}
            sx={{
                "& .chakra-checkbox__control": { mt: 1.5 },
                "& .chakra-checkbox__label": { flex: 1, minW: 0, ml: 0 },
            }}
        >
            <HStack spacing={3} align="start" minW={0}>
                <BoxIcon size="sm" letters={agent.name.charAt(0).toUpperCase()} bg={avatar.bg} color={avatar.color} />
                <VStack align="start" spacing={0} flex={1} minW={0}>
                    <Text variant="body-sm-semibold" noOfLines={1}>
                        {agent.name}
                    </Text>
                    {isChecked && usage !== "used" ? (
                        <HStack spacing={1} align="start">
                            <Icon as={AlertTriangle} boxSize={3} color="orange.400" mt={0.5} />
                            <Text variant="caption-xs-muted">
                                Cet agent ne l&apos;utilisera pas tant que son workflow n&apos;est pas mis à jour.
                            </Text>
                        </HStack>
                    ) : (
                        <Text variant="caption-xs-muted" noOfLines={1}>
                            {agent.description || "Aucune description."}
                        </Text>
                    )}
                </VStack>
            </HStack>
        </Checkbox>
    );
};
