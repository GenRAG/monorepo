import React, { useState } from "react";
import { HStack, Icon, Input, useColorModeValue } from "@chakra-ui/react";
import { ArrowUp, Send } from "lucide-react";
import Button from "components/ui/Button";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useAppResponsive } from "hooks/useAppResponsive";

interface ChatInputProps {
    placeholder?: string;
    isLoading?: boolean;
    disabled?: boolean;
    onSend: (question: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
    placeholder = "Enter your question",
    isLoading = false,
    disabled = false,
    onSend,
}) => {
    const bgColor = useColorModeValue("grey.50", "grey.800");
    const isMobile = useAppResponsive({ base: true, lg: false });
    const [question, setQuestion] = useState("");

    const handleSubmit = (e?: React.SyntheticEvent) => {
        e?.preventDefault();
        if (question.trim() && !isLoading) {
            onSend(question);
            setQuestion("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <HStack spacing={2} as="form" bg="transparent" onSubmit={handleSubmit} p={isMobile ? 2 : 4}>
            <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyPress}
                size="sm"
                borderRadius="8px"
                placeholder={placeholder}
                bg={bgColor}
                isDisabled={isLoading || disabled}
            />
            <Button
                aria-label="Envoyer"
                btnType="icon"
                size="md"
                icon={ArrowUp}
                variant="superPrimary"
                onClick={handleSubmit}
                isDisabled={isLoading || disabled || question.trim() === ""}
                isLoading={isLoading}
            />
        </HStack>
    );
};

export default ChatInput;
