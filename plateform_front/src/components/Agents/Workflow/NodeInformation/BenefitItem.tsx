import { Box, Text } from "@chakra-ui/react";

interface BenefitItemProps {
    title: string;
    description: string;
}

export const BenefitItem = ({ title, description }: BenefitItemProps) => (
    <Box>
        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
            {title}
        </Text>
        <Text fontSize="xs" color="textDescription">
            {description}
        </Text>
    </Box>
);
