import {
    Badge,
    Box,
    Heading,
    HStack,
    Icon,
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
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkflowPreview } from "components/Molecules/WorkflowPreview";
import { WorkspacePreview } from "types/workspace";
import { RAG_CONFIG } from "pages/Dashboard/RagConfiguration";

interface WorkspaceCardProps {
    workspace: WorkspacePreview;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
    workspace,
}: WorkspaceCardProps) => {
    const { colorMode } = useColorMode();
    const navigate = useNavigate();
    const textPrimary = useColorModeValue("grey.950", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");
    const borderColor = useColorModeValue("grey.100", "grey.700");

    return (
        <Box
            p={5}
            borderRadius="12px"
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "grey.700" : "grey.200"}
            bg={colorMode === "dark" ? "grey.900" : "white"}
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
                transform: "translateY(-2px)",
                shadow: "md",
            }}
            onClick={() => navigate(`/workspaces/${workspace.id}/chat`)}
        >
            <VStack align="stretch" spacing={4}>
                <Heading
                    variant="heading-3xl"
                    color={textPrimary}
                    fontWeight="semibold"
                    fontSize={{ base: "lg", md: "xl" }}
                >
                    {workspace.name}
                </Heading>
                <Stack
                    direction={{ base: "column", lg: "row" }}
                    height="100%"
                    gap={4}
                    w="100%"
                    alignItems="flex-start"
                >
                    <Box
                        borderRadius="16px"
                        border="1px solid"
                        borderColor={borderColor}
                        overflow="hidden"
                        maxW="100%"
                        w="100%"
                        flex={1}
                    >
                        <Table variant="simple" size="md">
                            <Thead
                                position="sticky"
                                top={0}
                                bg={colorMode === "dark" ? "grey.800" : "white"}
                                zIndex={1}
                                color={
                                    colorMode === "dark"
                                        ? "grey.100"
                                        : "grey.800"
                                }
                            >
                                <Tr>
                                    <Th color={textSecondary}>Component</Th>
                                    <Th color={textSecondary}>Value</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {RAG_CONFIG.map((row) => (
                                    <Tr key={row.component} cursor="pointer">
                                        <Td color={textSecondary} fontSize="sm">
                                            {row.component}
                                        </Td>
                                        <Td
                                            color={textPrimary}
                                            fontWeight="medium"
                                        >
                                            {row.value}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                    <Box w="100%" alignSelf="stretch" flex={1}>
                        <WorkflowPreview
                            height={{ base: "200px", lg: "100%" }}
                        />
                    </Box>
                </Stack>

                <HStack
                    justify="space-between"
                    pt={2}
                    fontSize="xs"
                    color={textSecondary}
                    flexWrap="wrap"
                    gap={2}
                >
                    <HStack spacing={3}>
                        <HStack spacing={1}>
                            <Icon as={FileText} boxSize={4} />
                            <Text>
                                {workspace.documentsCount ?? 0} document
                                {(workspace.documentsCount ?? 0) !== 1
                                    ? "s"
                                    : ""}
                            </Text>
                        </HStack>
                    </HStack>
                    {workspace.updatedAt && (
                        <Badge
                            variant="subtle"
                            colorScheme="ghost"
                            borderRadius="12px"
                        >
                            {typeof workspace.updatedAt === "string" &&
                            workspace.updatedAt.match(/^\d{4}-\d{2}-\d{2}/)
                                ? new Date(
                                      workspace.updatedAt,
                                  ).toLocaleDateString()
                                : workspace.updatedAt}
                        </Badge>
                    )}
                </HStack>
            </VStack>
        </Box>
    );
};
