import React, { useRef, useEffect, useState } from 'react';
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
    SimpleGrid,
    Input,
} from '@chakra-ui/react';
import { StepComponentProps } from 'pages/Onboarding/OnBoardingProvider';
import { currentDarkTheme } from 'themeNew/foundations/themeConfig';
import { Sparkles, CheckCircle2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from 'components/Atoms/Button';
import StepLevel from 'components/Molecules/StepLevel';

interface LLMResponse {
    id: string;
    label: string;
    description: string;
    response: string;
}

interface CompareIntelligenceFormData {
    selectedLLM: string;
    question: string;
}

export const CompareIntelligenceStepComponent: React.FC<StepComponentProps> = ({
    data,
    updateData,
    goNext,
    registerValidateAndGoNext,
}) => {
    const { colorMode } = useColorMode();
    const [selectedLLM, setSelectedLLM] = useState<string | null>(data.selectedLLM || null);
    const [question, setQuestion] = useState<string>(data.testQuestion || data.question || '');
    const [showResponses, setShowResponses] = useState<boolean>(!!data.testQuestion || !!data.question);

    const {
        watch,
        trigger,
        setValue,
        formState: { errors },
    } = useForm<CompareIntelligenceFormData>({
        defaultValues: {
            selectedLLM: data.selectedLLM || '',
            question: data.testQuestion || data.question || '',
        },
        mode: 'onChange',
    });

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
    }, [registerValidateAndGoNext, triggerRef, goNextRef]);

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuestion = e.target.value;
        setQuestion(newQuestion);
    };

    const handleQuestionSubmit = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (question.trim()) {
            setShowResponses(true);
            setValue('question', question);
            updateData({ question, testQuestion: question });
            trigger();
        }
    };

    const llmOptions: LLMResponse[] = [
        {
            id: 'standard',
            label: 'Standard (fast)',
            description: 'Quick and efficient responses',
            response: "According to your collective agreement and internal regulations, you are entitled to 27 paid vacation days per year, including 2 additional days granted by your company.",
        },
        {
            id: 'precise',
            label: 'More precise',
            description: 'In-depth document analysis',
            response: "According to your collective agreement (article 12.3) and your internal regulations (section 4.2), you are entitled to 27 paid vacation days per year. This allocation includes: 25 base days according to the Syntec agreement + 2 additional days granted by your company as part of its company agreement signed in 2023.",
        },
        {
            id: 'creative',
            label: 'More creative',
            description: 'More detailed and contextual responses',
            response: "Great question! Your company grants you 27 paid vacation days per year, which is above the legal minimum. This includes 25 days according to the Syntec agreement, plus 2 additional days that your company has chosen to add to improve your work-life balance. These days can be taken according to the terms defined in your internal regulations.",
        },
    ];

    const handleSelect = (llmId: string) => {
        setSelectedLLM(llmId);
        setValue('selectedLLM', llmId);
        updateData({
            selectedLLM: llmId,
            question: question,
        });
        trigger();
    };

    return (
        <chakra.form w="100%" onSubmit={handleQuestionSubmit}>
            <Stack w="100%" spacing={8}>
                <VStack align="start" spacing={4} w="100%">
                    <VStack align="start" spacing={2} w="100%">
                        <Heading
                            variant="heading-2xl"
                            fontWeight="bold"
                            color={colorMode === 'dark' ? 'white' : 'grey.900'}
                        >
                            Compare your assistant's intelligence
                        </Heading>
                        <Text color={colorMode === 'dark' ? 'grey.400' : 'grey.600'} variant="body-xl">
                            Compare the quality of responses
                        </Text>
                    </VStack>

                    <StepLevel
                        level={4}
                        title="Optimized"
                        description="You can change intelligence at any time. Nothing is final."
                    />
                </VStack>
                <Box
                    w="100%"
                    border={`1px solid ${colorMode === 'dark' ? 'grey.600' : 'grey.300'}`}
                    borderRadius="12px"
                    bg={colorMode === 'dark' ? 'grey.800' : 'white'}
                    p={6}
                >
                    <VStack align="stretch" spacing={6}>
                        <HStack spacing={2}>
                            <Box
                                flex={1}
                                p={3}
                                borderRadius="8px"
                                border={`1px solid ${colorMode === 'dark' ? 'grey.600' : 'grey.300'}`}
                            >
                                <Input
                                    value={question}
                                    onChange={handleQuestionChange}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleQuestionSubmit();
                                        }
                                    }}
                                    size="sm"
                                    placeholder="Enter your question"
                                    border="none"
                                    _focus={{ border: 'none', boxShadow: 'none' }}
                                    bg={colorMode === 'dark' ? 'grey.600' : 'grey.50'}
                                />
                            </Box>
                            <Button
                                size="md"
                                bg={currentDarkTheme.primary}
                                color="white"
                                _hover={{ bg: currentDarkTheme.primary500 }}
                                onClick={handleQuestionSubmit}
                            >
                                <Icon as={Send} boxSize={4} />
                            </Button>
                        </HStack>
                        {showResponses && (
                            <>
                                <Text fontSize="sm" fontWeight="semibold" color={colorMode === 'dark' ? 'white' : 'grey.900'} textAlign="center">
                                    Which one do you prefer?
                                </Text>
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="100%">
                                    {llmOptions.map((llm) => (
                                        <Box
                                            key={llm.id}
                                            p={4}
                                            bg={selectedLLM === llm.id
                                                ? (colorMode === 'dark' ? 'grey.700' : 'grey.50')
                                                : (colorMode === 'dark' ? 'grey.800' : 'white')
                                            }
                                            borderRadius="12px"
                                            border={`2px solid ${selectedLLM === llm.id ? currentDarkTheme.primary : (colorMode === 'dark' ? 'grey.600' : 'grey.300')}`}
                                            cursor="pointer"
                                            onClick={() => handleSelect(llm.id)}
                                            _hover={{
                                                borderColor: currentDarkTheme.primary,
                                                bg: colorMode === 'dark' ? 'grey.700' : 'grey.50',
                                            }}
                                            transition="all 0.2s"
                                            position="relative"
                                        >
                                            {selectedLLM === llm.id && (
                                                <Box
                                                    position="absolute"
                                                    top={-2}
                                                    right={-2}
                                                    bg={currentDarkTheme.primary}
                                                    borderRadius="full"
                                                    p={1}
                                                >
                                                    <Icon as={CheckCircle2} boxSize={4} color="white" />
                                                </Box>
                                            )}
                                            <VStack align="start" spacing={2} mb={3}>
                                                <HStack spacing={2}>
                                                    <Icon as={Sparkles} boxSize={4} color={currentDarkTheme.primary} />
                                                    <Text fontSize="xs" fontWeight="semibold" color={currentDarkTheme.primary}>
                                                        {llm.label}
                                                    </Text>
                                                </HStack>
                                                <Text fontSize="xs" color={colorMode === 'dark' ? 'grey.400' : 'grey.500'}>
                                                    {llm.description}
                                                </Text>
                                            </VStack>
                                            <Text
                                                fontSize="sm"
                                                color={colorMode === 'dark' ? 'grey.200' : 'grey.700'}
                                                lineHeight="1.6"
                                            >
                                                {llm.response}
                                            </Text>
                                        </Box>
                                    ))}
                                </SimpleGrid>
                                {selectedLLM && (
                                    <Box
                                        p={3}
                                        bg={colorMode === 'dark' ? 'grey.700' : 'grey.50'}
                                        borderRadius="8px"
                                        border={`1px solid ${currentDarkTheme.primary}`}
                                    >
                                        <HStack spacing={2} justify="center">
                                            <Icon as={CheckCircle2} boxSize={4} color={currentDarkTheme.primary} />
                                            <Text fontSize="sm" color={colorMode === 'dark' ? 'white' : 'grey.900'}>
                                                You selected: {llmOptions.find(llm => llm.id === selectedLLM)?.label}
                                            </Text>
                                        </HStack>
                                    </Box>
                                )}
                            </>
                        )}
                    </VStack>
                </Box>
            </Stack>
        </chakra.form>
    );
};

