import React from "react";
import { DrawerCloseButton, DrawerHeader, HStack, Text, VStack } from "@chakra-ui/react";

interface QueryDetailsDrawerHeaderProps {
    agentTitle: string;
    agentVersion?: string;
}

export const QueryDetailsDrawerHeader: React.FC<QueryDetailsDrawerHeaderProps> = ({ agentTitle, agentVersion }) => {
    const subtitle = agentVersion ? `Agent ${agentVersion}` : "";

    return (
        <DrawerHeader bg="surfacePrimary" borderBottomWidth="1px" pb={3}>
        <DrawerCloseButton />
            <HStack spacing={3} pr={8}>
                <VStack align="start" spacing={0} minW={0}>
                    <Text fontSize="md" fontWeight="semibold" color="textStrong" noOfLines={1}>
                        {agentTitle}
                    </Text>
                    {subtitle && (
                        <Text variant="body-xs-muted" noOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </VStack>
            </HStack>
        </DrawerHeader>
    );
};
