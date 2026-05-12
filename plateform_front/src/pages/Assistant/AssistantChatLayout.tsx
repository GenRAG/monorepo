import React, { useEffect, useRef } from "react";
import { Box, Circle, HStack, Icon, IconButton, Skeleton, Text, VStack, useColorMode } from "@chakra-ui/react";
import { Bot, Edit3 } from "lucide-react";
import { ChatMessage } from "hooks/useChat";
import { ConversationPreview } from "services/chat/chat";
import ReactMarkdown from "react-markdown";
import { getMarkdownStyles } from "components/System/Molecules/Chat/markdownStyles";
import AssistantInput from "./AssistantInput";

const AVATAR_COLORS = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#0891B2"];
const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const formatTime = (ts: number) => new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const groupConversations = (convs: ConversationPreview[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    const groups: { label: string; items: ConversationPreview[] }[] = [];
    const bucket = (c: ConversationPreview) => {
        if (!c.updatedAt) return "older";
        const d = new Date(c.updatedAt);
        if (d >= today) return "today";
        if (d >= yesterday) return "yesterday";
        if (d >= weekAgo) return "week";
        return "older";
    };

    const labeled = {
        today: [] as ConversationPreview[],
        yesterday: [] as ConversationPreview[],
        week: [] as ConversationPreview[],
        older: [] as ConversationPreview[],
    };
    convs.forEach((c) => labeled[bucket(c)].push(c));

    if (labeled.today.length > 0) groups.push({ label: "Aujourd'hui", items: labeled.today });
    if (labeled.yesterday.length > 0) groups.push({ label: "Hier", items: labeled.yesterday });
    if (labeled.week.length > 0) groups.push({ label: "Cette semaine", items: labeled.week });
    if (labeled.older.length > 0) groups.push({ label: "Plus ancien", items: labeled.older });

    return groups;
};

const formatDateShort = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (days < 1) return "";
    if (days < 7) return `${date.getDate()} ${date.toLocaleDateString("fr-FR", { month: "short" })}`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

interface AssistantChatLayoutProps {
    title: string;
    sharedBy?: string;
    userName: string;
    messages: ChatMessage[];
    conversations: ConversationPreview[];
    currentConversationId: string | null;
    isLoading: boolean;
    onSend: (question: string) => void;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
}

const AssistantChatLayout: React.FC<AssistantChatLayoutProps> = ({
    title,
    sharedBy,
    userName,
    messages,
    conversations,
    currentConversationId,
    isLoading,
    onSend,
    onSelectConversation,
    onNewConversation,
}) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const avatarColor = getAvatarColor(title);
    const userInitials = getInitials(userName || "U");
    const borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
    const sidebarBg = isDark ? "#111111" : "#F8F8F8";
    const mainBg = isDark ? "#0D0D0D" : "white";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const groups = groupConversations(conversations);

    return (
        <HStack w="100%" h="100vh" spacing={0} align="stretch" overflow="hidden">
            <Box
                w="260px"
                minW="260px"
                h="100%"
                bg={sidebarBg}
                borderRight={`1px solid ${borderColor}`}
                display="flex"
                flexDirection="column"
                overflow="hidden"
            >
                <Box px={3} pt={4} pb={3} borderBottom={`1px solid ${borderColor}`}>
                    <HStack justify="space-between" mb={3}>
                        <HStack spacing={2.5}>
                            <Box
                                w="32px"
                                h="32px"
                                borderRadius="9px"
                                bg={avatarColor + "33"}
                                border={`1px solid ${avatarColor}44`}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                            >
                                <Icon as={Bot} boxSize={4} color={avatarColor} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color={isDark ? "white" : "grey.900"}
                                    noOfLines={1}
                                >
                                    {title}
                                </Text>
                                {sharedBy && (
                                    <Text fontSize="10px" color={isDark ? "grey.500" : "grey.500"}>
                                        partagé par {sharedBy}
                                    </Text>
                                )}
                            </VStack>
                        </HStack>
                        <IconButton
                            aria-label="Nouvelle conversation"
                            icon={<Edit3 size={14} />}
                            size="xs"
                            variant="ghost"
                            color={isDark ? "grey.400" : "grey.500"}
                            _hover={{ bg: isDark ? "rgba(255,255,255,0.07)" : "grey.200" }}
                            onClick={onNewConversation}
                        />
                    </HStack>
                </Box>

                <Box flex={1} overflowY="auto" py={2}>
                    {groups.map((group) => (
                        <Box key={group.label} mb={3}>
                            <Text
                                fontSize="9px"
                                fontWeight="700"
                                letterSpacing="0.12em"
                                textTransform="uppercase"
                                color={isDark ? "grey.700" : "grey.400"}
                                px={4}
                                mb={2}
                            >
                                {group.label}
                            </Text>
                            {group.items.map((conv) => {
                                const isActive = conv.id === currentConversationId;
                                return (
                                    <HStack
                                        key={conv.id}
                                        as="button"
                                        w="100%"
                                        justify="space-between"
                                        p={2}
                                        cursor="pointer"
                                        bg={
                                            isActive
                                                ? isDark
                                                    ? "rgba(255,255,255,0.08)"
                                                    : "rgba(0,0,0,0.05)"
                                                : "transparent"
                                        }
                                        borderLeft={isActive ? "2px solid #34D3A9" : "2px solid transparent"}
                                        _hover={{ bg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
                                        transition="all 0.12s"
                                        onClick={() => onSelectConversation(conv.id)}
                                    >
                                        <HStack spacing={2} flex={1} minW={0}>
                                            <Circle
                                                size="6px"
                                                bg={isActive ? "#34D3A9" : isDark ? "grey.700" : "grey.300"}
                                                flexShrink={0}
                                            />
                                            <Text
                                                fontSize="xs"
                                                noOfLines={1}
                                                textAlign="left"
                                                color={
                                                    isActive
                                                        ? isDark
                                                            ? "white"
                                                            : "grey.900"
                                                        : isDark
                                                          ? "grey.400"
                                                          : "grey.600"
                                                }
                                                fontWeight={isActive ? "500" : "400"}
                                            >
                                                {conv.title ??
                                                    conv.lastMessage ??
                                                    `Conversation ${conv.id.slice(0, 8)}`}
                                            </Text>
                                        </HStack>
                                        {conv.updatedAt && (
                                            <Text
                                                fontSize="9px"
                                                color={isDark ? "grey.700" : "grey.400"}
                                                flexShrink={0}
                                            >
                                                {formatDateShort(conv.updatedAt)}
                                            </Text>
                                        )}
                                    </HStack>
                                );
                            })}
                        </Box>
                    ))}

                    {conversations.length === 0 && (
                        <Text fontSize="xs" color={isDark ? "grey.600" : "grey.400"} px={2} py={4}>
                            Aucune conversation
                        </Text>
                    )}
                </Box>
            </Box>

            <Box flex={1} h="100%" display="flex" flexDirection="column" bg={mainBg} minW={0}>
                <HStack
                    px={4}
                    py={3}
                    borderBottom={`1px solid ${borderColor}`}
                    justify="space-between"
                    bg={isDark ? "rgba(13,13,13,0.9)" : "rgba(255,255,255,0.9)"}
                    backdropFilter="blur(12px)"
                    flexShrink={0}
                >
                    <HStack spacing={3}>
                        <Box
                            w="34px"
                            h="34px"
                            borderRadius="9px"
                            bg={avatarColor + "33"}
                            border={`1px solid ${avatarColor}44`}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon as={Bot} boxSize={4} color={avatarColor} />
                        </Box>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="600" color={isDark ? "white" : "grey.900"}>
                                {title}
                            </Text>
                            <HStack spacing={2}>
                                <HStack spacing={1}>
                                    <Circle size="6px" bg="#34D3A9" />
                                    <Text fontSize="11px" color={isDark ? "grey.400" : "grey.500"}>
                                        En ligne
                                    </Text>
                                </HStack>
                            </HStack>
                        </VStack>
                    </HStack>
                </HStack>

                <Box flex={1} minH={0} overflowY="auto" px={6} py={6}>
                    {messages.length === 0 && isLoading && (
                        <VStack spacing={4} align="stretch">
                            {[1, 2].map((i) => (
                                <Skeleton
                                    key={i}
                                    height="60px"
                                    borderRadius="12px"
                                    startColor={isDark ? "grey.800" : "grey.100"}
                                    endColor={isDark ? "grey.700" : "grey.200"}
                                />
                            ))}
                        </VStack>
                    )}

                    {messages.map((msg) => (
                        <Box key={msg.id} mb={6}>
                            <HStack justify="flex-end" mb={4} align="flex-start">
                                <Box
                                    maxW="65%"
                                    px={4}
                                    py={3}
                                    borderRadius="16px"
                                    borderBottomRightRadius="4px"
                                    bg={isDark ? "rgba(255,255,255,0.08)" : "grey.100"}
                                >
                                    <Text fontSize="sm" color={isDark ? "grey.100" : "grey.800"} lineHeight="1.6">
                                        {msg.question}
                                    </Text>
                                </Box>
                                <Box
                                    w="32px"
                                    h="32px"
                                    borderRadius="full"
                                    flexShrink={0}
                                    bg={isDark ? "#34D3A922" : "#34D3A933"}
                                    border="1px solid #34D3A944"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Text fontSize="10px" fontWeight="700" color="#34D3A9">
                                        {userInitials}
                                    </Text>
                                </Box>
                            </HStack>

                            {/* Agent response */}
                            {msg.response.length > 0 && msg.response[0] ? (
                                <HStack align="flex-start" spacing={3}>
                                    <Box
                                        w="32px"
                                        h="32px"
                                        borderRadius="9px"
                                        flexShrink={0}
                                        bg={avatarColor + "33"}
                                        border={`1px solid ${avatarColor}44`}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Icon as={Bot} boxSize={3.5} color={avatarColor} />
                                    </Box>
                                    <Box flex={1} minW={0}>
                                        <HStack spacing={2} mb={2}>
                                            <Text
                                                fontSize="xs"
                                                fontWeight="600"
                                                color={isDark ? "grey.300" : "grey.700"}
                                            >
                                                {title}
                                            </Text>
                                            <Text fontSize="10px" color={isDark ? "grey.600" : "grey.400"}>
                                                {formatTime(msg.timestamp)}
                                            </Text>
                                        </HStack>
                                        <Box
                                            fontSize="sm"
                                            color={isDark ? "grey.200" : "grey.700"}
                                            lineHeight="1.75"
                                            sx={getMarkdownStyles(colorMode)}
                                        >
                                            <ReactMarkdown>{msg.response[0]}</ReactMarkdown>
                                        </Box>
                                    </Box>
                                </HStack>
                            ) : msg.response.length === 0 && isLoading ? (
                                <HStack align="flex-start" spacing={3}>
                                    <Box
                                        w="32px"
                                        h="32px"
                                        borderRadius="9px"
                                        flexShrink={0}
                                        bg={avatarColor + "33"}
                                        border={`1px solid ${avatarColor}44`}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Icon as={Bot} boxSize={3.5} color={avatarColor} />
                                    </Box>
                                    <Box flex={1} pt={1}>
                                        <HStack spacing={1.5}>
                                            {[0, 1, 2].map((i) => (
                                                <Box
                                                    key={i}
                                                    w="7px"
                                                    h="7px"
                                                    borderRadius="full"
                                                    bg="#34D3A9"
                                                    opacity={0.7}
                                                    animation={`pulse 1.2s ease-in-out ${i * 0.2}s infinite`}
                                                />
                                            ))}
                                        </HStack>
                                    </Box>
                                </HStack>
                            ) : null}
                        </Box>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Input */}
                <Box px={4} pb={4} pt={2} flexShrink={0}>
                    <AssistantInput
                        onSubmit={onSend}
                        placeholder={`Posez votre question à ${title}…`}
                        isLoading={isLoading}
                        compact
                    />
                </Box>
            </Box>
        </HStack>
    );
};

export default AssistantChatLayout;
