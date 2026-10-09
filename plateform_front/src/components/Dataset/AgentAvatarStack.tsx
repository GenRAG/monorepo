import { HStack, Text, Tooltip } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import { DatasetAgentSummary } from "types/dataset/dataset";
import { getAgentAvatar } from "utils/agentAvatar";

const MAX_AVATARS = 3;

/** Agents using a dataset, as small stacked avatars (name on hover). */
export const AgentAvatarStack = ({ agents }: { agents: DatasetAgentSummary[] }) => {
    if (agents.length === 0) {
        return <Text variant="body-xs-muted">Aucun agent</Text>;
    }

    const extra = agents.length - MAX_AVATARS;

    return (
        <HStack spacing={-1.5}>
            {agents.slice(0, MAX_AVATARS).map((agent) => {
                const avatar = getAgentAvatar(agent.name);
                return (
                    <Tooltip key={agent.id} label={agent.name} bg="tooltipBg" color="white" borderRadius="8px" hasArrow>
                        <span>
                            <BoxIcon
                                size="sm"
                                letters={agent.name.charAt(0).toUpperCase()}
                                bg={avatar.bg}
                                color={avatar.color}
                            />
                        </span>
                    </Tooltip>
                );
            })}
            {extra > 0 && (
                <Text variant="caption-xs-muted" pl={2.5}>
                    +{extra}
                </Text>
            )}
        </HStack>
    );
};
