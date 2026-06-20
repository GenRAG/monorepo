import { Box, HStack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import type { ReactNode } from "react";

interface DocSectionProps {
    number: number;
    title: string;
    id?: string;
    children: ReactNode;
}

export const DocSection = ({ number, title, id, children }: DocSectionProps) => {
    const titleColor = useColorModeValue("grey.900", "grey.50");

    return (
        <VStack align="start" spacing={4} id={id} scrollMarginTop="24px">
            <HStack spacing={3}>
                <BoxIcon letters={number.toString().padStart(2, "0")} size="sm" />
                <Text fontSize="xl" fontWeight={700} color={titleColor}>
                    {title}
                </Text>
            </HStack>
            <Box w="full" pl={1}>
                {children}
            </Box>
        </VStack>
    );
};
