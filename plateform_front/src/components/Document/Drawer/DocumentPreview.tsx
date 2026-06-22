import React from "react";
import { VStack, Text, Box, useColorModeValue } from "@chakra-ui/react";
import { File } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useGetDocumentContentQuery } from "services/document/document";
import { useParams } from "react-router-dom";

interface DocumentPreviewProps {
    document: {
        id: string;
        name: string;
        mimeType: string;
    };
    previewUrl: string | null;
    isLoading: boolean;
    isError: boolean;
}

const isMarkdown = (mimeType: string, name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return mimeType.includes("markdown") || ext === "md";
};

const MarkdownPreview: React.FC<{ documentId: string }> = ({ documentId }) => {
    const { workspaceId, agentId } = useParams();
    const {
        data: content,
        isLoading,
        isError,
    } = useGetDocumentContentQuery({
        workspaceId: workspaceId!,
        agentId: agentId!,
        id: documentId,
    });
    const textColor = useColorModeValue("grey.800", "grey.100");
    const codeColor = useColorModeValue("grey.700", "grey.300");
    const codeBg = useColorModeValue("grey.100", "grey.800");

    if (isLoading)
        return (
            <Text fontSize="sm" color="textMuted">
                Chargement...
            </Text>
        );
    if (isError || !content)
        return (
            <Text fontSize="sm" color="textMuted">
                Impossible de charger le contenu.
            </Text>
        );

    return (
        <Box
            fontSize="13px"
            lineHeight="1.7"
            color={textColor}
            sx={{
                "h1,h2,h3,h4": { fontWeight: 700, marginTop: "0.8em", marginBottom: "0.3em" },
                h1: { fontSize: "18px" },
                h2: { fontSize: "15px" },
                h3: { fontSize: "13px" },
                p: { marginBottom: "0.5em" },
                "ul,ol": { paddingLeft: "1.2em", marginBottom: "0.5em" },
                code: { bg: codeBg, color: codeColor, px: "3px", borderRadius: "3px", fontSize: "12px" },
                pre: { bg: codeBg, p: 2, borderRadius: "6px", overflowX: "auto", marginBottom: "0.5em" },
                blockquote: { borderLeft: "3px solid", borderColor: "green.300", pl: 3, color: "textMuted" },
                a: { color: "green.500", textDecoration: "underline" },
            }}
        >
            <ReactMarkdown>{content}</ReactMarkdown>
        </Box>
    );
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, previewUrl, isLoading, isError }) => {
    const isMarkdownFile = isMarkdown(document.mimeType, document.name);

    return (
        <VStack align="stretch" spacing={2}>
            <Text
                fontWeight="medium"
                fontSize="11px"
                color="textPrimary"
                letterSpacing="0.08em"
                textTransform="uppercase"
            >
                Aperçu du document
            </Text>

            <Box
                h={{ base: "250px", md: "400px" }}
                bg="surfacePrimary"
                borderRadius="12px"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="borderDefault"
                overflow="auto"
                p={3}
            >
                {isLoading && (
                    <VStack h="100%" justify="center" align="center" spacing={3}>
                        <Text fontSize="sm" color="textMuted">
                            Chargement de l&apos;aperçu...
                        </Text>
                    </VStack>
                )}

                {!isLoading && isMarkdownFile && <MarkdownPreview documentId={document.id} />}

                {!isLoading && previewUrl && !isMarkdownFile && (
                    <Box
                        as="iframe"
                        src={previewUrl}
                        title={document.name}
                        w="100%"
                        h="100%"
                        border="0"
                        borderRadius="8px"
                    />
                )}

                {!isLoading && (!previewUrl || isError) && (
                    <VStack h="100%" justify="center" align="center" spacing={3}>
                        <Box as={File} fontSize="48px" color="gray.400" />
                        <Text fontSize="sm" color="textMuted">
                            Aperçu non disponible
                        </Text>
                        <Text fontSize="xs" color="textMuted">
                            Téléchargez le fichier pour consulter son contenu
                        </Text>
                    </VStack>
                )}
            </Box>
        </VStack>
    );
};
