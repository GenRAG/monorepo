import {
    VStack,
    HStack,
    Text,
    Button,
    Box,
    Table,
    Thead,
    Tr,
    Td,
    Th,
    Tbody,
    IconButton,
    Badge,
} from "@chakra-ui/react";

import { CopyIcon, PlayIcon } from "lucide-react";

export const VersionsHistory = ({ isDark }: { isDark: boolean }) => {
    const deploymentHistory = [
        {
            version: "v1.2",
            date: "12 Feb 2026, 14:32",
            status: "current",
            author: "John Doe",
            changes: "Updated model to Claude Sonnet 4",
        },
        {
            version: "v1.1",
            date: "7 Feb 2026, 10:15",
            status: "previous",
            author: "Jane Smith",
            changes: "Fixed response latency issues",
        },
        {
            version: "v1.0",
            date: "3 Feb 2026, 09:00",
            status: "previous",
            author: "John Doe",
            changes: "Initial deployment",
        },
    ];

    return (
        <VStack spacing={6} align="stretch">
            <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                    <Text
                        fontSize="xl"
                        fontWeight="700"
                        color={isDark ? "grey.100" : "grey.900"}
                    >
                        Deployment History
                    </Text>
                    <Button
                        size="sm"
                        colorScheme="green"
                        leftIcon={<PlayIcon size={14} />}
                    >
                        New Deployment
                    </Button>
                </HStack>

                <Box
                    borderRadius="8px"
                    border="1px solid"
                    borderColor={isDark ? "grey.700" : "grey.200"}
                    overflow="hidden"
                >
                    <Table variant="simple">
                        <Thead bg={isDark ? "grey.900" : "white"}>
                            <Tr>
                                <Th
                                    borderColor={
                                        isDark ? "grey.700" : "grey.200"
                                    }
                                >
                                    Version
                                </Th>
                                <Th
                                    borderColor={
                                        isDark ? "grey.700" : "grey.200"
                                    }
                                >
                                    Date
                                </Th>
                                <Th
                                    borderColor={
                                        isDark ? "grey.700" : "grey.200"
                                    }
                                >
                                    Author
                                </Th>
                                <Th
                                    borderColor={
                                        isDark ? "grey.700" : "grey.200"
                                    }
                                >
                                    Changes
                                </Th>
                                <Th
                                    borderColor={
                                        isDark ? "grey.700" : "grey.200"
                                    }
                                >
                                    Status
                                </Th>
                                <Th
                                    borderColor={
                                        isDark ? "grey.700" : "grey.200"
                                    }
                                >
                                    Actions
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {deploymentHistory.map((deploy, idx) => (
                                <Tr
                                    key={idx}
                                    _hover={{
                                        bg: isDark ? "grey.900" : "white",
                                    }}
                                >
                                    <Td
                                        borderColor={
                                            isDark ? "grey.800" : "grey.100"
                                        }
                                    >
                                        <HStack>
                                            <Box
                                                w="8px"
                                                h="8px"
                                                borderRadius="full"
                                                bg={
                                                    deploy.status === "current"
                                                        ? "green.500"
                                                        : isDark
                                                          ? "grey.600"
                                                          : "grey.400"
                                                }
                                            />
                                            <Text
                                                fontWeight="600"
                                                fontFamily="mono"
                                            >
                                                {deploy.version}
                                            </Text>
                                        </HStack>
                                    </Td>
                                    <Td
                                        borderColor={
                                            isDark ? "grey.800" : "grey.100"
                                        }
                                    >
                                        <Text
                                            fontSize="sm"
                                            color={
                                                isDark ? "grey.400" : "grey.600"
                                            }
                                        >
                                            {deploy.date}
                                        </Text>
                                    </Td>
                                    <Td
                                        borderColor={
                                            isDark ? "grey.800" : "grey.100"
                                        }
                                    >
                                        <Text fontSize="sm">
                                            {deploy.author}
                                        </Text>
                                    </Td>
                                    <Td
                                        borderColor={
                                            isDark ? "grey.800" : "grey.100"
                                        }
                                    >
                                        <Text
                                            fontSize="sm"
                                            color={
                                                isDark ? "grey.400" : "grey.600"
                                            }
                                        >
                                            {deploy.changes}
                                        </Text>
                                    </Td>
                                    <Td
                                        borderColor={
                                            isDark ? "grey.800" : "grey.100"
                                        }
                                    >
                                        {deploy.status === "current" ? (
                                            <Badge
                                                colorScheme="green"
                                                fontSize="xs"
                                            >
                                                Current
                                            </Badge>
                                        ) : (
                                            <Badge
                                                colorScheme="gray"
                                                fontSize="xs"
                                            >
                                                Previous
                                            </Badge>
                                        )}
                                    </Td>
                                    <Td
                                        borderColor={
                                            isDark ? "grey.800" : "grey.100"
                                        }
                                    >
                                        <HStack spacing={2}>
                                            {deploy.status !== "current" && (
                                                <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    color={
                                                        isDark
                                                            ? "grey.400"
                                                            : "grey.600"
                                                    }
                                                    _hover={{
                                                        bg: isDark
                                                            ? "grey.800"
                                                            : "grey.100",
                                                    }}
                                                >
                                                    Rollback
                                                </Button>
                                            )}
                                            <IconButton
                                                icon={<CopyIcon size={14} />}
                                                size="xs"
                                                variant="ghost"
                                                aria-label="Copy version"
                                            />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </VStack>
        </VStack>
    );
};
