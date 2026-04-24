import React from "react";
import {
    Badge,
    HStack,
    Spinner,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { DocumentEntity } from "types/document/document";

interface DocumentStatusBadgeProps {
    status: DocumentEntity["status"];
    retryCount?: number;
}

const STATUS_CONFIG = {
    uploaded: { label: "Téléversé", colorScheme: "gray", spinner: false },
    processing: {
        label: "En traitement",
        colorScheme: "orange",
        spinner: true,
    },
    indexed: { label: "Prêt", colorScheme: "green", spinner: false },
    failed: { label: "Échec", colorScheme: "red", spinner: false },
} as const;

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
    status,
    retryCount,
}) => {
    const textColor = useColorModeValue("grey.800", "grey.100");
    const normalized = String(
        status,
    ).toLowerCase() as keyof typeof STATUS_CONFIG;
    const config = STATUS_CONFIG[normalized] ?? STATUS_CONFIG.uploaded;

    const label =
        config.spinner && retryCount && retryCount > 0
            ? `${config.label} (${retryCount}/5)`
            : config.label;

    return (
        <Badge colorScheme={config.colorScheme} fontSize="xs" px={2} py={1}>
            <HStack spacing={1}>
                {config.spinner && <Spinner size="xs" />}
                <Text fontSize="xs" color={textColor}>
                    {label}
                </Text>
            </HStack>
        </Badge>
    );
};
