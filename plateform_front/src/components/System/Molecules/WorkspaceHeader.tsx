import React from "react";
import {
    Heading,
    HStack,
    Text,
    useColorMode,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { useAppResponsive } from "hooks/useAppResponsive";

interface ChatWorkspaceHeaderProps {
    title: string;
    description: string;
    actions?: React.ReactNode;
}

const WorkspaceHeader = ({
    title,
    description,
    actions,
}: ChatWorkspaceHeaderProps) => {
    const descriptionColor = useColorModeValue("grey.500", "grey.400");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const bg = useColorModeValue("white", "grey.975");
    const isMobile = useAppResponsive({ base: true, lg: false });

    return (
        <HStack
            w="100%"
            p={4}
            borderBottom="1px solid"
            bg={bg}
            borderColor={borderColor}
            flexShrink={0}
            justify="space-between"
        >
            <VStack align="flex-start">
                <Heading variant="heading-2xl">{title}</Heading>
                {!isMobile && (
                    <Text fontSize="sm" color={descriptionColor}>
                        {description}
                    </Text>
                )}
            </VStack>
            {actions && <HStack spacing={2}>{actions}</HStack>}
        </HStack>
    );
};

export default WorkspaceHeader;
