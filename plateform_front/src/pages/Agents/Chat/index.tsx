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

    const playgroundUrl = `${process.env.REACT_APP_BACKEND_URL ?? ""}/workspaces/${workspaceId}/agents/${agentId}/runtime/playground`;
    const { sendQuery } = useAgentQuery(workspaceId, agentId, false, playgroundUrl);

    const getResponse = useCallback(
        async (question: string, onChunk: (partialText: string) => void) => {
            const fullText = await sendQuery(question, onChunk);
            return { response: [fullText] };
        },
        [sendQuery],
    );

    return (
        <VStack w="100%" h="100vh" align="stretch" spacing={0} overflow="hidden">
            <WorkspaceHeader
                title="Bac à sable de l'assistant"
                description="Ceci est un espace de test pour votre assistant de chat. Testez-le avant de le déployer en production."
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
