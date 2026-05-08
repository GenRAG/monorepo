import React from "react";
import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    VStack,
    HStack,
    Text,
    Box,
    useColorModeValue,
    Grid,
    GridItem,
} from "@chakra-ui/react";
import { File, Clock, Database } from "lucide-react";
import Banner from "components/System/Atoms/Banner";
import { DocumentStatusBadge } from "components/System/Atoms/DocumentStatusBadge";
import { DocumentEntity, DocumentStatus } from "types/document/document";
import { useGetDocumentUrlQuery } from "services/document/document";
import { useParams } from "react-router-dom";
import {
    formatFileSize,
    formatDateTime,
    getFileTypeLabel,
    getPreviewUrl,
} from "utils/documentFormatters";

interface PreviewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    document: DocumentEntity | null;
}

export const PreviewDrawer: React.FC<PreviewDrawerProps> = ({
    isOpen,
    onClose,
    document,
}) => {
    const { workspaceId, agentId } = useParams();

    const closeButtonColor = useColorModeValue("grey.900", "grey.400");
    const bgInformations = useColorModeValue("white", "grey.900");
    const shouldFetchUrl = Boolean(
        document && workspaceId && agentId && isOpen,
    );

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

    const previewUrl = documentUrl?.url
        ? getPreviewUrl(document.mimeType, documentUrl.url)
        : null;

    return (
        <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            size={{ base: "full", md: "lg" }}
        >
            <DrawerOverlay />
            <DrawerContent bg="surfacePrimary">
                <DrawerCloseButton color={closeButtonColor} />
                <DrawerHeader bg="surfacePrimary" borderBottomWidth="1px">
                    <VStack align="start" spacing={2}>
                        <HStack spacing={3}>
                            <Box as={File} color="gray.500" fontSize="20px" />
                            <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                noOfLines={1}
                            >
                                {document.name}
                            </Text>
                        </HStack>
                        <DocumentStatusBadge
                            status={document.status}
                            retryCount={document.retryCount}
                        />
                    </VStack>
                </DrawerHeader>

                <DrawerBody pb="14px" bg="surfacePrimary">
                    <VStack align="stretch" spacing={6} py={4}>
                        <VStack align="stretch" spacing={3}>
                            <Text
                                fontWeight="medium"
                                fontSize="11px"
                                color="textMuted"
                                letterSpacing="0.08em"
                                textTransform="uppercase"
                            >
                                Informations du document
                            </Text>

                            <Box
                                bg={bgInformations}
                                border="0.5px solid"
                                borderColor="borderDefault"
                                borderRadius="12px"
                                overflow="hidden"
                            >
                                <Grid
                                    templateColumns="1fr 1fr"
                                    borderBottom="0.5px solid"
                                    borderColor="borderDefault"
                                >
                                    <GridItem
                                        p={4}
                                        borderRight="0.5px solid"
                                        borderColor="borderDefault"
                                    >
                                        <Text
                                            fontSize="11px"
                                            color="textMuted"
                                            fontWeight="medium"
                                            textTransform="uppercase"
                                            letterSpacing="0.04em"
                                            mb={1}
                                        >
                                            Type
                                        </Text>
                                        <HStack spacing={2}>
                                            <Box
                                                as={File}
                                                size={14}
                                                color="gray.400"
                                            />
                                            <Text
                                                fontSize="13px"
                                                fontWeight="medium"
                                            >
                                                {getFileTypeLabel(
                                                    document.mimeType,
                                                )}
                                            </Text>
                                        </HStack>
                                    </GridItem>
                                    <GridItem p={4}>
                                        <Text
                                            fontSize="11px"
                                            color="textMuted"
                                            fontWeight="medium"
                                            textTransform="uppercase"
                                            letterSpacing="0.04em"
                                            mb={1}
                                        >
                                            Taille
                                        </Text>
                                        <HStack spacing={2}>
                                            <Box
                                                as={Database}
                                                size={14}
                                                color="gray.400"
                                            />
                                            <Text
                                                fontSize="13px"
                                                fontWeight="medium"
                                            >
                                                {formatFileSize(document.size)}
                                            </Text>
                                        </HStack>
                                    </GridItem>
                                </Grid>
                                <Grid
                                    templateColumns="1fr 1fr"
                                    borderBottom="0.5px solid"
                                    borderColor="borderDefault"
                                >
                                    <GridItem
                                        p={4}
                                        borderRight="0.5px solid"
                                        borderColor="borderDefault"
                                    >
                                        <Text
                                            fontSize="11px"
                                            color="textMuted"
                                            fontWeight="medium"
                                            textTransform="uppercase"
                                            letterSpacing="0.04em"
                                            mb={1}
                                        >
                                            Téléversé
                                        </Text>
                                        <HStack spacing={2}>
                                            <Box
                                                as={Clock}
                                                size={14}
                                                color="gray.400"
                                            />
                                            <Text
                                                fontSize="13px"
                                                fontWeight="medium"
                                            >
                                                {formatDateTime(
                                                    document.createdAt,
                                                )}
                                            </Text>
                                        </HStack>
                                    </GridItem>
                                    {document.indexedAt && (
                                        <GridItem p={4}>
                                            <Text
                                                fontSize="11px"
                                                color="textMuted"
                                                fontWeight="medium"
                                                textTransform="uppercase"
                                                letterSpacing="0.04em"
                                                mb={1}
                                            >
                                                Indexé
                                            </Text>
                                            <HStack spacing={2}>
                                                <Box
                                                    as={Clock}
                                                    size={14}
                                                    color="gray.400"
                                                />
                                                <Text
                                                    fontSize="13px"
                                                    fontWeight="medium"
                                                >
                                                    {formatDateTime(
                                                        document.indexedAt,
                                                    )}
                                                </Text>
                                            </HStack>
                                        </GridItem>
                                    )}
                                </Grid>
                                <Box p={4}>
                                    <Text
                                        fontSize="11px"
                                        color="textMuted"
                                        fontWeight="medium"
                                        textTransform="uppercase"
                                        letterSpacing="0.04em"
                                        mb={2}
                                    >
                                        Statut
                                    </Text>
                                    <DocumentStatusBadge
                                        status={document.status}
                                        retryCount={document.retryCount}
                                    />
                                </Box>
                            </Box>
                        </VStack>

                        <VStack align="stretch" spacing={4}>
                            <Text
                                fontWeight="semibold"
                                fontSize="sm"
                                color="textPrimary"
                            >
                                Statut de la base de connaissances
                            </Text>

                            {document.status === DocumentStatus.INDEXED && (
                                <Banner
                                    variant="green"
                                    title="Document indexé"
                                    mb="16px"
                                    flexShrink={0}
                                >
                                    Ce document a été indexé avec succès et est
                                    disponible pour être utilisé par votre
                                    assistant.
                                </Banner>
                            )}

                            {document.status === DocumentStatus.PROCESSING && (
                                <Banner
                                    variant="orange"
                                    title="Document en traitement"
                                    mb="16px"
                                    flexShrink={0}
                                >
                                    <Text fontSize="sm">
                                        Ce document est en cours de traitement
                                        et sera bientôt disponible.
                                    </Text>
                                </Banner>
                            )}

                            {document.status === DocumentStatus.FAILED && (
                                <Banner
                                    variant="red"
                                    title="Échec de l'indexation"
                                    mb="16px"
                                    flexShrink={0}
                                >
                                    {document.indexError && (
                                        <Text fontSize="xs" fontFamily="mono">
                                            {document.indexError}
                                        </Text>
                                    )}
                                </Banner>
                            )}

                            {document.status === DocumentStatus.UPLOADED && (
                                <Box
                                    p={4}
                                    bg="gray.50"
                                    borderRadius="12px"
                                    borderLeft="4px solid"
                                    borderColor="gray.400"
                                >
                                    <Text fontSize="sm" color="gray.700">
                                        Ce document est en file d&apos;attente
                                        pour le traitement.
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                        <VStack align="stretch" spacing={4}>
                            <Text
                                fontWeight="semibold"
                                fontSize="sm"
                                color="textPrimary"
                            >
                                Aperçu
                            </Text>

                            <Box
                                h={{ base: "250px", md: "400px" }}
                                bg={bgInformations}
                                borderRadius="12px"
                                border="1px solid"
                                borderColor="borderDefault"
                                overflow="hidden"
                                p={3}
                            >
                                {isDocumentUrlLoading && (
                                    <VStack
                                        h="100%"
                                        justify="center"
                                        align="center"
                                        spacing={3}
                                    >
                                        <Text fontSize="sm" color="textMuted">
                                            Chargement de l&apos;aperçu...
                                        </Text>
                                    </VStack>
                                )}

                                {!isDocumentUrlLoading && previewUrl && (
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

                                {!isDocumentUrlLoading &&
                                    (!previewUrl || isDocumentUrlError) && (
                                        <VStack
                                            h="100%"
                                            justify="center"
                                            align="center"
                                            spacing={3}
                                        >
                                            <Box
                                                as={File}
                                                fontSize="48px"
                                                color="gray.400"
                                            />
                                            <Text
                                                fontSize="sm"
                                                color="textMuted"
                                            >
                                                Aperçu non disponible
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color="textMuted"
                                            >
                                                Téléchargez le fichier pour
                                                consulter son contenu
                                            </Text>
                                        </VStack>
                                    )}
                            </Box>
                        </VStack>
                        <Banner variant="green" flexShrink={0} gap="0">
                            <HStack>
                                <Text fontSize="sm">
                                    Votre assistant peut s&apos;appuyer sur ce
                                    document pour fournir des réponses précises
                                    et contextualisées selon son contenu.
                                </Text>
                            </HStack>
                        </Banner>
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};
