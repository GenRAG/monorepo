import React from "react";
import { DrawerHeader, VStack, HStack, Text, Box } from "@chakra-ui/react";
import { DocumentStatusBadge } from "components/ui/DocumentStatusBadge";
import { DocumentEntity } from "types/document/document";
import BoxIcon from "components/ui/BoxIcon";
import { getFileTypeBadgeConfig } from "utils/documentFormatters";

interface PreviewDrawerHeaderProps {
    document: DocumentEntity;
}

export const PreviewDrawerHeader: React.FC<PreviewDrawerHeaderProps> = ({ document }) => {

    const badge = getFileTypeBadgeConfig(document.mimeType);

    return (
        <DrawerHeader bg="surfacePrimary" borderBottomWidth="1px">
            <VStack align="start" spacing={2}>
                <HStack spacing={3}>
                    <BoxIcon letters={badge.label} />
                    <Text fontSize="lg" fontWeight="semibold" noOfLines={1}>
                        {document.name}
                    </Text>
                </HStack>
            </VStack>
        </DrawerHeader>
    );
};
