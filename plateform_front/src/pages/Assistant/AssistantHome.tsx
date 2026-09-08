import React from "react";
import { Box, HStack, Icon, Stack, Text, VStack, useColorMode } from "@chakra-ui/react";
import { ChevronRight, LayoutGrid, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConversationPreview } from "services/chat/chat";
import AssistantInput from "components/Assistant/AssistantInput";
import ConversationSidebar from "components/Assistant/ConversationSidebar";
import Button from "components/ui/Button";

const MAX_RECENT_CONVERSATIONS = 3;

const formatRelativeDate = (iso: string) => {
    const date = new Date(iso);
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days < 1) return "Aujourd'hui";
    if (days < 7) return `${date.getDate()} ${date.toLocaleDateString("fr-FR", { month: "short" })}`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

interface AssistantHomeProps {
    title: string;
    sharedBy?: string;
    conversations: ConversationPreview[];
    isLoading?: boolean;
    onSend: (question: string) => void;
    onSelectConversation: (id: string) => void;
    disabled?: boolean;
    disabledMessage?: string;
}

const AssistantHome: React.FC<AssistantHomeProps> = ({
    title,
    sharedBy,
    conversations,
    isLoading,
    onSend,
    onSelectConversation,
    disabled,
    disabledMessage,
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
                    <Box position="absolute" inset={0} pointerEvents="none" zIndex={0} background="surfaceAppShell" />
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
                                            Partagé par {sharedBy}
                                        </Text>
                                    )}
                                </VStack>
                                <Box pb={8} px={4}>
                                    <Box w="660px" mx="auto">
                                        <AssistantInput
                                            onSubmit={onSend}
                                            isLoading={isLoading}
                                            disabled={disabled}
                                            disabledMessage={disabledMessage}
                                        />
                                    </Box>
                                </Box>

                                {conversations.length > 0 && (
                                    <VStack spacing={2} w="660px" maxW="100%" px={4} align="stretch">
                                        <Text variant="body-xs-muted" textAlign="left">
                                            Reprendre une conversation
                                        </Text>
                                        {[...conversations]
                                            .sort(
                                                (a, b) =>
                                                    new Date(b.updatedAt ?? 0).getTime() -
                                                    new Date(a.updatedAt ?? 0).getTime(),
                                            )
                                            .slice(0, MAX_RECENT_CONVERSATIONS)
                                            .map((conv) => (
                                                <HStack
                                                    key={conv.id}
                                                    as="button"
                                                    w="100%"
                                                    justify="space-between"
                                                    p={3}
                                                    borderRadius="10px"
                                                    border="1px solid"
                                                    borderColor="borderDefault"
                                                    bg="surfaceCard"
                                                    _hover={{ borderColor: "borderStrong", bg: "surfaceHover" }}
                                                    transition="all 0.12s"
                                                    onClick={() => onSelectConversation(conv.id)}
                                                >
                                                    <HStack spacing={2} minW={0}>
                                                        <Icon
                                                            as={MessageCircle}
                                                            boxSize={3.5}
                                                            color="textFaint"
                                                            flexShrink={0}
                                                        />
                                                        <Text fontSize="sm" noOfLines={1} color="textDescription">
                                                            {conv.title ??
                                                                conv.lastMessage ??
                                                                `Conversation ${conv.id.slice(0, 8)}`}
                                                        </Text>
                                                    </HStack>
                                                    {conv.updatedAt && (
                                                        <Text fontSize="xs" color="textFaint" flexShrink={0}>
                                                            {formatRelativeDate(conv.updatedAt)}
                                                        </Text>
                                                    )}
                                                </HStack>
                                            ))}
                                    </VStack>
                                )}
                            </VStack>
                        </Box>
                    </Box>
                </Stack>
            </HStack>
        </Box>
    );
};

export default AssistantHome;
