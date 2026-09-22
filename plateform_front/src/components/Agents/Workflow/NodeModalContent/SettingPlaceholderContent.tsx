import { VStack, HStack, Text, Box, useColorModeValue } from "@chakra-ui/react";
import type { ModelOption } from "@genrag/workflow";

import type { AppNodeData, Task } from "@genrag/workflow";

const BADGE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
    smart: { label: "Smart", bg: "purple.50", color: "purple.600" },
    fast: { label: "Fast", bg: "blue.50", color: "blue.600" },
    balanced: { label: "Balanced", bg: "green.50", color: "green.600" },
    cheap: { label: "Cheap", bg: "orange.50", color: "orange.600" },
};

const BADGE_CONFIG_DARK: Record<string, { label: string; bg: string; color: string }> = {
    smart: { label: "Smart", bg: "purple.900", color: "purple.300" },
    fast: { label: "Fast", bg: "blue.900", color: "blue.300" },
    balanced: { label: "Balanced", bg: "green.900", color: "green.300" },
    cheap: { label: "Cheap", bg: "orange.900", color: "orange.300" },
};

const ModelCard = ({ model, onSelect }: { model: ModelOption; onSelect: (id: string) => void }) => {
    const bgHover = useColorModeValue("green.50", "grey.800");
    const borderHover = useColorModeValue("green.300", "green.600");

    const isFree = model.priceInput === 0 && model.priceOutput === 0;

    const badgeDark = model.badge ? BADGE_CONFIG_DARK[model.badge] : null;
    const badgeLight = model.badge ? BADGE_CONFIG[model.badge] : null;
    const badgeBg = useColorModeValue(badgeLight?.bg ?? "grey.50", badgeDark?.bg ?? "grey.700");
    const badgeColor = useColorModeValue(badgeLight?.color ?? "grey.500", badgeDark?.color ?? "grey.400");

    return (
        <Box
            as="button"
            w="100%"
            textAlign="left"
            bg="surfaceAction"
            border="1px solid"
            borderColor="borderDivider"
            borderRadius="10px"
            p={3}
            cursor="pointer"
            transition="all 0.15s ease"
            _hover={{
                bg: bgHover,
                borderColor: borderHover,
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(52,211,169,0.1)",
            }}
            _active={{ transform: "translateY(0)" }}
            onClick={() => onSelect(model.id)}
        >
            <VStack align="stretch" spacing={1.5}>
                <HStack justify="space-between" align="center">
                    <HStack spacing={1.5} align="baseline">
                        <Text fontSize="13px" fontWeight={700} color="textOnBubble" letterSpacing="-0.01em">
                            {model.label}
                        </Text>
                        <Text fontSize="10px" color="textFaint">
                            {model.provider}
                        </Text>
                    </HStack>

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
                            flexShrink={0}
                        >
                            {BADGE_CONFIG[model.badge].label}
                        </Box>
                    )}
                </HStack>

                <Text fontSize="11px" color="textLabel" lineHeight={1.4} noOfLines={2}>
                    {model.description}
                </Text>

                <HStack spacing={3} pt={0.5}>
                    {isFree ? (
                        <Text fontSize="10px" color="iconAccent" fontWeight={600}>
                            Free
                        </Text>
                    ) : (
                        <>
                            <Text fontSize="10px" color="textFaint">
                                In{" "}
                                <Box as="span" fontWeight={600} color="textLabel">
                                    ${model.priceInput}
                                </Box>
                                /1M
                            </Text>
                            <Text fontSize="10px" color="textFaint">
                                Out{" "}
                                <Box as="span" fontWeight={600} color="textLabel">
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

interface SettingPlaceholderContentProps {
    task: Task;
    nodeData: AppNodeData;
    onSelect: (item: string) => void;
}

export default function SettingPlaceholderContent({ nodeData, onSelect }: SettingPlaceholderContentProps) {
    const configItems: (ModelOption | string)[] = nodeData.configItems ?? [];
    const settingLabel = nodeData.settingLabel ?? "Setting";
    const isLegacy = configItems.length > 0 && typeof configItems[0] === "string";

    return (
        <VStack spacing={0} align="stretch">
            <Box px={4} pt={4} pb={3}>
                <Text
                    fontSize="10px"
                    fontWeight={700}
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color="textLabel"
                >
                    {settingLabel}
                </Text>
            </Box>

            <Box borderTop="1px solid" borderColor="borderSubtle" mx={4} mb={3} />

            <VStack spacing={2} align="stretch" px={4} pb={4}>
                {isLegacy
                    ? configItems
                          .filter((item): item is string => typeof item === "string")
                          .map((item) => (
                              <Box
                                  as="button"
                                  key={item}
                                  w="100%"
                                  textAlign="left"
                                  px={3}
                                  py={2}
                                  borderRadius="8px"
                                  border="1px solid"
                                  borderColor="borderDivider"
                                  fontSize="13px"
                                  fontWeight={600}
                                  color="textSecondary"
                                  _hover={{ borderColor: "borderAccentCardMuted" }}
                                  transition="all 0.15s"
                                  onClick={() => onSelect(item)}
                              >
                                  {item}
                              </Box>
                          ))
                    : configItems
                          .filter((item): item is ModelOption => typeof item !== "string")
                          .map((model) => <ModelCard key={model.id} model={model} onSelect={onSelect} />)}
            </VStack>
        </VStack>
    );
}
