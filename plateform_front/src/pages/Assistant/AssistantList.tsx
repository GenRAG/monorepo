import {
    Box,
    Heading,
    Stack,
    Text,
    useColorMode,
    VStack,
    HStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

interface AssistantPreview {
    id: string;
    title: string;
    lastMessage: string;
    updatedAt: string;
    sharedBy: string;
}

export const AssistantsList = () => {
    const { colorMode } = useColorMode();
    const navigate = useNavigate();
    const textPrimary = useColorModeValue("grey.950", "grey.50");

    const Assistants: AssistantPreview[] = [
        {
            id: "1",
            title: "Contract Risk Analysis",
            lastMessage: "Here are the main clauses that require attention...",
            updatedAt: "2026-02-20T14:30:00",
            sharedBy: "Quentin",
        },
        {
            id: "2",
            title: "Marketing Strategy Q1",
            lastMessage: "We should focus on increasing inbound traffic...",
            updatedAt: "2026-02-18T09:12:00",
            sharedBy: "Sophie",
        },
    ];

    return (
        <Stack p={6} gap={8} overflow="auto" maxH="100vh">
            <VStack align="stretch" spacing={2}>
                <Heading
                    variant="heading-md"
                    color={colorMode === "dark" ? "grey.400" : "grey.400"}
                    fontWeight="md"
                    fontSize={{ base: "sm", md: "md" }}
                >
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </Heading>

                <Heading
                    variant="heading-3xl"
                    color={textPrimary}
                    fontWeight="semibold"
                    fontSize={{ base: "xl", md: "3xl" }}
                >
                    Assistants
                </Heading>

                <Text
                    color={colorMode === "dark" ? "grey.400" : "grey.500"}
                    variant="body-md"
                >
                    Assistants shared with you.
                </Text>
            </VStack>

            <VStack align="stretch" spacing={4}>
                {Assistants.map((Assistant) => (
                    <Box
                        key={Assistant.id}
                        p={5}
                        borderRadius="12px"
                        borderWidth="1px"
                        borderColor={
                            colorMode === "dark" ? "grey.700" : "grey.200"
                        }
                        bg={colorMode === "dark" ? "grey.900" : "white"}
                        cursor="pointer"
                        transition="all 0.2s ease"
                        _hover={{
                            transform: "translateY(-2px)",
                            shadow: "md",
                        }}
                        onClick={() => navigate(`/assistants/${Assistant.id}`)}
                    >
                        <VStack align="stretch" spacing={2}>
                            <Heading
                                variant="heading-3xl"
                                color={textPrimary}
                                fontWeight="semibold"
                                fontSize={{ base: "xl", md: "3xl" }}
                            >
                                {Assistant.title}
                            </Heading>

                            <Text fontSize="sm" color="grey.500" noOfLines={1}>
                                {Assistant.lastMessage}
                            </Text>

                            <HStack
                                justify="space-between"
                                pt={2}
                                fontSize="xs"
                                color="grey.400"
                            >
                                <Text>
                                    {new Date(
                                        Assistant.updatedAt,
                                    ).toLocaleDateString()}
                                </Text>
                                <Text>Shared by {Assistant.sharedBy}</Text>
                            </HStack>
                        </VStack>
                    </Box>
                ))}
            </VStack>
        </Stack>
    );
};
