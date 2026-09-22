import { Box, HStack, VStack, Text, Badge } from "@chakra-ui/react";
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
    return (
        <Box
            bg={isSelected ? "surfaceHover" : "transparent"}
            borderBottom="1px solid"
            py="12px"
            px="16px"
            borderBottomColor="borderDefault"
            cursor="pointer"
            onClick={onClick}
            transition="all 0.12s"
            _hover={{
                bg: isSelected ? undefined : "secondBackgroundDefault",
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
                bg: isSelected ? "iconAccent" : "transparent",
                borderRadius: "2px",
            }}
        >
            <VStack align="stretch" spacing={0.5} minW={0}>
                <HStack justify="space-between" align="center" minW={0}>
                    <HStack spacing={1.5} minW={0}>
                        <Text fontSize="md" fontWeight={500} color="textStrong" fontFamily="mono">
                            {id}
                        </Text>
                        {env === "prod" && (
                            <Badge colorScheme={badge.color} fontSize="8px" fontWeight={500} size="xs">
                                EN PROD
                            </Badge>
                        )}
                    </HStack>
                    <Text flexShrink={0} fontSize="xs" color="textSubtle">
                        {date}
                    </Text>
                </HStack>

                <Text fontSize="sm" color="textLabel" noOfLines={1}>
                    {description}
                </Text>
            </VStack>
        </Box>
    );
};
