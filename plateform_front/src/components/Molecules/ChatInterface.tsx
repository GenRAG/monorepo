import React, { useRef, useEffect, useState } from 'react';
import {
    Box,
    HStack,
    Text,
    VStack,
    useColorMode,
    Icon,
    Badge,
    Input,
    Divider,
} from '@chakra-ui/react';
import { Send, Sparkles } from 'lucide-react';
import Button from 'components/Atoms/Button';
import { currentDarkTheme } from 'themeNew/foundations/themeConfig';
import { ChatMessage } from '../../hooks/useChat';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    onSendMessage: (question: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    welcomeMessage?: string;
    title?: string;
    showOnlineBadge?: boolean;
    height?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    onSendMessage,
    isLoading = false,
    placeholder = "Enter your question",
    welcomeMessage,
    title = "HR Assistant",
    showOnlineBadge = true,
    height = "500px",
}) => {
    const { colorMode } = useColorMode();
    const [question, setQuestion] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (question.trim() && !isLoading) {
            onSendMessage(question);
            setQuestion('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const showWelcome = messages.length === 0 && welcomeMessage;

    return (
        <Box
            w="100%"
            h={height}
            border={`1px solid ${colorMode === 'dark' ? 'grey' : '#E7E7E7'}`}
            borderRadius="12px"
            bg={colorMode === 'dark' ? 'grey.800' : 'white'}
            display="flex"
            flexDirection="column"
        >
            <HStack p={4} borderBottom={`1px solid ${colorMode === 'dark' ? 'grey.600' : 'grey.200'}`}>
                <Icon as={Sparkles} boxSize={5} color={currentDarkTheme.primary} />
                <Text fontWeight="semibold" color={colorMode === 'dark' ? 'white' : 'grey.900'}>
                    {title}
                </Text>
                {showOnlineBadge && (
                    <Badge colorScheme="green" ml="auto">Online</Badge>
                )}
            </HStack>
            <Divider borderColor={colorMode === 'dark' ? 'grey.600' : 'grey.100'} borderWidth="1px" />
            <Box
                ref={messagesContainerRef}
                flex={1}
                overflowY="auto"
                mb={4}
                p={4}
                display="flex"
                flexDirection="column"
            >
                <VStack align="stretch" spacing={4} w="100%">
                    {showWelcome && (
                        <Box
                            p={4}
                            bg={colorMode === 'dark' ? 'grey.700' : 'grey.50'}
                            borderRadius="12px"
                            alignSelf="flex-start"
                            maxW="80%"
                        >
                            <Text fontSize="sm" color={colorMode === 'dark' ? 'grey.200' : 'grey.700'}>
                                {welcomeMessage}
                            </Text>
                        </Box>
                    )}

                    {messages.map((message) => (
                        <React.Fragment key={message.id}>
                            <Box
                                p={4}
                                bg={currentDarkTheme.primary}
                                borderRadius="12px"
                                alignSelf="flex-end"
                                maxW="80%"
                            >
                                <Text fontSize="sm" color="white">
                                    {message.question}
                                </Text>
                            </Box>
                            {message.response && (
                                <HStack align="flex-start" spacing={2}>
                                    <Box
                                        p={4}
                                        bg={colorMode === 'dark' ? 'grey.700' : 'grey.50'}
                                        borderRadius="12px"
                                        alignSelf="flex-start"
                                        maxW="60%"
                                    >
                                        <Text fontSize="sm" color={colorMode === 'dark' ? 'grey.200' : 'grey.700'}>
                                            {message.response}
                                        </Text>
                                        {message.isImproved && (
                                            <Badge colorScheme="green" mt={2} fontSize="xs">
                                                Improved response
                                            </Badge>
                                        )}
                                    </Box>
                                </HStack>
                            )}
                            {!message.response && isLoading && message.id === messages[messages.length - 1]?.id && (
                                <HStack align="flex-start" spacing={2}>
                                    <Box p={2} bg={currentDarkTheme.primary} borderRadius="12px" alignSelf="flex-start">
                                        <Icon as={Sparkles} boxSize={4} color="white" />
                                    </Box>
                                    <Box
                                        p={4}
                                        bg={colorMode === 'dark' ? 'grey.700' : 'grey.50'}
                                        borderRadius="12px"
                                        alignSelf="flex-start"
                                    >
                                        <Text fontSize="sm" color={colorMode === 'dark' ? 'grey.400' : 'grey.500'} fontStyle="italic">
                                            Thinking...
                                        </Text>
                                    </Box>
                                </HStack>
                            )}
                        </React.Fragment>
                    ))}
                    <div ref={messagesEndRef} />
                </VStack>
            </Box>

            <HStack spacing={2} as="form" onSubmit={handleSubmit} p={4}>
                <Box
                    flex={1}
                    borderRadius="8px"
                    border={`1px solid ${colorMode === 'dark' ? 'grey.600' : 'grey.300'}`}
                >
                    <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="sm"
                        placeholder={placeholder}
                        border="none"
                        _focus={{ border: 'none', boxShadow: 'none' }}
                        bg={colorMode === 'dark' ? 'grey.700' : 'grey.50'}
                        isDisabled={isLoading}
                    />
                </Box>
                <Button
                    type="submit"
                    size="md"
                    bg={currentDarkTheme.primary}
                    color="white"
                    _hover={{ bg: currentDarkTheme.primary500 }}
                    onClick={handleSubmit}
                    isDisabled={!question.trim() || isLoading}
                >
                    <Icon as={Send} boxSize={4} />
                </Button>
            </HStack>
        </Box>
    );
};

