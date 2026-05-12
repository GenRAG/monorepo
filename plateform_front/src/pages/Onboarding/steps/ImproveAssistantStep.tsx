import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
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
import { useAgentQuery } from "hooks/useAgentQuery";
import UploadProgressStepper from "components/Onboarding/ImproveAssistant/UploadProgressStepper";
import DocumentDropZone from "components/Onboarding/ImproveAssistant/DocumentDropZone";
import DocumentFileList from "components/Onboarding/ImproveAssistant/DocumentFileList";
import { useGetAgentDocumentStatsQuery } from "services/document/document";
import { useUpdateOnboardingStepsDataMutation } from "services/onboarding/onboarding";
import OnboardingStepBanner from "components/System/Molecules/OnboardingStepBanner";

const MAX_FILES = 3;
const MAX_EXCHANGES = 5;
const STEP_ID = "improve-assistant";

export const ImproveAssistantStepComponent: React.FC<StepComponentProps> = ({ data, updateData }) => {
    const isMobile = useAppResponsive({ base: true, lg: false });
    const { workspaceId, agentId } = useOnboarding();
    const [updateStepsData] = useUpdateOnboardingStepsDataMutation();
    const onboardingStreamUrl = `${process.env.REACT_APP_BACKEND_URL ?? ""}/workspaces/${workspaceId}/onboarding/stream`;
    const { sendQuery } = useAgentQuery(workspaceId, agentId, false, onboardingStreamUrl, "improve-assistant");

    const savedMessages: ChatMessage[] = (data.messages as ChatMessage[]) ?? [];
    const persistedMessageCount: number = (data.messageCount as number) ?? savedMessages.length;
    const sessionQueryCount = (data.queryCount as number) ?? 0;
    const liveMessageCount: number = Math.max(sessionQueryCount, (data.messageCount as number) ?? savedMessages.length);
    const isAtLimit = liveMessageCount >= MAX_EXCHANGES;

    const { data: documentStats } = useGetAgentDocumentStatsQuery(
        { workspaceId: workspaceId!, agentId: agentId! },
        { skip: !workspaceId || !agentId },
    );
    const [persistedIndexedCount, setPersistedIndexedCount] = useState(0);
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!hasInitialized.current && documentStats !== undefined) {
            hasInitialized.current = true;
            setPersistedIndexedCount(documentStats.indexed);
        }
    }, [documentStats]);

    const { uploadDocuments, sources, isAtMaxFiles } = useUploadDocuments(
        workspaceId,
        agentId,
        MAX_FILES,
        persistedIndexedCount,
    );

    const completedFiles = useMemo(() => sources.filter((s) => s.status === Status.COMPLETED), [sources]);
    const processingFiles = useMemo(
        () => sources.filter((s) => s.status === Status.PROCESSING || s.status === Status.UPLOADING),
        [sources],
    );
    const sessionValidCount = useMemo(() => sources.filter((s) => s.status !== Status.ERROR).length, [sources]);

    const totalCompletedCount = persistedIndexedCount + completedFiles.length;
    const showComparison = totalCompletedCount > 0;

    const getResponse = useCallback(
        async (question: string, onChunk: (partialText: string) => void) => {
            const fullText = await sendQuery(question, onChunk);
            return { response: [fullText] };
        },
        [sendQuery],
    );

    useEffect(() => {
        updateData({ fileCount: totalCompletedCount });
    }, [totalCompletedCount, updateData]);

    const handleMessagesChange = useCallback(
        (msgs: ChatMessage[]) => {
            updateData({ messages: msgs, messageCount: Math.max(msgs.length, persistedMessageCount) });

            if (msgs.length > persistedMessageCount) {
                void updateStepsData({
                    workspaceId,
                    stepId: STEP_ID,
                    data: { messageCount: msgs.length },
                });
            }
        },
        [updateData, updateStepsData, workspaceId, persistedMessageCount],
    );

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || isAtMaxFiles) return;
        await uploadDocuments(files);
    };

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useDragDrop((e: React.DragEvent) =>
        handleFileUpload(e.dataTransfer.files),
    );

    return (
        <chakra.form w="100%" h="100%" display="flex" flexDirection="column">
            <Stack w="100%" flex={1} minH={0} spacing={8} display="flex" flexDirection="column">
                <StepLevel
                    level={showComparison ? 3 : 2}
                    title={showComparison ? "Personnalisé" : "En cours de personnalisation"}
                    description="Ton assistant est en train d'être personnalisé avec les documents que tu as ajoutés"
                />

                <HStack
                    flexDirection={isMobile ? "column" : "row"}
                    w="100%"
                    flex={1}
                    minH={0}
                    spacing={8}
                    align="start"
                >
                    <VStack flex={1} w="100%" spacing={4} align="stretch" h="100%">
                        <DocumentDropZone
                            isDragging={isDragging}
                            onFileSelect={isAtMaxFiles ? undefined : handleFileUpload}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            disabled={isAtMaxFiles}
                            maxFiles={MAX_FILES}
                            currentCount={persistedIndexedCount + sessionValidCount}
                        />
                        <UploadProgressStepper
                            completedFilesCount={totalCompletedCount}
                            isProcessing={processingFiles.length > 0}
                            showComparison={showComparison}
                        />
                        <DocumentFileList sources={sources} />
                    </VStack>

                    <Stack flex={2} minH={0} h="100%" display="flex" flexDirection="column" gap={2} overflow="hidden">
                        <OnboardingStepBanner current={liveMessageCount} max={MAX_EXCHANGES} mb={0} />
                        <ChatInterface
                            fullHeight={!isMobile}
                            compact={!isMobile}
                            getResponse={getResponse}
                            onMessagesChange={handleMessagesChange}
                            initialMessages={savedMessages}
                            title={showComparison ? "Assistant personnalisé prêt" : "Ajoute tes documents d'abord"}
                            welcomeMessage={
                                showComparison
                                    ? "Pose une question pour voir la différence avec tes documents."
                                    : "Uploade tes fichiers RH à gauche pour activer les réponses personnalisées."
                            }
                            icon={showComparison ? undefined : Upload}
                            placeholder={showComparison ? "Pose ta question..." : "Indexation en cours..."}
                            disabled={!showComparison || isAtLimit}
                            disabledMessage={
                                isAtLimit
                                    ? `Limite atteinte (${MAX_EXCHANGES}/${MAX_EXCHANGES}) — passez à l'étape suivante`
                                    : undefined
                            }
                        />
                    </Stack>
                </HStack>
            </Stack>
        </chakra.form>
    );
};
