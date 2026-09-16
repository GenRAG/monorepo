import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import type { ReactNode } from "react";

interface DocSectionProps {
    number: number;
    title: string;
    id?: string;
    children: ReactNode;
}

export const DocSection = ({ number, title, id, children }: DocSectionProps) => {
    return (
        <VStack align="start" spacing={4} id={id} scrollMarginTop="24px">
            <HStack spacing={3}>
                <BoxIcon letters={number.toString().padStart(2, "0")} size="sm" />
                <Text fontSize="xl" fontWeight={700} color="textStrong">
                    {title}
                </Text>
            </HStack>
            <Box w="full" pl={1}>
                {children}
            </Box>
        </VStack>
    );
};
