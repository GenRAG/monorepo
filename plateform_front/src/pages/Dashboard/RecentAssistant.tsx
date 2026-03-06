import {
    Badge,
    Box,
    Divider,
    Heading,
    HStack,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorMode,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import Button from "components/Atoms/Button";
import { useAppResponsive } from "hooks/useAppResponsive";

const CONVERSATIONS = [
    {
        id: "1",
        name: "Customer Support – Refund Policy",
        assistant: "SupportBot",
        lastActivity: "2 min ago",
        status: "Active",
        statusColor: "green",
    },
    {
        id: "2",
        name: "Legal RAG Test",
        assistant: "LegalAssistant",
        lastActivity: "1 hour ago",
        status: "Active",
        statusColor: "green",
    },
    {
        id: "3",
        name: "Internal Knowledge Search",
        assistant: "KnowledgeBot",
        lastActivity: "Yesterday",
        status: "Archived",
        statusColor: "grey",
    },
];

const RecentAssistant = () => {
    const { colorMode } = useColorMode();
    const isMobile = useAppResponsive({ base: true, md: false });
    const textPrimary = useColorModeValue("grey.900", "grey.100");
    const textSecondary = useColorModeValue("grey.600", "grey.400");
    const borderColor = useColorModeValue("grey.100", "grey.700");
    const hoverBg = useColorModeValue("grey.50", "grey.850");

    return (
        <VStack align="stretch">
            <Stack
                p={2}
                pb={2}
                direction={{ base: "column", sm: "row" }}
                justify="space-between"
                align={{ base: "stretch", sm: "center" }}
                gap={2}
            >
                <Heading
                    variant="heading-md"
                    color={textPrimary}
                    fontSize={{ base: "md", md: "lg" }}
                >
                    Recent Conversations
                </Heading>
                <Button
                    variant="link"
                    size="sm"
                    color="green.500"
                    alignSelf={{ base: "flex-start", sm: "center" }}
                >
                    See All
                </Button>
            </Stack>
            <Box
                borderRadius="16px"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
                maxW="100%"
            >
                {isMobile ? (
                    <VStack
                        align="stretch"
                        spacing={0}
                        divider={<Divider borderColor={borderColor} />}
                    >
                        {CONVERSATIONS.map((conv) => (
                            <Box
                                key={conv.id}
                                p={4}
                                _hover={{ bg: hoverBg }}
                                cursor="pointer"
                            >
                                <VStack align="stretch" spacing={1}>
                                    <Text
                                        variant="body-sm"
                                        fontWeight="medium"
                                        color={textPrimary}
                                    >
                                        {conv.name}
                                    </Text>
                                    <HStack
                                        justify="space-between"
                                        align="center"
                                        flexWrap="wrap"
                                        gap={2}
                                    >
                                        <Text
                                            variant="body-sm"
                                            color={textSecondary}
                                            fontSize="xs"
                                        >
                                            {conv.assistant}
                                            {" • "}
                                            {conv.lastActivity}
                                        </Text>
                                        <Badge
                                            colorScheme={conv.statusColor}
                                            variant="subtle"
                                            borderRadius="6px"
                                            fontSize="xs"
                                        >
                                            {conv.status}
                                        </Badge>
                                    </HStack>
                                </VStack>
                            </Box>
                        ))}
                    </VStack>
                ) : (
                    <Table variant="simple" size="md">
                        <Thead
                            position="sticky"
                            top={0}
                            bg={colorMode === "dark" ? "grey.800" : "white"}
                            zIndex={1}
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.800"
                            }
                        >
                            <Tr>
                                <Th color={textSecondary}>Conversation</Th>
                                <Th color={textSecondary}>Assistant</Th>
                                <Th color={textSecondary}>Last Activity</Th>
                                <Th color={textSecondary}>Status</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {CONVERSATIONS.map((conv) => (
                                <Tr
                                    key={conv.id}
                                    _hover={{ bg: hoverBg }}
                                    cursor="pointer"
                                >
                                    <Td>
                                        <Text
                                            variant="body-sm"
                                            fontWeight="medium"
                                            color={textPrimary}
                                        >
                                            {conv.name}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Text
                                            variant="body-sm"
                                            color={textSecondary}
                                        >
                                            {conv.assistant}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Text
                                            variant="body-sm"
                                            color={textSecondary}
                                        >
                                            {conv.lastActivity}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Badge
                                            colorScheme={conv.statusColor}
                                            variant="subtle"
                                            borderRadius="6px"
                                        >
                                            {conv.status}
                                        </Badge>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>
        </VStack>
    );
};

export default RecentAssistant;
