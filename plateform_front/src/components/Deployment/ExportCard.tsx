import type { ReactNode } from "react";
import { Box, HStack, VStack, Text, useColorModeValue } from "@chakra-ui/react";
import Button from "components/System/Atoms/Button";

interface ExportCardProps {
    icon: ReactNode;
    title: string;
    subtitle: string;
}

export const ExportCard = ({ icon, title, subtitle }: ExportCardProps) => {
    const bg = useColorModeValue("white", "grey.900");
    const titleColor = useColorModeValue("grey.900", "grey.50");
    const subtitleColor = useColorModeValue("grey.300", "grey.600");

    return (
        <Box flex={1} p={4} borderRadius="8px" bg={bg}>
            <HStack>
                <Button size="sm" variant="outline">
                    {icon}
                </Button>
                <VStack align="start" spacing={0.5}>
                    <Text fontSize="sm" fontWeight={500} color={titleColor}>
                        {title}
                    </Text>
                    <Text fontSize="xs" color={subtitleColor}>
                        {subtitle}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    );
};
