import { useEdges, useNodes, useReactFlow } from "@xyflow/react";
import { Box, HStack, Icon, Text, Textarea, VStack, useColorModeValue } from "@chakra-ui/react";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { TaskType } from "@genrag/workflow";
import type { AppNodeData, ModelOption } from "@genrag/workflow";
import type { Node } from "@xyflow/react";

interface NodeSettingsEditorProps {
    mainNodeId: string;
    onSettingSelect: (nodeId: string, item: string) => void;
}

const BADGE_LIGHT: Record<string, { bg: string; color: string }> = {
    smart: { bg: "purple.50", color: "purple.600" },
    fast: { bg: "blue.50", color: "blue.600" },
    balanced: { bg: "green.50", color: "green.600" },
    cheap: { bg: "orange.50", color: "orange.600" },
};

const BADGE_DARK: Record<string, { bg: string; color: string }> = {
    smart: { bg: "purple.900", color: "purple.300" },
    fast: { bg: "blue.900", color: "blue.300" },
    balanced: { bg: "green.900", color: "green.300" },
    cheap: { bg: "orange.900", color: "orange.300" },
};

const ModelPickerCard = ({
    model,
    isSelected,
    onSelect,
}: {
    model: ModelOption;
    isSelected: boolean;
    onSelect: () => void;
}) => {
    const defaultBg = useColorModeValue("white", "grey.800");
    const selectedBg = useColorModeValue("green.50", "rgba(52,211,153,0.08)");
    const defaultBorder = useColorModeValue("grey.200", "grey.700");
    const labelColor = useColorModeValue("grey.800", "grey.100");
    const subColor = useColorModeValue("grey.500", "grey.400");
    const priceColor = useColorModeValue("grey.400", "grey.500");
    const providerColor = useColorModeValue("grey.400", "grey.500");
    const badgeBg = useColorModeValue(
        model.badge ? (BADGE_LIGHT[model.badge]?.bg ?? "grey.50") : "transparent",
        model.badge ? (BADGE_DARK[model.badge]?.bg ?? "grey.800") : "transparent",
    );
    const badgeColor = useColorModeValue(
        model.badge ? (BADGE_LIGHT[model.badge]?.color ?? "grey.500") : "transparent",
        model.badge ? (BADGE_DARK[model.badge]?.color ?? "grey.400") : "transparent",
    );

    const isFree = model.priceInput === 0 && model.priceOutput === 0;

    return (
        <Box
            as="button"
            w="100%"
            textAlign="left"
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
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(52,211,169,0.1)",
            }}
            _active={{ transform: "translateY(0)" }}
            onClick={onSelect}
        >
            <VStack align="stretch" spacing={1.5}>
                <HStack justify="space-between" align="center">
                    <HStack spacing={1.5} align="baseline" minW={0}>
                        <Text fontSize="13px" fontWeight={700} color={labelColor} letterSpacing="-0.01em" isTruncated>
                            {model.label}
                        </Text>
                        <Text fontSize="10px" color={providerColor} flexShrink={0}>
                            {model.provider}
                        </Text>
                    </HStack>
                    <HStack spacing={1.5} flexShrink={0}>
                        {model.badge && (
                            <Box
                                bg={badgeBg}
                                color={badgeColor}
                                fontSize="9px"
                                fontWeight={700}
                                letterSpacing="0.06em"
                                textTransform="uppercase"
                                px="6px"
                                py="2px"
                                borderRadius="4px"
                            >
                                {model.badge}
                            </Box>
                        )}
                        {isSelected && <Icon as={Check} boxSize="14px" color="green.500" />}
                    </HStack>
                </HStack>

                <Text fontSize="11px" color={subColor} lineHeight={1.4} noOfLines={2}>
                    {model.description}
                </Text>

                <HStack spacing={3} pt={0.5}>
                    {isFree ? (
                        <Text fontSize="10px" color="green.500" fontWeight={600}>
                            Free
                        </Text>
                    ) : (
                        <>
                            <Text fontSize="10px" color={priceColor}>
                                In{" "}
                                <Box as="span" fontWeight={600} color={subColor}>
                                    ${model.priceInput}
                                </Box>
                                /1M
                            </Text>
                            <Text fontSize="10px" color={priceColor}>
                                Out{" "}
                                <Box as="span" fontWeight={600} color={subColor}>
                                    ${model.priceOutput}
                                </Box>
                                /1M
                            </Text>
                        </>
                    )}
                </HStack>
            </VStack>
        </Box>
    );
};

const InstructionEditor = ({
    data,
    onChange,
}: {
    data: AppNodeData;
    onChange: (value: string) => void;
}) => {
    const [value, setValue] = useState(data.stringValue ?? "");
    const borderColor = useColorModeValue("grey.200", "grey.700");

    useEffect(() => {
        setValue(data.stringValue ?? "");
    }, [data.stringValue]);

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

export const NodeSettingsEditor = ({ mainNodeId, onSettingSelect }: NodeSettingsEditorProps) => {
    const nodes = useNodes();
    const edges = useEdges();
    const { setNodes } = useReactFlow();

    const sectionLabelColor = useColorModeValue("grey.500", "grey.400");
    const dividerColor = useColorModeValue("grey.100", "grey.700");
    const emptyColor = useColorModeValue("grey.400", "grey.600");

    const settingsEdges = edges.filter((e) => e.source === mainNodeId && e.type === "settings");
    const settingsNodes = settingsEdges
        .map((e) => nodes.find((n) => n.id === e.target))
        .filter((n): n is Node => !!n);

    const modelNodes = settingsNodes.filter((n) => (n.data as AppNodeData).type === TaskType.MODEL);
    const instructionNodes = settingsNodes.filter((n) => (n.data as AppNodeData).type === TaskType.INSTRUCTION);

    const handleInstructionChange = (nodeId: string, value: string) => {
        setNodes((prev) =>
            prev.map((n) =>
                n.id === nodeId
                    ? { ...n, data: { ...n.data, stringValue: value, isPlaceholder: !value.trim() } }
                    : n,
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
        <VStack spacing={5} align="stretch">
            {modelNodes.map((node) => {
                const data = node.data as AppNodeData;
                return (
                    <Box key={node.id}>
                        <Text
                            fontSize="10px"
                            fontWeight="700"
                            textTransform="uppercase"
                            letterSpacing="0.08em"
                            color={sectionLabelColor}
                            mb={3}
                        >
                            {data.settingLabel ?? "Modèle"}
                        </Text>
                        <VStack spacing={2} align="stretch">
                            {((data.configItems ?? []) as ModelOption[]).map((model) => (
                                <ModelPickerCard
                                    key={model.id}
                                    model={model}
                                    isSelected={model.id === data.modelName}
                                    onSelect={() => onSettingSelect(node.id, model.id)}
                                />
                            ))}
                        </VStack>
                    </Box>
                );
            })}

            {modelNodes.length > 0 && instructionNodes.length > 0 && (
                <Box borderTopWidth="1px" borderStyle="solid" borderColor={dividerColor} />
            )}

            {instructionNodes.map((node) => {
                const data = node.data as AppNodeData;
                return (
                    <Box key={node.id}>
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
                            data={data}
                            onChange={(value) => handleInstructionChange(node.id, value)}
                        />
                    </Box>
                );
            })}
        </VStack>
    );
};
