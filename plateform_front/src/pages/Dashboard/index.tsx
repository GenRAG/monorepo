import {
    Box,
    Button,
    Heading,
    Stack,
    Text,
    useColorMode,
    VStack,
} from "@chakra-ui/react";
import { ExternalLink } from "lucide-react";
import { useUserInfo } from "hooks/useUserInfo";
import { useGetUserWorkspacesQuery } from "services/workspace/workspace";
import { useNavigate } from "react-router-dom";

import RecentAssistant from "pages/Dashboard/RecentAssistant";
import { RagConfiguration } from "pages/Dashboard/RagConfiguration";
import { Metrics } from "pages/Dashboard/Metrics";
import { WorkflowPreview } from "components/Molecules/WorkflowPreview";

const Dashboard = () => {
    const { colorMode } = useColorMode();
    const { name } = useUserInfo();
    const { data: workspaces } = useGetUserWorkspacesQuery();
    const navigate = useNavigate();

    const isDark = colorMode === "dark";
    const textPrimary = isDark ? "white" : "grey.950";
    const textSecondary = isDark ? "grey.400" : "grey.500";

    const firstWorkspaceId = workspaces?.[0]?.id;
    const workflowUrl = firstWorkspaceId
        ? `/workspace/${firstWorkspaceId}/workflow`
        : "/dashboard";

    return (
        <Stack
            p={{ base: 4, lg: 6 }}
            gap={{ base: 4, lg: 6 }}
            overflow="auto"
            maxH="100vh"
        >
            <VStack align="stretch">
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
                    Welcome back, {name}
                </Heading>
                <Text color={textSecondary} variant="body-md">
                    Your AI assistant is running smoothly.
                </Text>
            </VStack>

            <Metrics />
            <VStack gap={6} alignItems="stretch" w="100%">
                <RecentAssistant />
                <VStack align="stretch" w="100%">
                    <Stack
                        p={2}
                        pb={0}
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
                            RAG Configuration
                        </Heading>
                        <Button
                            variant="secondary"
                            size="sm"
                            rightIcon={<ExternalLink size={16} />}
                            onClick={() => navigate(workflowUrl)}
                            alignSelf={{ base: "flex-start", sm: "center" }}
                        >
                            View Workflow
                        </Button>
                    </Stack>

                    <Stack align="stretch" gap={4} w="100%">
                        <Stack
                            w="100%"
                            align="stretch"
                            direction={{ base: "column", lg: "row" }}
                            gap={4}
                            flex={1}
                        >
                            <RagConfiguration />
                            <Box w="100%" alignSelf="stretch" flex={1}>
                                <WorkflowPreview
                                    height={{ base: "200px", lg: "100%" }}
                                />
                            </Box>
                        </Stack>
                    </Stack>
                </VStack>
            </VStack>
        </Stack>
    );
};

export default Dashboard;
