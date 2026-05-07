import React from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";

interface AgentPreviewHeaderProps {
    title: string;
    description: string;
}

export const AgentPreviewHeader: React.FC<AgentPreviewHeaderProps> = ({
    title,
    description,
}) => {
    const labelColor = useColorModeValue("grey.500", "grey.400");
    const borderColor = useColorModeValue("grey.100", "grey.800");

    return (
        <Box
            p={5}
            position="relative"
            zIndex={1}
            borderBottom="solid 1px"
            borderBottomColor={borderColor}
        >
            <Text
                fontSize="11px"
                fontWeight="700"
                color="green.500"
                letterSpacing="0.12em"
                textTransform="uppercase"
                mb={2}
            >
                {title}
            </Text>
            <Text
                fontSize="14px"
                color={labelColor}
                lineHeight="1.6"
                maxW="340px"
            >
                {description}
            </Text>
        </Box>
    );
};

export default AgentPreviewHeader;
