import { useReactFlow, useStore, type ReactFlowState } from "@xyflow/react";
import { Box, HStack, Icon, Spinner, Text, Textarea, VStack, useColorModeValue } from "@chakra-ui/react";
import { Check } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { List, type RowComponentProps } from "react-window";
import { TaskType } from "@genrag/workflow";
import type { AppNodeData } from "@genrag/workflow";
import { useGetModelsGenerationQuery, useGetModelsRerankQuery } from "services/models/models";
import { RagModel } from "types/models/models";

interface NodeSettingsEditorProps {
    mainNodeId: string;
    onSettingSelect: (nodeId: string, item: string) => void;
}

// Minimal view of a settings node — excludes position so that dragging nodes
// (which mutates the flow store at 60fps) does not re-render this editor.
interface SettingsNodeView {
    id: string;
    type: TaskType;
    settingLabel?: string;
    modelName?: string;
    stringValue?: string;
}

const selectSettingsViews = (state: ReactFlowState, mainNodeId: string): SettingsNodeView[] => {
    const views: SettingsNodeView[] = [];
    for (const edge of state.edges) {
        if (edge.source !== mainNodeId || edge.type !== "settings") continue;
        const node = state.nodeLookup.get(edge.target);
        if (!node) continue;
        const data = node.data as AppNodeData;
        views.push({
            id: node.id,
            type: data.type,
            settingLabel: data.settingLabel,
            modelName: data.modelName,
            stringValue: data.stringValue,
        });
    }
    return views;
};

const areViewsEqual = (a: SettingsNodeView[], b: SettingsNodeView[]) =>
    a.length === b.length &&
    a.every((x, i) => {
        const y = b[i];
        return (
            x.id === y.id &&
            x.type === y.type &&
            x.settingLabel === y.settingLabel &&
            x.modelName === y.modelName &&
            x.stringValue === y.stringValue
        );
    });

const CARD_HEIGHT = 104;
const ROW_HEIGHT = CARD_HEIGHT + 8;

const ModelPickerCard = memo(
    ({ model, isSelected, onSelect }: { model: RagModel; isSelected: boolean; onSelect: () => void }) => {
        const defaultBg = useColorModeValue("white", "grey.800");
        const selectedBg = useColorModeValue("green.50", "rgba(52,211,153,0.08)");
        const defaultBorder = useColorModeValue("grey.200", "grey.700");
        const labelColor = useColorModeValue("grey.800", "grey.100");
        const subColor = useColorModeValue("grey.500", "grey.400");
        const priceColor = useColorModeValue("grey.400", "grey.500");
        const providerColor = useColorModeValue("grey.400", "grey.500");

        const hasPrice = model.pricing?.prompt || model.pricing?.completion;

        return (
            <Box
                as="button"
                w="100%"
                h={`${CARD_HEIGHT}px`}
                textAlign="left"
                overflow="hidden"
                bg={isSelected ? selectedBg : defaultBg}
                borderWidth="1px"
                borderStyle="solid"
                borderColor={isSelected ? "green.400" : defaultBorder}
                borderRadius="10px"
                p={3}
                cursor="pointer"
                transition="all 0.15s ease"
                _hover={{
                    bg: selectedBg,
                    borderColor: "green.400",
                    boxShadow: "0 4px 12px rgba(52,211,169,0.1)",
                }}
                onClick={onSelect}
            >
                <VStack align="stretch" spacing={1.5}>
                    <HStack justify="space-between" align="center">
                        <HStack spacing={1.5} align="baseline" minW={0}>
                            <Text
                                fontSize="13px"
                                fontWeight={700}
                                color={labelColor}
                                letterSpacing="-0.01em"
                                isTruncated
                            >
                                {model.name}
                            </Text>
                            {model.provider && (
                                <Text fontSize="10px" color={providerColor} flexShrink={0}>
                                    {model.provider}
                                </Text>
                            )}
                        </HStack>
                        {isSelected && <Icon as={Check} boxSize="14px" color="green.500" flexShrink={0} />}
                    </HStack>

                    {model.description && (
                        <Text fontSize="11px" color={subColor} lineHeight={1.4} noOfLines={2}>
                            {model.description}
                        </Text>
                    )}

                    {hasPrice && (
                        <HStack spacing={3} pt={0.5}>
                            {model.pricing?.prompt && (
                                <Text fontSize="10px" color={priceColor}>
                                    In{" "}
                                    <Box as="span" fontWeight={600} color={subColor}>
                                        {model.pricing.prompt}
                                    </Box>
                                    /1M
                                </Text>
                            )}
                            {model.pricing?.completion && (
                                <Text fontSize="10px" color={priceColor}>
                                    Out{" "}
                                    <Box as="span" fontWeight={600} color={subColor}>
                                        {model.pricing.completion}
                                    </Box>
                                    /1M
                                </Text>
                            )}
                        </HStack>
                    )}
                </VStack>
            </Box>
        );
    },
);

