import {
    Box,
    HStack,
    Icon,
    IconButton,
    Input,
    useColorMode,
} from "@chakra-ui/react";
import { MessageSquare, Mic, Plus, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "components/Atoms/Button";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    animatedPlaceholders?: string[];
    isLoading?: boolean;
    isMobile?: boolean;
    isEmptyState?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSubmit,
    placeholder = "Ask me anything...",
    animatedPlaceholders,
    isLoading = false,
    isMobile: _isMobile = false,
    isEmptyState = false,
}: ChatInputProps) => {
    const { colorMode } = useColorMode();
    const iconColor = colorMode === "dark" ? "grey.300" : "grey.600";
    const placeholders = useMemo(
        () =>
            animatedPlaceholders && animatedPlaceholders.length > 0
                ? animatedPlaceholders
                : [placeholder],
        [animatedPlaceholders, placeholder],
    );
    const [displayedPlaceholder, setDisplayedPlaceholder] =
        useState(placeholder);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setDisplayedPlaceholder(placeholder);
        setPlaceholderIndex(0);
        setCharIndex(0);
        setIsDeleting(false);
    }, [placeholder]);

    useEffect(() => {
        if (value.trim().length > 0 || placeholders.length <= 1) {
            setDisplayedPlaceholder(placeholder);
            return;
        }

        const currentText = placeholders[placeholderIndex] ?? placeholder;
        let typingDelay = 90;

        if (!isDeleting && charIndex === currentText.length) {
            typingDelay = 2600;
        }

        if (isDeleting) {
            typingDelay = charIndex === 0 ? 250 : 35;
        }

        const timeout = window.setTimeout(() => {
            if (!isDeleting) {
                if (charIndex === currentText.length) {
                    setIsDeleting(true);
                    return;
                }

                const nextCharIndex = Math.min(
                    charIndex + 1,
                    currentText.length,
                );
                setDisplayedPlaceholder(currentText.slice(0, nextCharIndex));
                setCharIndex(nextCharIndex);

                return;
            }

            const nextCharIndex = Math.max(charIndex - 1, 0);
            setDisplayedPlaceholder(currentText.slice(0, nextCharIndex));
            setCharIndex(nextCharIndex);

            if (nextCharIndex === 0) {
                setIsDeleting(false);
                setPlaceholderIndex(
                    (prevIndex) => (prevIndex + 1) % placeholders.length,
                );
            }
        }, typingDelay);

        return () => window.clearTimeout(timeout);
    }, [
        charIndex,
        isDeleting,
        placeholder,
        placeholderIndex,
        placeholders,
        value,
    ]);

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
            p={0}
            w="100%"
        >
            <Box
                flex={1}
                borderRadius={isEmptyState ? "24px" : "18px"}
                border={`1px solid ${colorMode === "dark" ? "grey.600" : "grey.200"}`}
                bg={colorMode === "dark" ? "grey.850" : "white"}
                px={{ base: 2, md: 3 }}
                py={isEmptyState ? 2 : 1.5}
                boxShadow={isEmptyState ? "lg" : "none"}
            >
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size={isEmptyState ? "md" : "sm"}
                    placeholder={displayedPlaceholder}
                    border="none"
                    px={1}
                    _focus={{ border: "none", boxShadow: "none" }}
                    bg="transparent"
                    color={colorMode === "dark" ? "white" : "grey.900"}
                    isDisabled={isLoading}
                />

                <HStack justify="space-between" pt={1}>
                    <HStack spacing={1}>
                        <IconButton
                            aria-label="Add"
                            icon={<Plus size={14} />}
                            size="xs"
                            variant="ghost"
                            color={iconColor}
                        />
                        {!isEmptyState && (
                            <>
                                <IconButton
                                    aria-label="Message mode"
                                    icon={<MessageSquare size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    color={iconColor}
                                />
                                <IconButton
                                    aria-label="Voice mode"
                                    icon={<Mic size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    color={iconColor}
                                />
                            </>
                        )}
                    </HStack>

                    <Button
                        size={isEmptyState ? "md" : "sm"}
                        bg={currentDarkTheme.primary}
                        color="white"
                        borderRadius="999px"
                        _hover={{ bg: currentDarkTheme.primary500 }}
                        onClick={() => onSubmit()}
                        isDisabled={!value.trim() || isLoading}
                        minW={isEmptyState ? "38px" : "34px"}
                        px={0}
                    >
                        <Icon as={Send} boxSize={4} />
                    </Button>
                </HStack>
            </Box>
        </HStack>
    );
};
