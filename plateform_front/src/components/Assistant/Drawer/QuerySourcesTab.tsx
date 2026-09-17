import React from "react";
import { Box, HStack, Text, VStack, IconButton, Tooltip, Skeleton } from "@chakra-ui/react";
import { ExternalLink, FileWarning } from "lucide-react";
import Banner from "components/ui/Banner";
import { useGetSourceUrlQuery } from "services/chat/chat";
import { getPreviewUrl } from "utils/documentFormatters";
import { QuerySource, SourceFileType } from "types/assistant/assistant";

const FILE_TYPE_MIME: Record<SourceFileType, string> = {
    PDF: "application/pdf",
    DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    DOC: "application/msword",
    MD: "text/markdown",
    HTML: "text/html",
    TXT: "text/plain",
};

const PREVIEW_HEIGHT = "200px";

const SourcePreview: React.FC<{ source: QuerySource; url?: string; isLoading: boolean }> = ({
    source,
    url,
    isLoading,
}) => {
    if (isLoading) {
        return <Skeleton w="100%" h={PREVIEW_HEIGHT} borderRadius="8px" />;
    }

    if (!url) {
        return (
            <HStack
                w="100%"
                h={PREVIEW_HEIGHT}
                bg="surfaceHover"
                borderRadius="8px"
                justify="center"
                color="textMuted"
                spacing={2}
            >
                <FileWarning size={16} />
                <Text fontSize="xs">Aperçu indisponible</Text>
            </HStack>
        );
    }

    const previewUrl = getPreviewUrl(FILE_TYPE_MIME[source.fileType], url);

    return (
        <Box
            w="100%"
            h={PREVIEW_HEIGHT}
            borderRadius="8px"
            overflow="hidden"
            bg="white"
            borderWidth="1px"
            borderColor="borderDefault"
        >
            <Box as="iframe" src={previewUrl} title={source.title} w="100%" h="100%" border="0" />
        </Box>
    );
};

const SourceCard: React.FC<{ source: QuerySource; assistantId: string }> = ({ source, assistantId }) => {
    const { data, isFetching, isError } = useGetSourceUrlQuery({ assistantId, title: source.title });

    const handleOpen = () => {
        if (!data?.url) return;
        const a = document.createElement("a");
        a.href = data.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
    };

    return (
        <VStack
            align="stretch"
            spacing={2}
            p={3}
            bg="surfaceModal"
            borderRadius="12px"
            borderWidth="0.5px"
            borderColor="borderDefault"
        >
            <SourcePreview source={source} url={data?.url} isLoading={isFetching} />
            <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="semibold" color="textStrong" noOfLines={1} flex={1} minW={0}>
                    {source.title}
                </Text>
                <Tooltip label={isError ? "Document introuvable" : "Ouvrir le document"}>
                    <IconButton
                        aria-label="Ouvrir le document"
                        icon={<ExternalLink size={14} />}
                        size="xs"
                        variant="ghost"
                        flexShrink={0}
                        isDisabled={!data?.url}
                        onClick={handleOpen}
                    />
                </Tooltip>
            </HStack>
        </VStack>
    );
};

interface QuerySourcesTabProps {
    sources: QuerySource[];
    assistantId: string;
}

export const QuerySourcesTab: React.FC<QuerySourcesTabProps> = ({ sources, assistantId }) => {
    if (sources.length === 0) {
        return (
            <Banner variant="grey" flexShrink={0}>
                <Text variant="body-sm">Aucune source n&apos;a été utilisée pour générer cette réponse.</Text>
            </Banner>
        );
    }

    return (
        <VStack align="stretch" spacing={3}>
            {sources.map((source) => (
                <SourceCard key={source.index} source={source} assistantId={assistantId} />
            ))}
        </VStack>
    );
};
