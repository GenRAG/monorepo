import { Badge, HStack, Icon, Text, useColorMode } from "@chakra-ui/react";
import { Sparkles } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface ChatHeaderProps {
    title: string;
    showOnlineBadge?: boolean;
    isMobile?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    title,
    showOnlineBadge = true,
    isMobile = false,
}: ChatHeaderProps) => {
    const { colorMode } = useColorMode();

    return (
        <HStack
            p={isMobile ? 2 : 4}
            borderBottom={`1px solid ${colorMode === "dark" ? "grey.600" : "grey.200"}`}
        >
            <Icon as={Sparkles} boxSize={5} color={currentDarkTheme.primary} />
            <Text
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "grey.900"}
            >
                {title}
            </Text>
            {showOnlineBadge && (
                <Badge colorScheme="green" ml="auto">
                    En ligne
                </Badge>
            )}
        </HStack>
    );
};
