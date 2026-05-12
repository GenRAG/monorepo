import React, { useRef, useState } from "react";
import { Box, HStack, Text, Textarea, useColorMode } from "@chakra-ui/react";
import { ArrowUp } from "lucide-react";
import Button from "components/System/Atoms/Button";

interface AssistantInputProps {
    onSubmit: (value: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    compact?: boolean;
}

const AssistantInput: React.FC<AssistantInputProps> = ({
    onSubmit,
    placeholder = "Posez votre question...",
    isLoading = false,
    compact = false,
}) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (!value.trim() || isLoading) return;
        onSubmit(value.trim());
        setValue("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
    };

    const borderColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const bg = isDark ? "rgba(255,255,255,0.04)" : "white";
    const subColor = isDark ? "grey.500" : "grey.400";

    return (
        <Box
            w="100%"
            borderRadius="16px"
            border={`1px solid ${borderColor}`}
            bg={bg}
            px={4}
            pt={compact ? 3 : 4}
            pb={3}
            boxShadow="lg"
        >
            <Textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                border="none"
                p={0}
                minH={compact ? "36px" : "48px"}
                maxH="160px"
                resize="none"
                overflow="hidden"
                fontSize={compact ? "sm" : "md"}
                bg="transparent"
                color={isDark ? "white" : "grey.900"}
                _placeholder={{ color: isDark ? "grey.600" : "grey.400", fontFamily: "monospace" }}
                _focus={{ boxShadow: "none" }}
                isDisabled={isLoading}
                rows={1}
                lineHeight="1.6"
            />

            <HStack justify="space-between" mt={compact ? 2 : 3}>
                <HStack spacing={2} justify="flex-end" w="100%">
                    {!compact && (
                        <Text fontSize="xs" color={subColor}>
                            envoyer
                        </Text>
                    )}
                    <Button
                        aria-label="Envoyer"
                        btnType="icon"
                        icon={ArrowUp}
                        size="md"
                        borderRadius="12px"
                        bg={value.trim() && !isLoading ? "#34D3A9" : isDark ? "rgba(255,255,255,0.08)" : "grey.200"}
                        color={value.trim() && !isLoading ? "#0A2E28" : subColor}
                        _hover={{ opacity: 0.9 }}
                        onClick={handleSubmit}
                        isDisabled={!value.trim() || isLoading}
                        isLoading={isLoading}
                    />
                </HStack>
            </HStack>

            {compact && (
                <Text fontSize="10px" color={subColor} mt={2} textAlign="right">
                    Entrée pour envoyer · ⇧↵ pour la ligne suivante
                </Text>
            )}
        </Box>
    );
};

export default AssistantInput;
