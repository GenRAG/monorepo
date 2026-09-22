import React from "react";
import { Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useAppResponsive } from "hooks/useAppResponsive";

interface ChatWorkspaceHeaderProps {
    title: string;
    description: string;
    actions?: React.ReactNode;
}

const WorkspaceHeader = ({ title, description, actions }: ChatWorkspaceHeaderProps) => {
    const isMobile = useAppResponsive({ base: true, lg: false });

    return (
        <HStack
            w="100%"
            p={2}
            borderBottom="1px solid"
            bg="surfaceCard"
            borderColor="borderSubtle"
            flexShrink={0}
            justify="space-between"
        >
            <VStack spacing={0} align="flex-start" ml={3}>
                <Heading variant="heading-lg">{title}</Heading>
                {!isMobile && (
                    <Text fontSize="sm" color="textLabel">
                        {description}
                    </Text>
                )}
            </VStack>
            {actions && <HStack spacing={2}>{actions}</HStack>}
        </HStack>
    );
};

export default WorkspaceHeader;
