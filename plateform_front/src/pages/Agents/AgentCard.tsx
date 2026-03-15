import {
    Badge,
    Box,
    HStack,
    Icon,
    Text,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { CalendarClock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkflowPreview } from "components/Molecules/WorkflowPreview";
import { AgentPreview } from "types/agent";

interface AgentCardProps {
    agent: AgentPreview;
    workspaceId: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({
    agent,
    workspaceId,
}: AgentCardProps) => {
    const navigate = useNavigate();
    const textPrimary = useColorModeValue("grey.950", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");
    const borderColor = useColorModeValue("grey.100", "grey.700");
    const cardBg = useColorModeValue("white", "grey.900");
    const cardHoverBg = useColorModeValue("grey.50", "grey.850");
    const avatarBg = useColorModeValue("grey.900", "grey.100");
    const avatarColor = useColorModeValue("white", "grey.900");

    const formattedUpdatedAt =
        typeof agent.updatedAt === "string" &&
        agent.updatedAt.match(/^\d{4}-\d{2}-\d{2}/)
            ? new Date(agent.updatedAt).toLocaleDateString()
            : agent.updatedAt;

    return (
        <Box
            borderRadius="18px"
            h="100%"
            borderWidth="1px"
            borderColor={borderColor}
            bg={cardBg}
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
                transform: "translateY(-3px)",
                shadow: "lg",
                bg: cardHoverBg,
            }}
            onClick={() =>
                navigate(
                    `/workspaces/${workspaceId}/agents/${agent.id}/playground`,
                )
            }
        >
            <VStack align="stretch" spacing={3}>
                <Box borderTopRadius={"12px"}>
                    <WorkflowPreview
                        zoom={0.2}
                        padding={0.2}
                        height={{ base: "190px", lg: "220px" }}
                    />
                </Box>

                <HStack
                    align="start"
                    justify="space-between"
                    gap={3}
                    p={5}
                    w="100%"
                >
                    <HStack spacing={2.5} minW={0}>
                        <Box
                            w="36px"
                            h="36px"
                            borderRadius="9px"
                            bg={avatarBg}
                            color={avatarColor}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="12px"
                            fontWeight="700"
                            flexShrink={0}
                        >
                            {agent.name.charAt(0).toUpperCase()}
                        </Box>

                        <VStack align="start" spacing={0} minW={0} w="100%">
                            <Text
                                color={textPrimary}
                                fontWeight="semibold"
                                fontSize="md"
                                noOfLines={1}
                            >
                                {agent.name}
                            </Text>

                            <HStack
                                spacing={3}
                                color={textSecondary}
                                fontSize="xs"
                                w="full"
                                justify="space-between"
                            >
                                <HStack spacing={1}>
                                    <Icon as={FileText} boxSize={3.5} />
                                    <Text>
                                        {agent.documentsCount ?? 0} doc
                                        {(agent.documentsCount ?? 0) !== 1
                                            ? "s"
                                            : ""}
                                    </Text>
                                </HStack>
                            </HStack>
                        </VStack>
                    </HStack>

                    <VStack align="end">
                        <Badge
                            variant="subtle"
                            colorScheme="green"
                            borderRadius="999px"
                            px={2}
                            py={0.5}
                            fontSize="10px"
                            whiteSpace="nowrap"
                        >
                            Open
                        </Badge>
                        {formattedUpdatedAt && (
                            <HStack spacing={1}>
                                <Icon as={CalendarClock} boxSize={3.5} />
                                <Text noOfLines={1}>{formattedUpdatedAt}</Text>
                            </HStack>
                        )}
                    </VStack>
                </HStack>
            </VStack>
        </Box>
    );
};
