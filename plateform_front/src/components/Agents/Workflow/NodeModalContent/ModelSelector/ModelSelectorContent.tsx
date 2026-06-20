import React, { memo, useState } from "react";
import { HStack, Spinner, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { useGetModelsGenerationQuery, useGetModelsRerankQuery } from "services/models/models";
import { RagModel } from "types/models/models";
import { ModelListPanel } from "./ModelListPanel";
import { ModelDetailPanel } from "./ModelDetailPanel";

interface Props {
    onSelect: (modelId: string) => void;
    fetchModels: () => ReturnType<typeof useGetModelsGenerationQuery | typeof useGetModelsRerankQuery>;
}

export const ModelSelectorContent: React.FC<Props> = memo(({ onSelect, fetchModels }: Props) => {
    const { data: models = [], isLoading, isError } = fetchModels();
    const [selectedModel, setSelectedModel] = useState<RagModel | null>(null);
    const subColor = useColorModeValue("grey.500", "grey.400");

    if (isLoading) {
        return (
            <VStack flex={1} align="center" justify="center" spacing={2}>
                <Spinner size="sm" color="green.500" />
                <Text fontSize="12px" color={subColor}>
                    Chargement des modèles...
                </Text>
            </VStack>
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
