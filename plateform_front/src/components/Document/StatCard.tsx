import React from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";

interface StatCardProps {
    label: string;
    value: number | string;
    accent?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, accent }) => {
    const border = useColorModeValue("green.500", "green.400");
    const labelColor = useColorModeValue("grey.500", "grey.200");
    const valueColor = useColorModeValue("grey.900", "white");
    const bgCard = useColorModeValue(
        "rgba(152, 255, 216, 0.38)",
        "rgba(17, 43, 33, 0.41)",
    );

    return (
        <Box
            border="1px solid"
            bg={bgCard}
            borderColor={border}
            borderRadius="8px"
            px={5}
            py={4}
        >
            <Text
                fontSize="xs"
                color={labelColor}
                mb={1}
                textTransform="uppercase"
                letterSpacing="0.06em"
            >
                {label}
            </Text>
            <Text
                fontSize="lg"
                fontWeight="semibold"
                color={accent ? "green.400" : valueColor}
                lineHeight="1.2"
            >
                {value}
            </Text>
        </Box>
    );
};
