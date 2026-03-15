import {
    Box,
    Divider,
    HStack,
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
import { useAppResponsive } from "hooks/useAppResponsive";

export const RAG_CONFIG = [
    { component: "Retriever", value: "Similarity (Top-k = 5)" },
    { component: "Reranker", value: "Enabled" },
    { component: "Model", value: "GPT-4" },
    { component: "Vector Database", value: "Qdrant" },
    { component: "Temperature", value: "0.2" },
];

export const RagConfiguration = () => {
    const { colorMode } = useColorMode();
    const isMobile = useAppResponsive({ base: true, md: false });
    const textSecondary = useColorModeValue("grey.600", "grey.400");
    const textPrimary = useColorModeValue("grey.900", "grey.100");
    const borderColor = useColorModeValue("grey.100", "grey.700");
    const hoverBg = useColorModeValue("grey.50", "grey.850");

    return (
        <Box flex={1} minW={0} h="100%">
            <Box
                borderRadius="16px"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
                maxW="100%"
                h="100%"
            >
                {isMobile ? (
                    <VStack
                        align="stretch"
                        spacing={0}
                        divider={<Divider borderColor={borderColor} mx={4} />}
                    >
                        {RAG_CONFIG.map((row) => (
                            <Box
                                key={row.component}
                                px={4}
                                py={3}
                                _hover={{ bg: hoverBg }}
                                cursor="pointer"
                            >
                                <HStack
                                    justify="space-between"
                                    align="center"
                                    spacing={4}
                                >
                                    <Text fontSize="sm" color={textSecondary}>
                                        {row.component}
                                    </Text>
                                    <Text
                                        fontSize="sm"
                                        fontWeight="medium"
                                        color={textPrimary}
                                        textAlign="right"
                                    >
                                        {row.value}
                                    </Text>
                                </HStack>
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
                                <Th color={textSecondary}>Component</Th>
                                <Th color={textSecondary}>Value</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {RAG_CONFIG.map((row) => (
                                <Tr
                                    key={row.component}
                                    _hover={{ bg: hoverBg }}
                                    cursor="pointer"
                                >
                                    <Td color={textSecondary} fontSize="sm">
                                        {row.component}
                                    </Td>
                                    <Td color={textPrimary} fontWeight="medium">
                                        {row.value}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>
        </Box>
    );
};
