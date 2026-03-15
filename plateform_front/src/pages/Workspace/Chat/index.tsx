import { Box, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import Banner from "components/Atoms/Banner";
import { ChatInterface } from "components/Molecules/ChatInterface";
import WorkspaceHeader from "components/Molecules/WorkspaceHeader";
import { useUserInfo } from "hooks/useUserInfo";

const ChatWorkspace = () => {
    const { name } = useUserInfo();
    const { workspaceId, agentId } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    return (
        <VStack
            w="100%"
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
        >
            <WorkspaceHeader
                title="Chat Assistant Playground"
                description="This is a playground for your chat assistant. Test it before deploying it in production."
            />
            <Box
                p={4}
                px={{ base: 4, xl: 36, lg: 24, md: 16, sm: 8 }}
                w="100%"
                flex={1}
                minH={0}
                display="flex"
                flexDirection="column"
                overflow="hidden"
            >
                <Banner variant="green" mb="16px" flexShrink={0} gap="0">
                    <HStack>
                        <Text
                            color="grey.900"
                            fontSize={{ base: "xs", md: "sm" }}
                        >
                            Based on 12 documents, see more details in the{" "}
                            <Link
                                href={
                                    workspaceId && agentId
                                        ? `/workspaces/${workspaceId}/agents/${agentId}/documents`
                                        : "#"
                                }
                                color="blue.500"
                            >
                                documents page
                            </Link>
                        </Text>
                    </HStack>
                </Banner>
                <Box flex={1} minH={0} display="flex" flexDirection="column">
                    <ChatInterface
                        fullHeight
                        title="Chat"
                        messages={[]}
                        onSendMessage={() => {}}
                        isLoading={false}
                        placeholder="Enter your question"
                        welcomeMessage={
                            name
                                ? `Hello ${name}! I'm your assistant. Ask me a question about your documents.`
                                : "Hello! I'm your assistant. Ask me a question about your documents."
                        }
                    />
                </Box>
            </Box>
        </VStack>
    );
};

export default ChatWorkspace;
