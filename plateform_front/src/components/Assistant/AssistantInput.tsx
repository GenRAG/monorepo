import React, { useRef, useState } from "react";
import { Box, HStack, Text, Textarea, useColorMode } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { ArrowUp } from "lucide-react";
import Button from "components/ui/Button";
import { useDynamicPlaceholder } from "hooks/useDynamicPlaceholder";

const blink = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
`;

interface AssistantInputProps {
    onSubmit: (value: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    compact?: boolean;
}

const AssistantInput: React.FC<AssistantInputProps> = ({
    onSubmit,
    placeholder,
    isLoading = false,
    compact = false,
}) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { displayed, isAnimating } = useDynamicPlaceholder(placeholder);

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
        if (textareaRef.current) textareaRef.current.style.height = "28px";
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        const el = e.target;
        el.style.height = "0px";
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    };

    const borderColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const subColor = isDark ? "grey.500" : "grey.400";
    const placeholderColor = isDark ? "grey.600" : "grey.400";

    return (
        <Box
            w="100%"
            borderRadius="16px"
            border={`1px solid ${borderColor}`}
            px={4}
            pt={compact ? 3 : 4}
            pb={3}
            boxShadow="lg"
        >
            <Box position="relative">
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    border="none"
                    p={0}
                    minH="28px"
                    maxH="200px"
                    h="40px"
                    resize="none"
                    overflow="hidden"
                    bg="transparent"
                    fontSize="md"
                    lineHeight="1.6"
                    color={isDark ? "white" : "grey.900"}
                    _focus={{ boxShadow: "none" }}
                    isDisabled={isLoading}
                />
                {!value && (
                    <Box
                        position="absolute"
                        top="1px"
                        left="1px"
                        pointerEvents="none"
                        color={placeholderColor}
                        fontSize="md"
                        lineHeight="1.6"
                        userSelect="none"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        w="100%"
                        textAlign="left"
                    >
                        {displayed}
                        {isAnimating && (
                            <Box as="span" ml="1px" animation={`${blink} 0.6s step-end infinite`}>
                                |
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

            <HStack justify="space-between" mt={compact ? 2 : 3}>
                <HStack spacing={2} justify="flex-end" w="100%">
                    {!compact && (
                        <Text fontSize="xs" color={subColor}>
                            envoyer
                        </Text>
                    )}
                    {compact && (
                        <Text fontSize="10px" color={subColor} mt={2} textAlign="right">
                            Entrée pour envoyer ⇧↵ pour la ligne suivante
                        </Text>
                    )}
                    <Button
                        aria-label="Envoyer"
                        btnType="icon"
                        size="sm"
                        icon={ArrowUp}
                        variant="superPrimary"
                        onClick={handleSubmit}
                        isDisabled={!value.trim() || isLoading}
                        isLoading={isLoading}
                    />
                </HStack>
            </HStack>
        </Box>
    );
};

export default AssistantInput;
