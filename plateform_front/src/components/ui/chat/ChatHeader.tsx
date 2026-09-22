import React from "react";
import { HStack, Text, Badge, Icon } from "@chakra-ui/react";
import { Sparkles } from "lucide-react";
import { useAppResponsive } from "hooks/useAppResponsive";

interface ChatHeaderProps {
    title: string;
    showOnlineBadge?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, showOnlineBadge = true }) => {
    const isMobile = useAppResponsive({ base: true, lg: false });

    return (
        <HStack p={isMobile ? 2 : 4} borderBottom="1px solid" borderColor="borderSubtle">
            <Icon as={Sparkles} boxSize={5} color="iconAccent" />
            <Text fontWeight="semibold" color="textStrong">
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
