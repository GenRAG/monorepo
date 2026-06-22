import React from "react";
import { HStack, Text, Badge, Icon, useColorModeValue } from "@chakra-ui/react";
import { Sparkles } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useAppResponsive } from "hooks/useAppResponsive";

interface ChatHeaderProps {
    title: string;
    showOnlineBadge?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, showOnlineBadge = true }) => {
    const borderColor = useColorModeValue("grey.100", "grey.600");
    const textColor = useColorModeValue("grey.900", "white");
    const isMobile = useAppResponsive({ base: true, lg: false });

    return (
        <HStack p={isMobile ? 2 : 4} borderBottom="1px solid" borderColor={borderColor}>
            <Icon as={Sparkles} boxSize={5} color={currentDarkTheme.primary} />
            <Text fontWeight="semibold" color={textColor}>
                {title}
            </Text>
            {showOnlineBadge && (
                <Badge colorScheme="green" ml="auto">
                    Online
                </Badge>
            )}
        </HStack>
    );
};

export default ChatHeader;
