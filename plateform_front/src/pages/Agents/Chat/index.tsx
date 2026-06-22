import { Box, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useCallback } from "react";
import { ChatInterface } from "components/ui/chat/ChatInterface";
import { useUserInfo } from "hooks/useUserInfo";
import { useAgentQuery } from "hooks/chat";

const ChatWorkspace = () => {
    const { name } = useUserInfo();
    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    const playgroundUrl = `${(process.env.REACT_APP_BACKEND_URL ?? "").replace(/\/$/, "")}/workspaces/${workspaceId}/agents/${agentId}/runtime/playground`;
    const { sendQuery } = useAgentQuery(workspaceId, agentId, playgroundUrl);

    const getResponse = useCallback(
        (question: string, onChunk: (partial: string) => void) => sendQuery(question, onChunk),
        [sendQuery],
    );

    return (
        <VStack w="100%" h="100vh" align="stretch" spacing={0} overflow="hidden">
            <Box
                p={8}
                px={{ base: 4, xl: 52, lg: 24, md: 16, sm: 8 }}
                w="70%"
                flex={1}
                minH={0}
                display="flex"
                flexDirection="column"
                overflow="hidden"
                alignSelf="center"
            >
                <Box flex={1} minH={0} display="flex" flexDirection="column">
                    <ChatInterface
                        fullHeight
                        title="Discussion"
                        getResponse={getResponse}
                        placeholder="Entrez votre question"
                        welcomeMessage={
                            name
                                ? `Bonjour ${name} ! Je suis votre assistant. Posez-moi une question sur vos documents.`
                                : "Bonjour ! Je suis votre assistant. Posez-moi une question sur vos documents."
                        }
                    />
                </Box>
            </Box>
        </VStack>
    );
};

export default ChatWorkspace;
