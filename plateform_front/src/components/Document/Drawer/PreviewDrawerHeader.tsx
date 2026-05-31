import React from "react";
import { DrawerHeader, VStack, HStack, Text, Box } from "@chakra-ui/react";
import { File } from "lucide-react";
import { DocumentStatusBadge } from "components/System/Atoms/DocumentStatusBadge";
import { DocumentEntity } from "types/document/document";

interface PreviewDrawerHeaderProps {
    document: DocumentEntity;
}

export const PreviewDrawerHeader: React.FC<PreviewDrawerHeaderProps> = ({ document }) => {
    return (
        <DrawerHeader bg="surfacePrimary" borderBottomWidth="1px">
            <VStack align="start" spacing={2}>
                <HStack spacing={3}>
                    <Box as={File} color="gray.500" fontSize="20px" />
                    <Text fontSize="lg" fontWeight="semibold" noOfLines={1}>
                        {document.name}
                    </Text>
                </HStack>
                <DocumentStatusBadge status={document.status} retryCount={document.retryCount} />
            </VStack>
        </DrawerHeader>
    );
};
