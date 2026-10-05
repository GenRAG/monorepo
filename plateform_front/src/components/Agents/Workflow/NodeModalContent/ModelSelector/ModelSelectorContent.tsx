import React, { memo, useEffect, useState } from "react";
import { HStack, Skeleton, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { useGetModelsGenerationQuery, useGetModelsRerankQuery } from "services/models/models";
import { RagModel } from "types/models/models";
import { ModelListPanel } from "./ModelListPanel";
import { ModelDetailPanel } from "./ModelDetailPanel";
import { ModelDetailPanelSkeleton } from "./ModelDetailHelpers";

interface Props {
    onSelect: (modelId: string) => void;
    fetchModels: () => ReturnType<typeof useGetModelsGenerationQuery | typeof useGetModelsRerankQuery>;
    currentModelId?: string;
}

export const ModelSelectorContent: React.FC<Props> = memo(({ onSelect, fetchModels, currentModelId }: Props) => {
    const { data: models = [], isLoading, isError } = fetchModels();
    const [selectedModel, setSelectedModel] = useState<RagModel | null>(null);
    const subColor = useColorModeValue("grey.500", "grey.400");

    useEffect(() => {
        if (!currentModelId || models.length === 0) return;
        const current = models.find((m: RagModel) => m.id === currentModelId);
        if (current) setSelectedModel(current);
    }, [models, currentModelId]);

    if (isLoading) {
        return (
            <HStack flex={1} align="stretch" spacing={0} overflow="hidden">
                <VStack
                    align="stretch"
                    spacing={2}
                    w="200px"
                    flexShrink={0}
                    p={2}
                    bg="surfacePrimary"
                    borderRightWidth="1px"
                    borderRightStyle="solid"
                    borderRightColor="borderSubtle"
                >
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} h="48px" borderRadius="8px" />
                    ))}
                </VStack>
                <ModelDetailPanelSkeleton />
            </HStack>
        );
    }

    if (isError || models.length === 0) {
        return (
            <VStack flex={1} align="center" justify="center">
                <Text fontSize="12px" color={subColor}>
                    {isError ? "Impossible de charger les modèles." : "Aucun modèle disponible."}
                </Text>
            </VStack>
        );
    }

    return (
        <HStack flex={1} align="stretch" spacing={0} overflow="hidden">
            <ModelListPanel models={models} selectedModel={selectedModel} onSelect={setSelectedModel} />
            <ModelDetailPanel model={selectedModel} onConfirm={onSelect} />
        </HStack>
    );
});

ModelSelectorContent.displayName = "ModelSelectorContent";
