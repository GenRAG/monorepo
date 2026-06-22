import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

interface AgentPreviewHeaderProps {
    title: string;
    description: string;
}

export const AgentPreviewHeader: React.FC<AgentPreviewHeaderProps> = ({ title, description }) => {
    return (
        <Box p={5} position="relative" zIndex={1} borderBottom="solid 1px" borderBottomColor="borderDefault">
            <Heading variant="heading-lg" mb={2}>
                {title}
            </Heading>
            <Text variant="body-sm" color="textLabel" lineHeight="1.6" maxW="340px">
                {description}
            </Text>
        </Box>
    );
};

export default AgentPreviewHeader;
