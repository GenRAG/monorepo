import { Box, HStack, VStack, Text, Badge, useColorModeValue } from "@chakra-ui/react";
import { VersionStatus } from "types/deployment/deployment";

interface EnvBadge {
    label: string;
    color: string;
}

interface VersionListItemProps {
    id: string;
    env: VersionStatus;
    badge: EnvBadge;
    description: string;
    date: string;
    isSelected: boolean;
    onClick: () => void;
}

export const VersionListItem = ({ id, env, badge, description, date, isSelected, onClick }: VersionListItemProps) => {
    const selectedBg = useColorModeValue("grey.50", "grey.900");
    const borderBottomColor = useColorModeValue("grey.100", "grey.900");
    const hoverBg = useColorModeValue("grey.25", "grey.950");
    const idColor = useColorModeValue("grey.900", "grey.50");
    const dateColor = useColorModeValue("grey.300", "grey.600");
    const descriptionColor = useColorModeValue("grey.500", "grey.400");

    return (
        <Box
            bg={isSelected ? selectedBg : "transparent"}
            borderBottom="1px solid"
            py="12px"
            px="16px"
            borderBottomColor={borderBottomColor}
            cursor="pointer"
            onClick={onClick}
            transition="all 0.12s"
            _hover={{
                bg: isSelected ? undefined : hoverBg,
            }}
            mb={0}
            position="relative"
            _before={{
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "2px",
                bg: isSelected ? "green.500" : "transparent",
                borderRadius: "2px",
            }}
        >
            <VStack align="stretch" spacing={0.5} minW={0}>
                <HStack justify="space-between" align="center" minW={0}>
                    <HStack spacing={1.5} minW={0}>
                        <Text fontSize="md" fontWeight={500} color={idColor} fontFamily="mono">
                            {id}
                        </Text>
                        {env === "prod" && (
                            <Badge colorScheme={badge.color} fontSize="8px" fontWeight={500} size="xs">
                                EN PROD
                            </Badge>
                        )}
                    </HStack>
                    <Text flexShrink={0} fontSize="xs" color={dateColor}>
                        {date}
                    </Text>
                </HStack>

                <Text fontSize="sm" color={descriptionColor} noOfLines={1}>
                    {description}
                </Text>
            </VStack>
        </Box>
    );
};
