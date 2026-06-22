import React from "react";
import {
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import Banner from "components/ui/Banner";
import { DocumentEntity } from "types/document/document";
import { useGetDocumentUrlQuery } from "services/document/document";
import { useParams } from "react-router-dom";
import { getPreviewUrl } from "utils/documentFormatters";
import { PreviewDrawerHeader } from "./PreviewDrawerHeader";
import { DocumentInfoGrid } from "./DocumentInfoGrid";
import { KnowledgeBaseStatus } from "./KnowledgeBaseStatus";
import { DocumentPreview } from "./DocumentPreview";
import { Text, HStack } from "@chakra-ui/react";

interface PreviewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    document: DocumentEntity | null;
}

export const PreviewDrawer: React.FC<PreviewDrawerProps> = ({ isOpen, onClose, document }) => {
    const { workspaceId, agentId } = useParams();
    const btnColor = useColorModeValue("green.100", "green.700");
    const shouldFetchUrl = Boolean(document && workspaceId && agentId && isOpen);

    const {
        data: documentUrl,
        isLoading: isDocumentUrlLoading,
        isError: isDocumentUrlError,
    } = useGetDocumentUrlQuery(
        {
            workspaceId: workspaceId!,
            agentId: agentId!,
            id: document?.id ?? "",
        },
        { skip: !shouldFetchUrl },
    );

    if (!document) return null;

    const previewUrl = documentUrl?.url ? getPreviewUrl(document.mimeType, documentUrl.url) : null;

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={{ base: "full", md: "lg" }}>
            <DrawerOverlay />
            <DrawerContent bg="surfacePrimary">
                <DrawerCloseButton bg={btnColor} />
                <PreviewDrawerHeader document={document} />

                <DrawerBody pb="14px" bg="surfacePrimary">
                    <VStack align="stretch" spacing={6} py={4}>
                        <Banner variant="green" flexShrink={0} gap="0">
                            <HStack>
                                <Text fontSize="sm">
                                    Votre assistant peut s&apos;appuyer sur ce document pour fournir des réponses
                                    précises et contextualisées selon son contenu.
                                </Text>
                            </HStack>
                        </Banner>
                        <DocumentInfoGrid document={document} />
                        <KnowledgeBaseStatus document={document} />
                        <DocumentPreview
                            document={{ id: document.id, name: document.name, mimeType: document.mimeType }}
                            previewUrl={previewUrl}
                            isLoading={isDocumentUrlLoading}
                            isError={isDocumentUrlError}
                        />
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};
