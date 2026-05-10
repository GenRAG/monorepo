import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChatMessage } from "hooks/useChat";
import { HStack, Stack, VStack, chakra } from "@chakra-ui/react";
import { Upload } from "lucide-react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import { ChatInterface } from "components/System/Molecules/ChatInterface";
import StepLevel from "components/System/Molecules/StepLevel";
import useUploadDocuments, { Status } from "hooks/useUploadDocuments";
import useDragDrop from "hooks/useDragDrop";
import { useOnboarding } from "hooks/useOnBoarding";
import { useAppResponsive } from "hooks/useAppResponsive";
import UploadProgressStepper from "components/Onboarding/ImproveAssistant/UploadProgressStepper";
import DocumentDropZone from "components/Onboarding/ImproveAssistant/DocumentDropZone";
import DocumentFileList from "components/Onboarding/ImproveAssistant/DocumentFileList";

const MAX_FILES = 3;

export const ImproveAssistantStepComponent: React.FC<StepComponentProps> = ({
    data,
    updateData,
    registerValidateAndGoNext,
    goNext,
}) => {
    const isMobile = useAppResponsive({ base: true, lg: false });
    const { workspaceId, agentId } = useOnboarding();

    const savedMessages: ChatMessage[] = data.messages ?? [];

    const { uploadDocuments, sources, isAtMaxFiles } = useUploadDocuments(
        workspaceId,
        agentId,
        MAX_FILES,
    );

    const completedFiles = sources.filter((s) => s.status === Status.COMPLETED);
    const processingFiles = sources.filter(
        (s) => s.status === Status.PROCESSING || s.status === Status.UPLOADING,
    );

    // Chat is enabled only when at least one file is fully indexed
    const showComparison = completedFiles.length > 0;

    const beforeResponse = useMemo(
        () => [
            "Selon la convention Syntec, vous avez droit à 25 jours de congés payés par an.",
        ],
        [],
    );
    const afterResponse = useMemo(
        () => [
            "Selon votre convention collective et votre règlement intérieur, vous bénéficiez de 27 jours de congés payés par an, dont 2 jours supplémentaires accordés par votre entreprise.",
        ],
        [],
    );

    const getResponse = useCallback(
        () => ({
            response: showComparison ? afterResponse : beforeResponse,
        }),
        [showComparison, afterResponse, beforeResponse],
    );

    // Keep validation data in sync
    useEffect(() => {
        updateData({
            fileCount: completedFiles.length,
        });
    }, [completedFiles.length, updateData]);

    useEffect(() => {
        if (!registerValidateAndGoNext) return;
        registerValidateAndGoNext(async () => goNext());
    }, [registerValidateAndGoNext, goNext]);

    const handleMessagesChange = useCallback(
        (msgs: ChatMessage[]) => {
            updateData({ messages: msgs, messageCount: msgs.length });
        },
        [updateData],
    );

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || isAtMaxFiles) return;
        await uploadDocuments(files);
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
                            ? "Personnalisé"
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
                            onFileSelect={
                                isAtMaxFiles ? undefined : handleFileUpload
                            }
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            disabled={isAtMaxFiles}
                            maxFiles={MAX_FILES}
                            currentCount={
                                sources.filter((s) => s.status !== Status.ERROR)
                                    .length
                            }
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
                            onMessagesChange={handleMessagesChange}
                            initialMessages={savedMessages}
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
                                    : "Indexation en cours..."
                            }
                            disabled={!showComparison}
                        />
                    </Stack>
                </HStack>
            </Stack>
        </chakra.form>
    );
};
