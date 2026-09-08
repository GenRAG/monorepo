import React, { useMemo, useState } from "react";
import { Box, HStack, Text, useColorMode, VStack } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage, RagSource } from "hooks/chat";
import { getMarkdownStyles } from "components/ui/chat/markdownStyles";
import ThinkingBubble from "components/ui/chat/ThinkingBubble";
import Button from "@/components/ui/Button";
import { QueryDetailsDrawer } from "./Drawer/QueryDetailsDrawer";
import { QuerySource, QueryDetailsInfo, SourceFileType } from "./Drawer/types";
import { formatDateTime } from "utils/documentFormatters";

const formatTime = (ts: number) => new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const EXTENSION_TO_FILE_TYPE: Record<string, SourceFileType> = {
    pdf: "PDF",
    docx: "DOCX",
    doc: "DOC",
    md: "MD",
    html: "HTML",
    htm: "HTML",
    txt: "TXT",
};

const getFileTypeFromTitle = (title: string): SourceFileType => {
    const ext = title.split(".").pop()?.toLowerCase() ?? "";
    return EXTENSION_TO_FILE_TYPE[ext] ?? "TXT";
};

const mapToQuerySources = (sources: RagSource[] = []): QuerySource[] =>
    sources.map((s) => ({
        index: s.index,
        title: s.title,
        score: s.score,
        excerpt: s.text_preview?.trim() ?? "",
        fileType: getFileTypeFromTitle(s.title),
    }));

const buildDetails = (
    msg: ChatMessage,
    agentTitle: string,
    agentVersion: string | undefined,
    documentsConsulted: number,
): QueryDetailsInfo => ({
    receivedAt: formatDateTime(new Date(msg.timestamp)),
    agentTitle,
    agentVersion,
    durationMs: msg.durationMs,
    documentsConsulted,
});

interface MessageItemProps {
    msg: ChatMessage;
    assistantId: string;
    agentVersion?: string;
    agentTitle: string;
    isLoading: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ msg, assistantId, agentVersion, agentTitle, isLoading }) => {
    const { colorMode } = useColorMode();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const sources = useMemo(() => mapToQuerySources(msg.sources), [msg.sources]);

    return (
        <Box mb={6}>
            <HStack justify="flex-end" mb={4} align="flex-start">
                <Box maxW="65%" px={4} py={3} borderRadius="16px" borderBottomRightRadius="4px" bg="bubbleSentBg">
                    <Text fontSize="md" color="textOnBubble" lineHeight="1.6">
                        {msg.question}
                    </Text>
                </Box>
            </HStack>

            {msg.response ? (
                <HStack align="flex-start" spacing={3}>
                    <Box flex={1} minW={0} maxW="100%" px={4} py={3} borderRadius="16px" borderBottomLeftRadius="4px">
                        <HStack spacing={2} mb={2}>
                            <Text fontSize="xs" fontWeight="600" color="textBody">
                                {agentTitle}
                            </Text>
                            <Text fontSize="10px" color="textMuted">
                                {formatTime(msg.timestamp)}
                            </Text>
                        </HStack>
                        <Box fontSize="md" color="textSecondary" lineHeight="1.75" sx={getMarkdownStyles(colorMode)}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.response}</ReactMarkdown>
                        </Box>
                        <VStack align="flex-start" spacing={2} mt={0}>
                            <HStack>
                                {sources.length > 0 &&
                                    sources.map((source) => (
                                        <Box key={source.index} mt={2} p={2} borderRadius="4px" bg="surfaceSubtle">
                                            <Text fontSize="sm" color="textBody">
                                                {source.title}
                                            </Text>
                                        </Box>
                                    ))}
                            </HStack>
                            <Button variant="solid" size="sm" onClick={() => setIsDetailsOpen(true)}>
                                Plus d&apos;infos
                            </Button>
                        </VStack>
                    </Box>
                </HStack>
            ) : isLoading ? (
                <HStack align="flex-start" spacing={3}>
                    <ThinkingBubble events={msg.thinkingEvents} />
                </HStack>
            ) : null}

            <QueryDetailsDrawer
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                agentTitle={agentTitle}
                assistantId={assistantId}
                sources={sources}
                details={buildDetails(msg, agentTitle, agentVersion, sources.length)}
            />
        </Box>
    );
};

export default MessageItem;
