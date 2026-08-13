import React from "react";
import { Box, Card, HStack, Text, VStack } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import { getAgentAvatar } from "utils/agentAvatar";

interface EntityCardProps {
    title: string;
    description?: string;
    footer: React.ReactNode;
    onClick: () => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({ title, description, footer, onClick }) => {
    const avatarStyle = getAgentAvatar(title);

    return (
        <Card
            size="none"
            variant="clickable"
            bg="surfaceModal"
            borderColor="borderSubtle"
            overflow="hidden"
            role="group"
            onClick={onClick}
        >
            <VStack align="start" spacing={0} h="100%">
                <VStack align="start" spacing={3} p={4} flex={1} w="100%">
                    <HStack spacing={3}>
                        <BoxIcon
                            letters={title.charAt(0).toUpperCase()}
                            color={avatarStyle.color}
                            bg={avatarStyle.bg}
                        />
                        <Text fontSize="sm" fontWeight="600" color="textPrimary">
                            {title}
                        </Text>
                    </HStack>
                    {description !== undefined && (
                        <Text fontSize="sm" color="textLabel" lineHeight="1.5" noOfLines={3}>
                            {description || "Aucune description renseignée."}
                        </Text>
                    )}
                </VStack>

                <Box
                    w="100%"
                    px={4}
                    py={3}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    borderTopWidth="1px"
                    borderTopStyle="solid"
                    borderTopColor="borderSubtle"
                >
                    {footer}
                </Box>
            </VStack>
        </Card>
    );
};
