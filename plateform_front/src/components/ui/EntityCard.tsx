import React from "react";
import { Box, HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import { getAgentAvatar } from "utils/agentAvatar";

interface EntityCardProps {
    title: string;
    description?: string;
    footer: React.ReactNode;
    onClick: () => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({ title, description, footer, onClick }) => {
    const cardBg = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.100", "grey.700");
    const hoverBorderColor = useColorModeValue("grey.150", "grey.600");
    const titleColor = useColorModeValue("grey.900", "grey.50");
    const descColor = useColorModeValue("grey.500", "grey.400");
    const dividerColor = useColorModeValue("grey.100", "grey.700");
    const avatarStyle = getAgentAvatar(title);

    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderStyle="solid"
            borderColor={borderColor}
            borderRadius="12px"
            cursor="pointer"
            transition="all 0.15s"
            overflow="hidden"
            role="group"
            _hover={{
                borderColor: hoverBorderColor,
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
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
                        <Text fontSize="sm" fontWeight="600" color={titleColor}>
                            {title}
                        </Text>
                    </HStack>
                    {description !== undefined && (
                        <Text fontSize="sm" color={descColor} lineHeight="1.5" noOfLines={3}>
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
                    borderTopColor={dividerColor}
                >
                    {footer}
                </Box>
            </VStack>
        </Box>
    );
};
