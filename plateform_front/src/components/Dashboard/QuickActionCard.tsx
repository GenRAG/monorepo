import {
    Box,
    HStack,
    Icon,
    Text,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    onClick?: () => void;
}

export const QuickActionCard = ({
    icon,
    title,
    subtitle,
    onClick,
}: QuickActionCardProps) => {
    const cardBg = useColorModeValue("white", "grey.850");
    const border = useColorModeValue("grey.100", "grey.800");
    const hoverBorder = useColorModeValue("grey.200", "grey.700");
    const hoverBg = useColorModeValue("grey.50", "grey.800");
    const iconBg = useColorModeValue("grey.100", "grey.800");
    const titleCol = useColorModeValue("grey.900", "grey.100");
    const subCol = useColorModeValue("grey.500", "grey.400");

    return (
        <Box
            as="button"
            bg={cardBg}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            p={4}
            cursor="pointer"
            onClick={onClick}
            transition="border-color 0.15s, background 0.15s"
            _hover={{ bg: hoverBg, borderColor: hoverBorder }}
            textAlign="left"
            w="100%"
        >
            <HStack spacing={3} align="center">
                <Box
                    bg={iconBg}
                    borderRadius="8px"
                    p={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                >
                    <Icon as={icon} boxSize={4} color={titleCol} />
                </Box>
                <VStack align="start" spacing={0.5}>
                    <Text
                        fontSize="sm"
                        fontWeight="600"
                        color={titleCol}
                        lineHeight="1.2"
                    >
                        {title}
                    </Text>
                    <Text fontSize="12px" color={subCol} lineHeight="1.3">
                        {subtitle}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    );
};
