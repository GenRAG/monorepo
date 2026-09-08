import React, { useRef, useState } from "react";
import { Box, Flex, HStack, Text, Textarea, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import Button from "components/ui/Button";
import { useDynamicPlaceholder } from "hooks/useDynamicPlaceholder";

const MotionBox = motion(Box);

interface AssistantInputProps {
    onSubmit: (value: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    compact?: boolean;
    disabled?: boolean;
    disabledMessage?: string;
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
    <Box
        as="kbd"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        minW="17px"
        h="17px"
        px={1}
        borderRadius="4px"
        border="1px solid"
        borderColor="borderStrong"
        bg="surfaceSubtle"
        fontSize="10px"
        fontFamily="mono"
        fontStyle="normal"
        color="textFaint"
        lineHeight="1"
        flexShrink={0}
    >
        {children}
    </Box>
);

const AssistantInput: React.FC<AssistantInputProps> = ({
    onSubmit,
    placeholder,
    isLoading = false,
    compact = false,
    disabled = false,
    disabledMessage,
}) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { displayed: dynamicPlaceholder } = useDynamicPlaceholder(disabled ? undefined : placeholder);

    const canSend = !!value.trim() && !isLoading && !disabled;
    const stacked = !compact || value !== "";

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (!canSend) return;
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

    const textareaField = (
        <Box position="relative" flex={stacked ? undefined : 1} minW={0}>
            <Textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={disabled && disabledMessage ? disabledMessage : dynamicPlaceholder}
                p={0}
                minH="28px"
                maxH="200px"
                h="28px"
                resize="none"
                overflow="hidden"
                fontSize="md"
                lineHeight="1.6"
                borderWidth="0"
                borderRadius="0"
                bg="transparent"
                boxShadow="none"
                _hover={{ borderWidth: "0" }}
                _focus={{ borderWidth: "0", boxShadow: "none" }}
                color="textStrong"
                isDisabled={isLoading || disabled}
            />
        </Box>
    );

    const sendButton = (
        <MotionBox
            flexShrink={0}
            animate={{ scale: canSend ? 1 : 0.9, opacity: canSend ? 1 : 0.5 }}
            whileHover={canSend ? { scale: 1.06 } : undefined}
            whileTap={canSend ? { scale: 0.94 } : undefined}
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
            <Button
                aria-label="Envoyer"
                btnType="icon"
                size="sm"
                icon={ArrowUp}
                variant="superPrimary"
                onClick={handleSubmit}
                isDisabled={!canSend}
                isLoading={isLoading}
            />
        </MotionBox>
    );

    return (
        <MotionBox
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            w="100%"
            borderRadius="24px"
            border="1px solid"
            borderColor="borderDefault"
            px={4}
            py={compact ? 2.5 : undefined}
            pt={compact ? undefined : 4}
            pb={compact ? undefined : 3}
            bg="inputBg"
            boxShadow={isDark ? "none" : "0px 4px 16px rgba(0,0,0,0.06), 0px 1px 2px rgba(0,0,0,0.04)"}
            sx={{ transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
            _focusWithin={{
                borderColor: "green.400",
                boxShadow: "outline",
            }}
        >
            {compact ? (
                <Flex direction={stacked ? "column" : "row"} align={stacked ? "stretch" : "center"} gap={2}>
                    {textareaField}
                    <Flex justify="flex-end">{sendButton}</Flex>
                </Flex>
            ) : (
                <>
                    {textareaField}
                    <HStack justify="space-between" align="center" mt={3}>
                        <HStack spacing={1.5}>
                            <Kbd>↵</Kbd>
                            <Text fontSize="xs" color="textFaint">
                                envoyer
                            </Text>
                            <Text fontSize="xs" color="textSubtle">
                                ·
                            </Text>
                            <Kbd>⇧</Kbd>
                            <Kbd>↵</Kbd>
                            <Text fontSize="xs" color="textFaint">
                                nouvelle ligne
                            </Text>
                        </HStack>
                        {sendButton}
                    </HStack>
                </>
            )}
        </MotionBox>
    );
};

export default AssistantInput;
