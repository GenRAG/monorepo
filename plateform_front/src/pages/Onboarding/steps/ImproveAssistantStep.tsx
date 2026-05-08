import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import {
    HStack,
    Stack,
    Heading,
    VStack,
    useColorMode,
    chakra,
} from "@chakra-ui/react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import { useForm } from "react-hook-form";
import { useChat } from "hooks/useChat";
import { ChatInterface } from "components/System/Molecules/ChatInterface";
import StepLevel from "components/System/Molecules/StepLevel";
import useUploadDocuments, { Status } from "hooks/useUploadDocuments";
import useDragDrop from "hooks/useDragDrop";
import { useOnboarding } from "hooks/useOnBoarding";
import { useAppResponsive } from "hooks/useAppResponsive";
import UploadProgressStepper from "components/Onboarding/ImproveAssistant/UploadProgressStepper";
import DocumentDropZone from "components/Onboarding/ImproveAssistant/DocumentDropZone";
import DocumentFileList from "components/Onboarding/ImproveAssistant/DocumentFileList";
import "../onboardingAnimations.css";

interface ImproveAssistantFormData {
    documentsUploaded: boolean;
    improvedResponse: string[];
}

export const ImproveAssistantStepComponent: React.FC<StepComponentProps> = ({
    data,
    registerValidateAndGoNext,
    goNext,
}) => {
    const { colorMode } = useColorMode();
    const isMobile = useAppResponsive({ base: true, lg: false });
    const { workspaceId, agentId } = useOnboarding();

    const [showComparison, setShowComparison] = useState(
        data.documentsUploaded || false,
    );
    const { uploadDocuments, sources } = useUploadDocuments(
        workspaceId,
        agentId,
    );

    const beforeResponse = useMemo(
        () => [
            "According to the Syntec collective agreement, you are entitled to 25 paid vacation days per year.",
        ],
        [],
    );
    const afterResponse = useMemo(
        () => [
            "According to your collective agreement and internal regulations, you are entitled to 27 paid vacation days per year, including 2 additional days granted by your company.",
        ],
        [],
    );

    const completedFiles = sources.filter((s) => s.status === Status.COMPLETED);
    const processingFiles = sources.filter(
        (s) => s.status === Status.PROCESSING,
    );

    const getResponse = useCallback(
        (): string[] | { response: string[]; isImproved?: boolean } => ({
            response:
                showComparison && completedFiles.length > 0
                    ? afterResponse
                    : beforeResponse,
            isImproved: showComparison && completedFiles.length > 0,
        }),
        [showComparison, completedFiles.length, afterResponse, beforeResponse],
    );

    const { messages, sendMessage, isLoading } = useChat({ getResponse });

    const { trigger, setValue } = useForm<ImproveAssistantFormData>({
        defaultValues: {
            documentsUploaded: data.documentsUploaded || false,
            improvedResponse: data.improvedResponse || "",
        },
        mode: "onChange",
    });

    const goNextRef = useRef(goNext);
    goNextRef.current = goNext;
    const triggerRef = useRef(trigger);
    triggerRef.current = trigger;

    useEffect(() => {
        if (!registerValidateAndGoNext) return;
        registerValidateAndGoNext(async () => {
            if (await triggerRef.current()) goNextRef.current();
        });
    }, [registerValidateAndGoNext]);

    const handleFileUpload = async (files: FileList | null) => {
        if (!files) return;
        await uploadDocuments(files);
        setTimeout(async () => {
            setShowComparison(true);
            setValue("documentsUploaded", true);
            setValue("improvedResponse", afterResponse);
            await trigger();
        }, 0);
    };

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
        useDragDrop((e: React.DragEvent) =>
            handleFileUpload(e.dataTransfer.files),
        );

    return (
        <chakra.form w="100%" h="100%">
            <Stack w="100%" h="100%" spacing={8}>
                <VStack align="start" spacing={2} w="100%">
                    <Heading
                        variant={isMobile ? "heading-lg" : "heading-2xl"}
                        fontWeight="bold"
                        color={colorMode === "dark" ? "white" : "grey.900"}
                    >
                        Improve your assistant with your documents
                    </Heading>
                </VStack>

                <StepLevel
                    level={showComparison ? 3 : 2}
                    title={
                        showComparison
                            ? "Personalized"
                            : "En cours de personnalisation"
                    }
                    description="Ton assistant est en train d'être personnalisé avec les documents que tu as ajoutés"
                />

                <HStack
                    flexDirection={isMobile ? "column" : "row"}
                    w="100%"
                    h="100%"
                    spacing={8}
                    align="start"
                >
                    <VStack flex={1} w="100%" spacing={4}>
                        <UploadProgressStepper
                            completedFilesCount={completedFiles.length}
                            isProcessing={processingFiles.length > 0}
                            showComparison={showComparison}
                        />
                        <DocumentDropZone
                            isDragging={isDragging}
                            onFileSelect={handleFileUpload}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        />
                        <DocumentFileList sources={sources} />
                    </VStack>

                    <Stack
                        flex={1}
                        minH={0}
                        display="flex"
                        flexDirection="column"
                        h="100%"
                    >
                        <ChatInterface
                            fullHeight={!isMobile}
                            compact={!isMobile}
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
