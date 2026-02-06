import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
    Progress,
    SimpleGrid,
    Stepper,
    Step,
    StepIndicator,
    StepStatus,
    StepTitle,
    StepDescription,
    StepSeparator,
    useSteps,
} from '@chakra-ui/react';
import { StepComponentProps } from 'pages/Onboarding/OnBoardingProvider';
import { currentDarkTheme } from 'themeNew/foundations/themeConfig';
import { Upload, CheckCircle2, FileText, ArrowRight, Check, Sparkles, Loader2 } from 'lucide-react';
import Button from 'components/Atoms/Button';
import { useForm } from 'react-hook-form';
import { useChat } from '../../../hooks/useChat';
import { ChatInterface } from '../../../components/Molecules/ChatInterface';
import StepLevel from 'components/Molecules/StepLevel';
import '../onboardingAnimations.css';

interface ImproveAssistantFormData {
    documentsUploaded: boolean;
    improvedResponse: string[];
}

export const ImproveAssistantStepComponent: React.FC<StepComponentProps> = ({
    data,
    updateData,
    registerValidateAndGoNext,
    goNext,
}) => {
    const { colorMode } = useColorMode();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; status: 'processing' | 'completed' }>>([]);
    const [showComparison, setShowComparison] = useState(data.documentsUploaded || false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const testQuestion = data.testQuestion || "How many paid vacation days do I have?";
    const beforeResponse = ["According to the Syntec collective agreement, you are entitled to 25 paid vacation days per year."];
    const afterResponse = ["According to your collective agreement and internal regulations, you are entitled to 27 paid vacation days per year, including 2 additional days granted by your company."];

    const completedFiles = uploadedFiles.filter((f) => f.status === 'completed');
    const processingFiles = uploadedFiles.filter((f) => f.status === 'processing');
    const isProcessing = processingFiles.length > 0;

    const getResponse = useCallback((question: string): string[] | { response: string[]; isImproved?: boolean } => {
        const isImproved = showComparison && completedFiles.length > 0;
        return {
            response: isImproved ? afterResponse : beforeResponse,
            isImproved,
        };
    }, [showComparison, completedFiles.length, afterResponse, beforeResponse]);

    const { messages, sendMessage, isLoading } = useChat({
        getResponse,
    });

    const {
        watch,
        trigger,
        setValue,
        formState: { errors },
    } = useForm<ImproveAssistantFormData>({
        defaultValues: {
            documentsUploaded: data.documentsUploaded || false,
            improvedResponse: data.improvedResponse || '',
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

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files).map((file) => ({
            name: file.name,
            status: 'processing' as const,
        }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);

        newFiles.forEach((file, index) => {
            setTimeout(() => {
                setUploadedFiles((prev) =>
                    prev.map((f, i) =>
                        i === prev.length - newFiles.length + index
                            ? { ...f, status: 'completed' as const }
                            : f
                    )
                );
            }, 2000 + index * 500);
        });

        setTimeout(() => {
            setShowComparison(true);
            setValue('documentsUploaded', true);
            setValue('improvedResponse', afterResponse);
            trigger();
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const steps = useMemo(() => [
        {
            title: 'Add your documents',
            description: 'Your documents are being processed and indexed.',
            isCompleted: completedFiles.length > 0,
            icon: FileText,
        },
        {
            title: 'Documents are being processed',
            description: 'Your assistant is now using your documents to answer questions.',
            isCompleted: showComparison,
            icon: Sparkles,
        },
    ], [completedFiles.length, showComparison]);

    const activeStepIndex = useMemo(() => {
        if (showComparison && completedFiles.length > 0) {
            return 2;
        }
        if (completedFiles.length > 0) {
            return 1;
        }
        return 0;
    }, [showComparison, completedFiles.length]);

    console.log(activeStepIndex);

    return (
        <chakra.form w="100%">
            <Stack w="100%" spacing={8}>
                <VStack align="start" spacing={2} w="100%">
                    <Heading
                        variant="heading-2xl"
                        fontWeight="bold"
                        color={colorMode === 'dark' ? 'white' : 'grey.900'}
                    >
                        Improve your assistant with your documents
                    </Heading>
                    <Text color={colorMode === 'dark' ? 'grey.400' : 'grey.600'} variant="body-xl">
                        Now, make it truly tailored to your company
                    </Text>
                </VStack>
                <StepLevel
                    level={showComparison ? 3 : completedFiles.length > 0 ? 2 : 1}
                    title={showComparison ? 'Personalized' : completedFiles.length > 0 ? 'In progress' : 'Demo'}
                    description="Your assistant is now using your documents to answer questions."
                />
                <HStack w="100%" spacing={8} align="start">
                    <VStack flex={1}>
                        <VStack spacing={4} w="100%">
                            <Box
                                w="100%"
                                p={4}
                                bg={colorMode === 'dark' ? 'grey.700' : 'white'}
                                borderRadius="12px"
                                mb="4px"
                                border={`1px solid ${colorMode === 'dark' ? 'grey.600' : '#E7E7E7'}`}
                            >
                                <Stepper
                                    index={activeStepIndex}
                                    orientation="vertical"
                                    gap={0}
                                    w="100%"
                                    h="120px"
                                    colorScheme={colorMode === 'dark' ? currentDarkTheme.colorScheme : currentDarkTheme.colorScheme}
                                    variant={colorMode === 'dark' ? 'solid' : 'solid'}
                                >
                                    {steps.map((step, index) => (
                                        <Step key={index}>
                                            <StepIndicator
                                                flexShrink={0}
                                                border={index < activeStepIndex || index === activeStepIndex ? 'none' : '1px solid #E7E7E7'}
                                                bg={index <= activeStepIndex ? colorMode === 'dark' ? currentDarkTheme.primary : currentDarkTheme.primary : colorMode === 'dark' ? 'rgba(255, 255, 255, 1)' : 'white'}
                                            >
                                                <StepStatus
                                                    complete={
                                                        <Box
                                                            bg={currentDarkTheme.primary}
                                                            borderRadius="full"
                                                            w="28px"
                                                            h="28px"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                        >
                                                            <Icon
                                                                as={Check}
                                                                color="white"
                                                                boxSize={4}
                                                            />
                                                        </Box>
                                                    }
                                                    incomplete={
                                                        index === 1 && isProcessing ? (
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                w="28px"
                                                                h="28px"
                                                            >
                                                                <Icon
                                                                    as={Loader2}
                                                                    color={currentDarkTheme.primary}
                                                                    boxSize={4}
                                                                    className="spinning"
                                                                />
                                                            </Box>
                                                        ) : (
                                                            <Icon as={step.icon} color={colorMode === 'dark' ? 'grey.500' : 'grey.400'} boxSize={4} />
                                                        )
                                                    }
                                                    active={
                                                        index === 1 && isProcessing ? (
                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                w="28px"
                                                                h="28px"
                                                            >
                                                                <Icon
                                                                    as={Loader2}
                                                                    color="white"
                                                                    boxSize={4}
                                                                    className="spinning"
                                                                />
                                                            </Box>
                                                        ) : (
                                                            <Icon as={step.icon} color={colorMode === 'dark' ? 'white' : 'white'} boxSize={4} />
                                                        )
                                                    }
                                                />
                                            </StepIndicator>
                                            <Box flex={1} ml={4} minW={0}>
                                                <StepTitle>
                                                    <Text
                                                        fontWeight="semibold"
                                                        color={
                                                            index < activeStepIndex || index === activeStepIndex
                                                                ? (colorMode === 'dark' ? 'white' : 'grey.900')
                                                                : (colorMode === 'dark' ? 'grey.400' : 'grey.600')
                                                        }
                                                        fontSize="sm"
                                                    >
                                                        {step.title}
                                                    </Text>
                                                </StepTitle>
                                                <StepDescription>
                                                    <Text
                                                        fontSize="xs"
                                                        color={colorMode === 'dark' ? 'grey.400' : 'grey.600'}
                                                        mt={1}
                                                    >
                                                        {step.description}
                                                    </Text>
                                                </StepDescription>
                                            </Box>
                                            <StepSeparator
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    borderLeft: showComparison && completedFiles.length > 0
                                                        ? `2px solid ${currentDarkTheme.primary}`
                                                        : `2px dashed ${colorMode === 'dark' ? currentDarkTheme.rgba.primary30 : '#D1D5DB'}`,
                                                    transition: 'all 0.3s ease-in-out',
                                                }}
                                            />
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>
                        </VStack>
                        <Box
                            w="100%"
                            border={`2px dashed ${isDragging ? currentDarkTheme.primary : (colorMode === 'dark' ? 'grey' : 'grey')}`}
                            borderRadius="12px"
                            p={8}
                            bg={colorMode === 'dark' ? 'grey.700' : 'grey.50'}
                            textAlign="center"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            cursor="pointer"
                            _hover={{
                                borderColor: currentDarkTheme.primary,
                                bg: colorMode === 'dark' ? 'grey.600' : 'grey.100',
                            }}
                            transition="all 0.2s"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.docx,.txt,.png"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e.target.files)}
                            />
                            <VStack spacing={3}>
                                <Icon as={Upload} boxSize={10} color={currentDarkTheme.primary} />
                                <Text fontWeight="semibold" color={colorMode === 'dark' ? 'white' : 'grey.900'}>
                                    Add your internal regulations, collective agreement, or HR PDF
                                </Text>
                                <Text fontSize="sm" color={colorMode === 'dark' ? 'grey.400' : 'grey.600'}>
                                    Drag & drop or click to select
                                </Text>
                            </VStack>
                        </Box>

                        {uploadedFiles.length > 0 && (
                            <VStack align="start" w="100%" spacing={2} mt="4px">
                                <Text fontWeight="semibold" color={colorMode === 'dark' ? 'white' : 'grey.900'}>
                                    Added files
                                </Text>
                                {uploadedFiles.map((file, index) => (
                                    <Box
                                        key={index}
                                        w="100%"
                                        p={3}
                                        border={`1px solid ${colorMode === 'dark' ? 'grey.600' : 'grey.300'}`}
                                        borderRadius="8px"
                                        bg={colorMode === 'dark' ? 'grey.700' : 'grey.50'}
                                    >
                                        <HStack spacing={3}>
                                            <Icon
                                                as={file.status === 'completed' ? CheckCircle2 : FileText}
                                                boxSize={4}
                                                color={file.status === 'completed' ? 'green.500' : currentDarkTheme.primary}
                                            />
                                            <Text fontSize="sm" color={colorMode === 'dark' ? 'white' : 'grey.900'}>
                                                {file.name}
                                            </Text>
                                            {file.status === 'processing' && (
                                                <Progress
                                                    value={50}
                                                    colorScheme={colorMode === 'dark' ? 'green' : 'blue'}
                                                    size="sm"
                                                    borderRadius="999px"
                                                    flex={1}
                                                />
                                            )}
                                        </HStack>
                                    </Box>
                                ))}
                            </VStack>
                        )}
                    </VStack>
                    <Stack flex={1}>
                        <ChatInterface
                            fullHeight
                            messages={messages}
                            onSendMessage={sendMessage}
                            isLoading={isLoading}
                            placeholder="Ask your question..."
                            welcomeMessage={
                                showComparison
                                    ? "Hello! I now have access to your personalized documents. Ask me a question to see the difference!"
                                    : "Add your documents to improve your assistant"
                            }
                            disabled={!showComparison}
                        />
                    </Stack>
                </HStack>
            </Stack>
        </chakra.form>
    );
};

