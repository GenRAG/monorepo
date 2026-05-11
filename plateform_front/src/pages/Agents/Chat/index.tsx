import { Box, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useCallback } from "react";
import { ChatInterface } from "components/System/Molecules/ChatInterface";
import WorkspaceHeader from "components/System/Molecules/WorkspaceHeader";
import { useUserInfo } from "hooks/useUserInfo";
import { useAgentQuery } from "hooks/useAgentQuery";

const ChatWorkspace = () => {
    const { name } = useUserInfo();
    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    const { sendQuery } = useAgentQuery(workspaceId, agentId);

    const getResponse = useCallback(
        async (question: string, onChunk: (partialText: string) => void) => {
            const fullText = await sendQuery(question, onChunk);
            return { response: [fullText] };
        },
        [sendQuery],
    );

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
                <Box flex={1} minH={0} display="flex" flexDirection="column">
                    <ChatInterface
                        fullHeight
                        title="Chat"
                        getResponse={getResponse}
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
