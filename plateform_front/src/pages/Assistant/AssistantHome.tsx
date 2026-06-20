import React from "react";
import { Box, HStack, Icon, Stack, Text, VStack, useColorMode } from "@chakra-ui/react";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConversationPreview } from "services/chat/chat";
import AssistantInput from "components/Assistant/AssistantInput";
import ConversationSidebar from "components/Assistant/ConversationSidebar";
import Button from "components/ui/Button";

interface AssistantHomeProps {
    title: string;
    sharedBy?: string;
    conversations: ConversationPreview[];
    isLoading?: boolean;
    onSend: (question: string) => void;
    onSelectConversation: (id: string) => void;
}

const AssistantHome: React.FC<AssistantHomeProps> = ({
    title,
    sharedBy,
    conversations,
    isLoading,
    onSend,
    onSelectConversation,
}) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const navigate = useNavigate();

    return (
        <Box w="100%" h="100vh" display="flex" flexDirection="column">
            <HStack h="100%" align="stretch" spacing={0}>
                <ConversationSidebar
                    title={title}
                    sharedBy={sharedBy}
                    conversations={conversations}
                    currentConversationId={null}
                    onSelectConversation={onSelectConversation}
                    onNewConversation={() => {}}
                />
                <Stack flex={1} h="100%" position="relative" zIndex={0} align="stretch" justify="flex-start">
                    <Box
                        position="absolute"
                        inset={0}
                        pointerEvents="none"
                        zIndex={0}
                        background={
                            isDark
                                ? "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 25%, rgba(44, 44, 44, 0.65) 100%)"
                                : "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 25%, rgba(247, 246, 246, 0.75) 100%)"
                        }
                    />
                    <HStack position="relative" zIndex={2} px={4} py={2.5} spacing={1} bg="transparent">
                        <Button
                            leftIcon={LayoutGrid}
                            variant="outline"
                            onClick={() => navigate("/assistants")}
                            aria-label="All assistants"
                        >
                            Tout les assistants
                        </Button>
                        <Icon as={ChevronRight} boxSize={3.5} color={isDark ? "grey.600" : "grey.400"} />
                        <Text fontSize="sm" fontWeight="medium" color={isDark ? "grey.300" : "grey.700"}>
                            {title}
                        </Text>
                    </HStack>

                    <Box flex={1} minH={0} display="flex" flexDirection="column" position="relative" zIndex={1}>
                        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                            <VStack spacing={5} textAlign="center" px={4}>
                                <VStack spacing={1}>
                                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
                                        {title}
                                    </Text>
                                    {sharedBy && (
                                        <Text fontSize="sm" color={isDark ? "grey.500" : "grey.400"}>
                                            Partagé par · {sharedBy}
                                        </Text>
                                    )}
                                </VStack>
                                <Box pb={8} px={4}>
                                    <Box w="660px" mx="auto">
                                        <AssistantInput onSubmit={onSend} isLoading={isLoading} />
                                    </Box>
                                </Box>
                            </VStack>
                        </Box>
                    </Box>
                </Stack>
            </HStack>
        </Box>
    );
};

export default AssistantHome;
