import {
    Box,
    HStack,
    Icon,
    Text,
    VStack,
    useColorMode,
} from "@chakra-ui/react";
import { Bot } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import type { AssistantPreview } from "./types";

interface SidebarAssistantsProps {
    assistants: AssistantPreview[];
    currentAssistantId: string;
    onAssistantSelect: (assistantId: string) => void;
}

export const SidebarAssistants: React.FC<SidebarAssistantsProps> = ({
    assistants,
    currentAssistantId,
    onAssistantSelect,
}: SidebarAssistantsProps) => {
    const { colorMode } = useColorMode();

    return (
        <VStack align="stretch" spacing={1}>
            <HStack spacing={2} mb={1}>
                <Icon as={Bot} boxSize={4} color={currentDarkTheme.primary} />
                <Text fontSize="xs" color="grey.500" fontWeight="medium">
                    Assistants
                </Text>
            </HStack>
            {assistants.length === 0 ? (
                <Text fontSize="xs" color="grey.500" p={2}>
                    Aucun assistant
                </Text>
            ) : (
                assistants.map((assistant) => (
                    <Box
                        key={assistant.id}
                        p={2}
                        borderRadius="8px"
                        cursor="pointer"
                        bg={
                            assistant.id === currentAssistantId
                                ? colorMode === "dark"
                                    ? "grey.700"
                                    : "grey.100"
                                : "transparent"
                        }
                        _hover={{
                            bg: colorMode === "dark" ? "grey.700" : "grey.100",
                        }}
                        onClick={() => onAssistantSelect(assistant.id)}
                    >
                        <Text
                            fontSize="sm"
                            noOfLines={2}
                            color={
                                colorMode === "dark" ? "grey.300" : "grey.700"
                            }
                            fontWeight={
                                assistant.id === currentAssistantId
                                    ? "semibold"
                                    : "normal"
                            }
                        >
                            {assistant.title}
                        </Text>
                    </Box>
                ))
            )}
        </VStack>
    );
};
