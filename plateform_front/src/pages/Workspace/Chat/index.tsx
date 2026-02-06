import { Box, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react";
import Banner from "components/Atoms/Banner";
import { ChatInterface } from "components/Molecules/ChatInterface";
import WorkspaceHeader from "components/Molecules/WorkspaceHeader";
import { useUserInfo } from "hooks/useUserInfo";
import { useNavigate } from "react-router-dom";

const ChatWorkspace = () => {

    const navigate = useNavigate();
    const { name } = useUserInfo();

    return (
        <VStack w="100%" h="100vh" align="stretch" spacing={0} overflow="hidden">
            <WorkspaceHeader title="Chat Assistant Playground" description="This is a playground for your chat assistant. Test it before deploying it in production." />
            <Box p={4} w="100%" flex={1} minH={0} display="flex" flexDirection="column" overflow="hidden">
                <Banner variant="green" mb="16px" flexShrink={0} gap="0">
                    <HStack>
                        <Text color="grey.900">
                            Based on 12 documents, see more details in the
                        </Text>
                        <Text _hover={{ textDecoration: 'underline' }} onClick={() => { navigate('/workspace/12342/documents') }} cursor="pointer" color="blue.500">documents page</Text>
                    </HStack>
                </Banner>
                <Box flex={1} minH={0} display="flex" flexDirection="column">
                    <ChatInterface
                        fullHeight
                        title="Chat"
                        messages={[]}
                        onSendMessage={() => { }}
                        isLoading={false}
                        placeholder="Enter your question"
                        welcomeMessage={name ? `Hello ${name}! I'm your assistant. Ask me a question about your documents.` : "Hello! I'm your assistant. Ask me a question about your documents."}
                    />
                </Box>
            </Box>
        </VStack>
    );
};

export default ChatWorkspace;