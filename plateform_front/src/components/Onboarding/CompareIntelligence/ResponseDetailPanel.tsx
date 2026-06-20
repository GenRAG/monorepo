import React from "react";
import { Badge, Box, HStack, Icon, Text, VStack, useColorMode } from "@chakra-ui/react";
import { Check, LucideIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getMarkdownStyles } from "components/ui/chat/markdownStyles";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface ResponseCardProps {
    title: string;
    badge: string;
    isRecommended?: boolean;
    icon: LucideIcon;
    responseText: string;
    advantages: string[];
    isSelected: boolean;
    onClick: () => void;
}

const ResponseCard: React.FC<ResponseCardProps> = ({
    title,
    badge,
    isRecommended = false,
    icon,
    responseText,
    advantages,
    isSelected,
    onClick,
}) => {
    const { colorMode } = useColorMode();

    return (
        <Box
            flex={1}
            border="1px solid"
            borderColor={isSelected ? currentDarkTheme.primary : colorMode === "dark" ? "grey.700" : "grey.200"}
            borderRadius="12px"
            p={4}
            cursor="pointer"
            onClick={onClick}
            bg={colorMode === "dark" ? "grey.800" : "white"}
            _hover={{
                borderColor: currentDarkTheme.primary,
            }}
            transition="border-color 0.15s"
        >
            <VStack align="stretch" spacing={3}>
                <HStack justify="space-between" align="center">
                    <HStack spacing={2}>
                        <Icon as={icon} boxSize={4} color={currentDarkTheme.primary} />
                        <Text
                            fontWeight="bold"
                            fontSize="xs"
                            letterSpacing="wider"
                            color={colorMode === "dark" ? "white" : "grey.900"}
                        >
                            {title}
                        </Text>
                    </HStack>
                    <Badge
                        fontSize="xs"
                        colorScheme={isRecommended ? "green" : "gray"}
                        variant="subtle"
                        borderRadius="full"
                        px={2}
                    >
                        {badge}
                    </Badge>
                </HStack>

                <Box
                    fontSize="sm"
                    color={colorMode === "dark" ? "grey.300" : "grey.700"}
                    lineHeight="1.6"
                    sx={getMarkdownStyles(colorMode)}
                >
                    <ReactMarkdown>{responseText}</ReactMarkdown>
                </Box>

                <VStack align="stretch" spacing={1}>
                    {advantages.map((adv, i) => (
                        <HStack key={i} spacing={2}>
                            <Icon as={Check} boxSize={3} color={currentDarkTheme.primary} flexShrink={0} />
                            <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                                {adv}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            </VStack>
        </Box>
    );
};

export default ResponseCard;