ModelPickerCard.displayName = "ModelPickerCard";

interface ModelRowData {
    models: RagModel[];
    selectedId?: string;
    onSelect: (modelId: string) => void;
}

const ModelRow = ({ index, style, models, selectedId, onSelect }: RowComponentProps<ModelRowData>) => {
    const model = models[index];
    return (
        <div style={style}>
            <Box pb={2}>
                <ModelPickerCard
                    model={model}
                    isSelected={model.id === selectedId}
                    onSelect={() => onSelect(model.id)}
                />
            </Box>
        </div>
    );
};

const InstructionEditor = ({ stringValue, onChange }: { stringValue?: string; onChange: (value: string) => void }) => {
    const [value, setValue] = useState(stringValue ?? "");
    const borderColor = useColorModeValue("grey.200", "grey.700");

    useEffect(() => {
        setValue(stringValue ?? "");
    }, [stringValue]);

    return (
        <Textarea
            value={value}
            onChange={(e) => {
                setValue(e.target.value);
                onChange(e.target.value);
            }}
            placeholder="Définissez le comportement de votre assistant..."
            rows={6}
            fontSize="13px"
            resize="vertical"
            borderRadius="10px"
            borderColor={borderColor}
            _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px var(--chakra-colors-green-400)" }}
        />
    );
};

export const NodeSettingsEditor = memo(({ mainNodeId, onSettingSelect }: NodeSettingsEditorProps) => {
    const { setNodes, getNode } = useReactFlow();
    const { data: generationModels = [], isLoading: isLoadingGeneration } = useGetModelsGenerationQuery();
    const { data: rerankModels = [], isLoading: isLoadingRerank } = useGetModelsRerankQuery();

    const mainNode = getNode(mainNodeId);
    const isReranker = mainNode?.data?.type === TaskType.RERANKER;
    const models = isReranker ? rerankModels : generationModels;
    const isLoadingModels = isReranker ? isLoadingRerank : isLoadingGeneration;

    const selector = useCallback((s: ReactFlowState) => selectSettingsViews(s, mainNodeId), [mainNodeId]);
    const settingsViews = useStore(selector, areViewsEqual);

    const sectionLabelColor = useColorModeValue("grey.500", "grey.400");
    const dividerColor = useColorModeValue("grey.100", "grey.700");
    const emptyColor = useColorModeValue("grey.400", "grey.600");

    const modelNodes = settingsViews.filter((v) => v.type === TaskType.MODEL);
    const instructionNodes = settingsViews.filter((v) => v.type === TaskType.INSTRUCTION);

    const handleInstructionChange = (nodeId: string, value: string) => {
        setNodes((prev) =>
            prev.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, stringValue: value, isPlaceholder: !value.trim() } } : n,
            ),
        );
    };

    if (modelNodes.length === 0 && instructionNodes.length === 0) {
        return (
            <Text fontSize="sm" color={emptyColor} fontStyle="italic">
                Aucun paramètre configurable.
            </Text>
        );
    }

    return (
        <VStack spacing={5} align="stretch" h="100%" minH={0}>
            {modelNodes.map((node) => {
                return (
                    <Box key={node.id} flex={1} minH={0} display="flex" flexDirection="column">
                        <Text
                            fontSize="10px"
                            fontWeight="700"
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            color={sectionLabelColor}
                            mb={3}
                            flexShrink={0}
                        >
                            {node.settingLabel ?? "Modèle"}
                        </Text>
                        {isLoadingModels ? (
                            <HStack justify="center" py={4}>
                                <Spinner size="sm" color="green.500" />
                            </HStack>
                        ) : (
                            <Box flex={1} minH={0}>
                                <List
                                    style={{ height: "100%" }}
                                    rowCount={models.length}
                                    rowHeight={ROW_HEIGHT}
                                    rowComponent={ModelRow}
                                    rowProps={{
                                        models,
                                        selectedId: node.modelName,
                                        onSelect: (modelId) => onSettingSelect(node.id, modelId),
                                    }}
                                    overscanCount={6}
                                />
                            </Box>
                        )}
                    </Box>
                );
            })}

            {modelNodes.length > 0 && instructionNodes.length > 0 && (
                <Box borderTopWidth="1px" borderStyle="solid" borderColor={dividerColor} flexShrink={0} />
            )}

            {instructionNodes.map((node) => (
                <Box key={node.id} flexShrink={0}>
                    <Text
                        fontSize="10px"
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                        color={sectionLabelColor}
                        mb={2}
                    >
                        Prompt Système
                    </Text>
                    <InstructionEditor
                        stringValue={node.stringValue}
                        onChange={(value) => handleInstructionChange(node.id, value)}
                    />
                </Box>
            ))}
        </VStack>
    );
});

NodeSettingsEditor.displayName = "NodeSettingsEditor";
