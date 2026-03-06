import { Box, HStack, Icon, Input, useColorMode } from "@chakra-ui/react";
import { Send } from "lucide-react";
import Button from "components/Atoms/Button";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    isLoading?: boolean;
    isMobile?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSubmit,
    placeholder = "Ask me anything...",
    isLoading = false,
    isMobile = false,
}: ChatInputProps) => {
    const { colorMode } = useColorMode();

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <HStack
            spacing={2}
            as="form"
            onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                onSubmit();
            }}
            p={isMobile ? 2 : 4}
            pt={0}
        >
            <Box
                flex={1}
                borderRadius="8px"
                border={`1px solid ${colorMode === "dark" ? "grey.600" : "grey.300"}`}
                bg="transparent"
            >
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="sm"
                    placeholder={placeholder}
                    border="none"
                    _focus={{ border: "none", boxShadow: "none" }}
                    bg={colorMode === "dark" ? "grey.700" : "grey.50"}
                    isDisabled={isLoading}
                />
            </Box>
            <Button
                size="md"
                bg={currentDarkTheme.primary}
                color="white"
                _hover={{ bg: currentDarkTheme.primary500 }}
                onClick={() => onSubmit()}
                isDisabled={!value.trim() || isLoading}
            >
                <Icon as={Send} boxSize={4} />
            </Button>
        </HStack>
    );
};
