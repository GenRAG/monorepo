import { Heading, HStack, Text, useColorMode, VStack } from "@chakra-ui/react";
import { useAppResponsive } from "hooks/useAppResponsive";

interface ChatWorkspaceHeaderProps {
    title: string;
    description: string;
}

const WorkspaceHeader = ({ title, description }: ChatWorkspaceHeaderProps) => {
    const { colorMode } = useColorMode();
    const descriptionColor = colorMode === "dark" ? "grey.400" : "grey.600";
    const isMobile = useAppResponsive({ base: true, lg: false });

    return (
        <HStack
            w="100%"
            p={4}
            borderBottom="1px solid"
            borderColor="grey.200"
            flexShrink={0}
        >
            <VStack align="flex-start">
                <Heading variant="heading-2xl">{title}</Heading>
                {!isMobile && (
                    <Text fontSize="sm" color={descriptionColor}>
                        {description}
                    </Text>
                )}
            </VStack>
        </HStack>
    );
};

export default WorkspaceHeader;
