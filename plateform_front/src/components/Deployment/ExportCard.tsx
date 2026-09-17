import type { ReactNode } from "react";
import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import Button from "components/ui/Button";

interface ExportCardProps {
    icon: ReactNode;
    title: string;
    subtitle: string;
    onClick?: () => void;
    isLoading?: boolean;
}

export const ExportCard = ({ icon, title, subtitle, onClick, isLoading }: ExportCardProps) => {
    return (
        <Box flex={1} p={4} borderRadius="8px" bg="surfacePrimary">
            <HStack>
                <Button size="sm" variant="outline" onClick={onClick} isLoading={isLoading}>
                    {icon}
                </Button>
                <VStack align="start" spacing={0.5}>
                    <Text fontSize="sm" fontWeight={500} color="textStrong">
                        {title}
                    </Text>
                    <Text fontSize="xs" color="textSubtle">
                        {subtitle}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    );
};
