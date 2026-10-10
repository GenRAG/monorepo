import React from "react";
import { Box, HStack, Td, Text, Tr } from "@chakra-ui/react";

interface DocumentSourceSectionProps {
    label: string;
    count: number;
    color: string;
    colSpan: number;
}

/** Section header row, same as the status sections of the agents table. */
export const DocumentSourceSection: React.FC<DocumentSourceSectionProps> = ({ label, count, color, colSpan }) => (
    <Tr>
        <Td colSpan={colSpan} py={2} bg="surfaceModal">
            <HStack spacing={2}>
                <Box w="8px" h="8px" borderRadius="full" bg={color} />
                <Text fontSize="xs" fontWeight="700" color="textMuted" letterSpacing="0.02em">
                    {label.toUpperCase()} ({count})
                </Text>
            </HStack>
        </Td>
    </Tr>
);
