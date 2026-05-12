import React from "react";
import { Box, Grid, HStack, Icon, Stack, Text, VStack, useColorMode } from "@chakra-ui/react";
import { Bot, ChevronRight, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConversationPreview } from "services/chat/chat";
import AssistantInput from "./AssistantInput";

const AVATAR_COLORS = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#0891B2"];

const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

interface SuggestedQuestion {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    iconBg: string;
    iconColor: string;
}

interface AssistantHomeProps {
    title: string;
    sharedBy?: string;
    conversations: ConversationPreview[];
    suggestedQuestions?: SuggestedQuestion[];
    isLoading?: boolean;
    onSend: (question: string) => void;
    onSelectConversation: (id: string) => void;
}

const AssistantHome: React.FC<AssistantHomeProps> = ({
    title,
    sharedBy,
    conversations,
    suggestedQuestions,
    isLoading,
    onSend,
    onSelectConversation,
}) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const navigate = useNavigate();
    const avatarColor = getAvatarColor(title);
    const recentConvs = conversations.slice(0, 6);

    return (
        <Box
            w="100%"
            h="100vh"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            position="relative"
            bg={isDark ? "#0D0D0D" : "grey.50"}
        >
            <Box
                position="absolute"
                inset={0}
                pointerEvents="none"
                zIndex={0}
                backgroundImage={`
                    repeating-linear-gradient(
                        to right,
                        ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} 0,
                        ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} 1px,
                        transparent 1px,
                        transparent 32px
                    ),
                    repeating-linear-gradient(
                        to bottom,
                        ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} 0,
                        ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} 1px,
                        transparent 1px,
                        transparent 32px
                    )
                `}
                backgroundSize="32px 32px"
                backgroundPosition="center"
            />

            <HStack
                position="relative"
                zIndex={1}
                px={4}
                py={2.5}
                borderBottom={`1px solid`}
                borderColor={isDark ? "grey.800" : "grey.100"}
                justify="space-between"
                bg={isDark ? "rgba(13,13,13,0.8)" : "white"}
                backdropFilter="blur(12px)"
            >
                <HStack spacing={1}>
                    <HStack
                        as="button"
                        spacing={2}
                        px={3}
                        py={1.5}
                        borderRadius="8px"
                        border={`1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`}
                        cursor="pointer"
                        color={isDark ? "grey.400" : "grey.600"}
                        fontSize="sm"
                        _hover={{ bg: isDark ? "rgba(255,255,255,0.05)" : "grey.100" }}
                        onClick={() => navigate("/assistants")}
                    >
                        <Icon as={LayoutGrid} boxSize={3.5} />
                        <Text>Tous les assistants</Text>
                    </HStack>
                    <Icon as={ChevronRight} boxSize={3.5} color={isDark ? "grey.600" : "grey.400"} />
                    <Text fontSize="sm" fontWeight="medium" color={isDark ? "grey.200" : "grey.700"}>
                        {title}
                    </Text>
                </HStack>
            </HStack>
            <Box flex={1} minH={0} overflowY="auto" position="relative" zIndex={1}>
                <VStack maxW="680px" mx="auto" px={4} pt={16} pb={12} spacing={0} align="stretch">
                    <VStack spacing={4} mb={8}>
                        <Box
                            px={3}
                            py={1}
                            borderRadius="full"
                            bg={isDark ? "rgba(52,211,169,0.12)" : "rgba(52,211,169,0.15)"}
                            border="1px solid rgba(52,211,169,0.3)"
                        >
                            <Text fontSize="11px" fontWeight="700" letterSpacing="0.08em" color="#34D3A9">
                                RAG
                            </Text>
                        </Box>

                        <Box
                            w="72px"
                            h="72px"
                            borderRadius="20px"
                            bg={avatarColor + "33"}
                            border={`1px solid ${avatarColor}55`}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon as={Bot} boxSize={8} color={avatarColor} />
                        </Box>

                        <VStack spacing={2}>
                            <Text
                                fontSize="3xl"
                                fontWeight="bold"
                                color={isDark ? "white" : "grey.900"}
                                textAlign="center"
                            >
                                {title}
                            </Text>
                            {sharedBy && (
                                <Text fontSize="sm" color={isDark ? "grey.400" : "grey.500"} textAlign="center">
                                    Partagé par · {sharedBy}
                                </Text>
                            )}
                        </VStack>
                    </VStack>

                    <AssistantInput
                        onSubmit={onSend}
                        placeholder={`Posez votre question à ${title}…`}
                        isLoading={isLoading}
                    />

                    {suggestedQuestions && suggestedQuestions.length > 0 && (
                        <Grid mt={6} templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
                            {suggestedQuestions.map((q, i) => (
                                <Box
                                    key={i}
                                    as="button"
                                    textAlign="left"
                                    p={4}
                                    borderRadius="14px"
                                    border={`1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`}
                                    bg={isDark ? "rgba(255,255,255,0.03)" : "white"}
                                    cursor="pointer"
                                    transition="all 0.15s"
                                    _hover={{
                                        bg: isDark ? "rgba(255,255,255,0.06)" : "grey.50",
                                        borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)",
                                    }}
                                    onClick={() => onSend(q.title)}
                                >
                                    <VStack align="start" spacing={2}>
                                        <Box
                                            w="32px"
                                            h="32px"
                                            borderRadius="8px"
                                            bg={q.iconBg}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Icon as={q.icon} boxSize={4} color={q.iconColor} />
                                        </Box>
                                        <VStack align="start" spacing={0.5}>
                                            <Text fontSize="sm" fontWeight="600" color={isDark ? "white" : "grey.900"}>
                                                {q.title}
                                            </Text>
                                            <Text fontSize="xs" color={isDark ? "grey.500" : "grey.500"}>
                                                {q.subtitle}
                                            </Text>
                                        </VStack>
                                    </VStack>
                                </Box>
                            ))}
                        </Grid>
                    )}

                    {recentConvs.length > 0 && (
                        <Box mt={10}>
                            <HStack justify="space-between" mb={4}>
                                <Text
                                    fontSize="sm"
                                    fontWeight="700"
                                    textTransform="uppercase"
                                    color={isDark ? "grey.600" : "grey.400"}
                                >
                                    Conversations récentes
                                </Text>
                            </HStack>

                            <Stack spacing={2}>
                                {recentConvs.map((conv) => (
                                    <HStack
                                        key={conv.id}
                                        as="button"
                                        justify="space-between"
                                        px={3}
                                        py={2.5}
                                        borderRadius="10px"
                                        cursor="pointer"
                                        transition="all 0.15s"
                                        bg={isDark ? "grey.950" : "white"}
                                        boxShadow="lg"
                                        onClick={() => onSelectConversation(conv.id)}
                                        w="100%"
                                    >
                                        <HStack spacing={3} flex={1} minW={0}>
                                            <Box
                                                w="6px"
                                                h="6px"
                                                borderRadius="full"
                                                bg={isDark ? "grey.600" : "grey.300"}
                                                flexShrink={0}
                                            />
                                            <Text
                                                fontSize="sm"
                                                color={isDark ? "grey.300" : "grey.700"}
                                                noOfLines={1}
                                                textAlign="left"
                                            >
                                                {conv.title ??
                                                    conv.lastMessage ??
                                                    `Conversation ${conv.id.slice(0, 8)}`}
                                            </Text>
                                        </HStack>
                                        {conv.updatedAt && (
                                            <Text
                                                fontSize="xs"
                                                color={isDark ? "grey.600" : "grey.400"}
                                                flexShrink={0}
                                                ml={2}
                                            >
                                                {formatDate(conv.updatedAt)}
                                            </Text>
                                        )}
                                    </HStack>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </VStack>
            </Box>
        </Box>
    );
};

export default AssistantHome;
