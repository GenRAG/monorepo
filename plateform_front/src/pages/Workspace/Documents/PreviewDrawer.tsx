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
    Badge,
    Box,
    Divider,
    Button,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { Download, ExternalLink, File, Clock, Database } from "lucide-react";
import { Document } from "pages/Workspace/Documents/document-type";
import Banner from "components/Atoms/Banner";

interface PreviewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document | null;
}

export const PreviewDrawer: React.FC<PreviewDrawerProps> = ({
    isOpen,
    onClose,
    document,
}) => {
    const { colorMode } = useColorMode();

    if (!document) return null;

    const handleDownload = () => {
        console.log("Download document:", document.s3Key);
    };

    const handleOpenInNewTab = () => {
        console.log("Open in new tab:", document.s3Key);
    };

    return (
        <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            size={{ base: "full", md: "lg" }}
        >
            <DrawerOverlay />
            <DrawerContent bg={colorMode === "dark" ? "grey.800" : "white"}>
                <DrawerCloseButton
                    color={colorMode === "dark" ? "grey.400" : "grey.900"}
                />
                <DrawerHeader
                    bg={colorMode === "dark" ? "grey.800" : "white"}
                    borderBottomWidth="1px"
                >
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
                        <StatusBadge status={document.status} />
                    </VStack>
                </DrawerHeader>

                <DrawerBody
                    pb="14px"
                    bg={colorMode === "dark" ? "grey.800" : "white"}
                >
                    <VStack align="stretch" spacing={6} py={4}>
                        <VStack align="stretch" spacing={4}>
                            <Text
                                fontWeight="semibold"
                                fontSize="sm"
                                color={
                                    colorMode === "dark"
                                        ? "grey.100"
                                        : "grey.900"
                                }
                            >
                                Document Information
                            </Text>

                            <InfoRow
                                icon={File}
                                label="File type"
                                value={getFileTypeLabel(document.type)}
                            />

                            <InfoRow
                                icon={Database}
                                label="Size"
                                value={formatFileSize(document.size)}
                            />

                            <InfoRow
                                icon={Clock}
                                label="Uploaded"
                                value={formatDateTime(document.uploadedAt)}
                            />

                            {document.indexedAt && (
                                <InfoRow
                                    icon={Clock}
                                    label="Indexed"
                                    value={formatDateTime(document.indexedAt)}
                                />
                            )}
                        </VStack>

                        <Divider />

                        <HStack
                            spacing={3}
                            flexDir={{ base: "column", sm: "row" }}
                        >
                            <Button
                                leftIcon={<Download size={18} />}
                                size={{ base: "sm", md: "md" }}
                                borderRadius="12px"
                                border="1px solid"
                                borderColor={
                                    colorMode === "dark"
                                        ? "green.700"
                                        : "green.200"
                                }
                                variant="outline"
                                onClick={handleDownload}
                                flex={1}
                                w={{ base: "100%", sm: "auto" }}
                            >
                                Download
                            </Button>
                            <Button
                                leftIcon={<ExternalLink size={18} />}
                                size={{ base: "sm", md: "md" }}
                                borderRadius="12px"
                                border="1px solid"
                                borderColor={
                                    colorMode === "dark"
                                        ? "green.700"
                                        : "green.200"
                                }
                                variant="outline"
                                onClick={handleOpenInNewTab}
                                flex={1}
                                w={{ base: "100%", sm: "auto" }}
                            >
                                Open
                            </Button>
                        </HStack>
                        <VStack align="stretch" spacing={4}>
                            <Text
                                fontWeight="semibold"
                                fontSize="sm"
                                color={
                                    colorMode === "dark"
                                        ? "grey.100"
                                        : "grey.900"
                                }
                            >
                                Knowledge Base Status
                            </Text>

                            {document.status === "indexed" && (
                                <Banner
                                    variant="green"
                                    mb="16px"
                                    flexShrink={0}
                                    gap="0"
                                >
                                    <Text fontSize="sm" color="green.800">
                                        This document has been successfully
                                        indexed and is available for your
                                        assistant to reference.
                                    </Text>
                                </Banner>
                            )}

                            {document.status === "processing" && (
                                <Banner
                                    variant="orange"
                                    mb="16px"
                                    flexShrink={0}
                                    gap="0"
                                >
                                    <Text fontSize="sm" color="yellow.800">
                                        This document is being processed and
                                        will be available shortly.
                                    </Text>
                                </Banner>
                            )}

                            {document.status === "failed" && (
                                <Banner
                                    variant="red"
                                    mb="16px"
                                    flexShrink={0}
                                    gap="0"
                                >
                                    <VStack align="start" spacing={2}>
                                        <Text
                                            fontSize="sm"
                                            color="red.800"
                                            fontWeight="medium"
                                        >
                                            Indexing failed
                                        </Text>
                                        {document.error && (
                                            <Text fontSize="sm" color="red.700">
                                                {document.error}
                                            </Text>
                                        )}
                                    </VStack>
                                </Banner>
                            )}

                            {document.status === "uploaded" && (
                                <Box
                                    p={4}
                                    bg="gray.50"
                                    borderRadius="12px"
                                    borderLeft="4px solid"
                                    borderColor="gray.400"
                                >
                                    <Text fontSize="sm" color="gray.700">
                                        This document is queued for processing.
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                        <VStack align="stretch" spacing={4}>
                            <Text
                                fontWeight="semibold"
                                fontSize="sm"
                                color={
                                    colorMode === "dark"
                                        ? "grey.100"
                                        : "grey.900"
                                }
                            >
                                Preview
                            </Text>

                            <Box
                                h={{ base: "250px", md: "400px" }}
                                bg={
                                    colorMode === "dark"
                                        ? "grey.800"
                                        : "grey.50"
                                }
                                borderRadius="12px"
                                border="1px solid"
                                borderColor="gray.200"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <VStack spacing={3}>
                                    <Box
                                        as={File}
                                        fontSize="48px"
                                        color="gray.400"
                                    />
                                    <Text
                                        fontSize="sm"
                                        color={
                                            colorMode === "dark"
                                                ? "grey.400"
                                                : "grey.500"
                                        }
                                    >
                                        Preview not available
                                    </Text>
                                    <Text
                                        fontSize="xs"
                                        color={
                                            colorMode === "dark"
                                                ? "grey.400"
                                                : "grey.500"
                                        }
                                    >
                                        Download the file to view its contents
                                    </Text>
                                </VStack>
                            </Box>
                        </VStack>
                        <Banner variant="green" flexShrink={0} gap="0">
                            <HStack>
                                <Text color="grey.800" fontSize="sm">
                                    Your assistant can reference this document
                                    to provide accurate, context-aware answers
                                    based on its content.
                                </Text>
                            </HStack>
                        </Banner>
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

interface InfoRowProps {
    icon: any;
    label: string;
    value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => {
    const textColor = useColorModeValue("grey.900", "grey.100");

    return (
        <HStack spacing={3} align="start">
            <Box as={icon} color="gray.400" fontSize="16px" mt={0.5} />
            <VStack align="start" spacing={0} flex={1}>
                <Text
                    fontSize="xs"
                    color={textColor}
                    textTransform="uppercase"
                    letterSpacing="wide"
                >
                    {label}
                </Text>
                <Text fontSize="sm" color={textColor} fontWeight="medium">
                    {value}
                </Text>
            </VStack>
        </HStack>
    );
};

interface StatusBadgeProps {
    status: Document["status"];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const statusConfig = {
        uploaded: { label: "Uploaded", colorScheme: "gray" },
        processing: { label: "Processing", colorScheme: "orange" },
        indexed: { label: "Ready", colorScheme: "green" },
        failed: { label: "Failed", colorScheme: "red" },
    };

    const config = statusConfig[status];

    return (
        <Badge colorScheme={config.colorScheme} fontSize="xs" px={2} py={1}>
            {config.label}
        </Badge>
    );
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

function formatDateTime(date: Date): string {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getFileTypeLabel(mimeType: string): string {
    const typeMap: Record<string, string> = {
        "application/pdf": "PDF Document",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            "Word Document",
        "application/msword": "Word Document",
        "text/plain": "Text File",
        "text/markdown": "Markdown",
    };

    return typeMap[mimeType] || "Document";
}
