import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
    Box,
    Heading,
    HStack,
    Stack,
    Text,
    VStack,
    useColorMode,
    chakra,
    Icon,
    Circle,
} from '@chakra-ui/react';
import { StepComponentProps } from 'pages/Onboarding/OnBoardingProvider';
import { currentDarkTheme } from 'themeNew/foundations/themeConfig';
import { MessageSquare } from 'lucide-react';
import Button from 'components/Atoms/Button';
import { useChat } from '../../../hooks/useChat';
import { ChatInterface } from '../../../components/Molecules/ChatInterface';
import StepLevel from 'components/Molecules/StepLevel';

interface TestAssistantFormData {
    testQuestion: string;
    testResponse: string;
}

export const TestAssistantStepComponent: React.FC<StepComponentProps> = ({
    data,
    updateData,
    goNext,
    registerValidateAndGoNext,
}) => {
    const { colorMode } = useColorMode();

    const getResponse = useCallback((question: string): string[] => {
        return ["According to the Syntec collective agreement, you are entitled to 25 paid vacation days per year. These days are calculated based on a full month of work."];
    }, []);

    const initialMessages = data.testQuestion && data.testResponse ? [{
        id: 'initial',
        question: data.testQuestion,
        response: [data.testResponse],
        timestamp: Date.now(),
    }] : [];

    console.log(data.testQuestion, data.testResponse);

    const setValueRef = useRef<typeof setValue | null>(null);
    const updateDataRef = useRef<typeof updateData | null>(null);
    const lastProcessedMessageRef = useRef<string>('');

    const handleMessageUpdate = useCallback((message: { id: string; question: string; response: string | string[]; timestamp: number; isImproved?: boolean }) => {
        if (!message.response) return;

        const responseText = Array.isArray(message.response) ? message.response.join('\n') : message.response;
        const messageKey = `${message.question}-${responseText}`;
        if (lastProcessedMessageRef.current === messageKey) return;

        lastProcessedMessageRef.current = messageKey;

        if (setValueRef.current) {
            setValueRef.current('testQuestion', message.question, { shouldValidate: false });
            setValueRef.current('testResponse', responseText, { shouldValidate: false });
        }

        if (updateDataRef.current) {
            updateDataRef.current({
                testQuestion: message.question,
                testResponse: responseText,
            });
        }
    }, []);

    const { messages, sendMessage, isLoading } = useChat({
        getResponse,
        initialMessages,
        onMessageUpdate: handleMessageUpdate,
    });

    console.log(messages);

    const {
        watch,
        trigger,
        setValue,
        formState: { errors },
    } = useForm<TestAssistantFormData>({
        defaultValues: {
            testQuestion: data.testQuestion || '',
            testResponse: data.testResponse || '',
        },
        mode: 'onChange',
    });

    setValueRef.current = setValue;
    updateDataRef.current = updateData;

    const goNextRef = useRef(goNext);
    goNextRef.current = goNext;
    const triggerRef = useRef(trigger);
    triggerRef.current = trigger;

    useEffect(() => {
        if (registerValidateAndGoNext) {
            const validateAndGoNext = async () => {
                const isValid = await triggerRef.current();
                if (isValid) {
                    goNextRef.current();
                }
            };
            registerValidateAndGoNext(validateAndGoNext);
        }
    }, [registerValidateAndGoNext]);

    const suggestedQuestions = [
        "How many paid vacation days do I have?",
        "How do I request an RTT?",
        "Can I carry over my vacation days?",
    ];

    const handleQuestionClick = (suggestedQuestion: string) => {
        sendMessage(suggestedQuestion);
    };

    return (
        <chakra.form w="100%">
            <Stack w="100%" spacing={8}>
                <VStack align="start" spacing={4} w="100%">
                    <VStack align="start" spacing={2} w="100%">
                        <Heading
                            variant="heading-2xl"
                            fontWeight="bold"
                            color={colorMode === 'dark' ? 'white' : 'grey.900'}
                        >
                            Test your HR assistant in 30 seconds
                        </Heading>
                        <Text color={colorMode === 'dark' ? 'grey.400' : 'grey.600'} variant="body-xl">
                            Here's your HR assistant ready to use
                        </Text>
                    </VStack>
                    <StepLevel
                        level={1}
                        title="Demo"
                        description="This model uses only public HR documents. None of your files are used yet."
                    />
                </VStack>

                {messages.length === 0 && (
                    <VStack align="stretch" spacing={2}>
                        <Text fontSize="xs" color={colorMode === 'dark' ? 'grey.400' : 'grey.500'} mb={2}>
                            Suggested questions:
                        </Text>
                        {suggestedQuestions.map((suggestedQuestion, index) => (
                            <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuestionClick(suggestedQuestion)}
                                justifyContent="flex-start"
                                textAlign="left"
                                bg={colorMode === 'dark' ? 'grey.700' : 'white'}
                                borderColor={colorMode === 'dark' ? 'grey.600' : 'grey.300'}
                                _hover={{
                                    bg: colorMode === 'dark' ? 'grey.600' : 'grey.50',
                                    borderColor: currentDarkTheme.primary,
                                }}
                            >
                                <Icon as={MessageSquare} boxSize={4} mr={2} />
                                {suggestedQuestion}
                            </Button>
                        ))}
                    </VStack>
                )}

                <ChatInterface
                    messages={messages}
                    onSendMessage={sendMessage}
                    isLoading={isLoading}
                    placeholder="Enter your question"
                    welcomeMessage="Hello! I'm your HR assistant. Ask me a question about vacation, RTT, or any other HR topic."
                />
            </Stack>
        </chakra.form>
    );
};

