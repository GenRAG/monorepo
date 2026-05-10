import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { HStack, Stack, VStack, chakra } from "@chakra-ui/react";
import { Upload } from "lucide-react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import { useForm } from "react-hook-form";
import { ChatInterface } from "components/System/Molecules/ChatInterface";
import StepLevel from "components/System/Molecules/StepLevel";
import useUploadDocuments, { Status } from "hooks/useUploadDocuments";
import useDragDrop from "hooks/useDragDrop";
import { useOnboarding } from "hooks/useOnBoarding";
import { useAppResponsive } from "hooks/useAppResponsive";
import UploadProgressStepper from "components/Onboarding/ImproveAssistant/UploadProgressStepper";
import DocumentDropZone from "components/Onboarding/ImproveAssistant/DocumentDropZone";
import DocumentFileList from "components/Onboarding/ImproveAssistant/DocumentFileList";

interface ImproveAssistantFormData {
    documentsUploaded: boolean;
    improvedResponse: string[];
}

export const ImproveAssistantStepComponent: React.FC<StepComponentProps> = ({
    data,
    registerValidateAndGoNext,
    goNext,
}) => {
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
        () => ({
            response:
                showComparison && completedFiles.length > 0
                    ? afterResponse
                    : beforeResponse,
        }),
        [showComparison, completedFiles.length, afterResponse, beforeResponse],
    );

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
                    <VStack flex={1} w="100%" h="100%" spacing={4}>
                        <DocumentDropZone
                            isDragging={isDragging}
                            onFileSelect={handleFileUpload}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        />
                        <UploadProgressStepper
                            completedFilesCount={completedFiles.length}
                            isProcessing={processingFiles.length > 0}
                            showComparison={showComparison}
                        />
                        <DocumentFileList sources={sources} />
                    </VStack>

                    <Stack
                        flex={2}
                        minH={0}
                        display="flex"
                        flexDirection="column"
                        h="100%"
                    >
                        <ChatInterface
                            fullHeight={!isMobile}
                            compact={!isMobile}
                            getResponse={getResponse}
                            title={
                                showComparison
                                    ? "Assistant personnalisé prêt"
                                    : "Ajoute tes documents d'abord"
                            }
                            welcomeMessage={
                                showComparison
                                    ? "Pose une question pour voir la différence avec tes documents."
                                    : "Uploade tes fichiers RH à gauche pour activer les réponses personnalisées."
                            }
                            icon={showComparison ? undefined : Upload}
                            placeholder={
                                showComparison
                                    ? "Pose ta question..."
                                    : "Ajoutez des documents pour activer le chat"
                            }
                            disabled={!showComparison}
                        />
                    </Stack>
                </HStack>
            </Stack>
        </chakra.form>
    );
};
