import { Box, HStack, IconButton, Text, useColorMode } from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { SidebarAssistants } from "./SidebarAssistants";
import { SidebarConversations } from "./SidebarConversations";
import type { AssistantPreview, ConversationPreview } from "./types";

interface DeployedChatSidebarProps {
    assistants: AssistantPreview[];
    currentAssistantId: string;
    onAssistantSelect: (assistantId: string) => void;
    conversations: ConversationPreview[];
    currentConversationId: string | null;
    onConversationSelect: (conversationId: string) => void;
    onNewConversation?: () => void;
    onClose: () => void;
    isOpen: boolean;
}

export const DeployedChatSidebar: React.FC<DeployedChatSidebarProps> = ({
    assistants,
    currentAssistantId,
    onAssistantSelect,
    conversations,
    currentConversationId,
    onConversationSelect,
    onNewConversation,
    onClose,
    isOpen,
}: DeployedChatSidebarProps) => {
    const { colorMode } = useColorMode();
    const borderColor = colorMode === "dark" ? "grey.600" : "grey.100";

    return (
        <Box
            w={isOpen ? { base: "280px", md: "260px" } : "20px"}
            minW={isOpen ? { base: "280px", md: "260px" } : "20px"}
            mr={isOpen ? 0 : "20px"}
            borderRight={`1px solid`}
            borderColor={borderColor}
            display="flex"
            flexDirection="column"
            transition="all 0.2s"
            overflow="hidden"
            position={{ base: "absolute", md: "relative" }}
            left={0}
            top={0}
            bottom={0}
            zIndex={2}
            bg={colorMode === "dark" ? "grey.800" : "white"}
        >
            <HStack
                p={3}
                borderBottom={`1px solid ${colorMode === "dark" ? "grey.600" : "grey.200"}`}
                justify="space-between"
            >
                <Text fontSize="sm" fontWeight="semibold">
                    Assistants
                </Text>
                <IconButton
                    aria-label="Close sidebar"
                    icon={<ChevronLeft size={16} />}
                    size="xs"
                    variant="ghost"
                    onClick={onClose}
                />
            </HStack>
            <Box
                flex={1}
                overflowY="auto"
                p={2}
                display="flex"
                flexDirection="column"
                gap={4}
            >
                <SidebarAssistants
                    assistants={assistants}
                    currentAssistantId={currentAssistantId}
                    onAssistantSelect={onAssistantSelect}
                />
                <SidebarConversations
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onConversationSelect={onConversationSelect}
                    onNewConversation={onNewConversation}
                />
            </Box>
        </Box>
    );
};
