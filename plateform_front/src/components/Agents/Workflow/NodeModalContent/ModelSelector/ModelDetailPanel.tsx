import React from "react";
import { Box, Divider, HStack, Stack, Text, VStack, Wrap, WrapItem, useColorModeValue } from "@chakra-ui/react";
import { RagModel } from "types/models/models";
import { formatContextLength, formatPrice, getProviderName } from "./modelUtils";
import { CapabilityBadge, PerformanceBars, StatBadge } from "./ModelDetailHelpers";
import BoxIcon from "components/ui/BoxIcon";
import { getAgentAvatar } from "utils/agentAvatar";
import Button from "components/ui/Button";

interface Props {
    model: RagModel | null;
    onConfirm: (modelId: string) => void;
}

const SectionLabel: React.FC<{ children: string }> = ({ children }) => {
    const sectionColor = useColorModeValue("grey.600", "grey.400");

    return (
        <Text
            fontSize="9px"
            p={3}
            pb={1}
            fontWeight={700}
            color={sectionColor}
            textTransform="uppercase"
            letterSpacing="0.06em"
        >
            {children}
        </Text>
    );
};

const SectionModelInformation: React.FC<{ children: React.ReactNode; sectionTitle: string }> = ({
    children,
    sectionTitle,
}) => {
    const sectionBg = useColorModeValue("grey.25", "grey.800");
    const dividerColor = useColorModeValue("grey.100", "grey.700");

    return (
        <VStack
            border="1px solid"
            borderColor={dividerColor}
            borderRadius="8px"
            bg={sectionBg}
            align="stretch"
            spacing={1.5}
        >
            <SectionLabel>{sectionTitle}</SectionLabel>
            <Divider borderColor={dividerColor} />
            {children}
        </VStack>
    );
};

export const ModelDetailPanel: React.FC<Props> = ({ model, onConfirm }) => {
    const nameColor = useColorModeValue("grey.900", "grey.50");
    const subColor = useColorModeValue("grey.500", "grey.400");
    const descColor = useColorModeValue("grey.600", "grey.400");
    const dividerColor = useColorModeValue("grey.100", "grey.700");
    const bgColor = useColorModeValue("white", "linear-gradient(135deg, #2222228a 0%, rgb(54, 54, 54) 100%)");

    if (!model) {
        return (
            <VStack flex={1} align="center" justify="center">
                <Text fontSize="12px" color={subColor}>
                    Sélectionnez un modèle
                </Text>
            </VStack>
        );
    }

    const provider = getProviderName(model.id, model.provider);
    const inputModalities = model.architecture?.input_modalities ?? [];
    const capabilities = model.supported_parameters ?? [];
    const stats = [
        { label: "Contexte", value: model.context_length ? formatContextLength(model.context_length) : "—" },
        { label: "Entrée", value: formatPrice(model.pricing?.prompt) },
        { label: "Sortie", value: formatPrice(model.pricing?.completion) },
    ];

    const avatarStyle = getAgentAvatar(model.name);

    return (
        <VStack flex={1} align="stretch" overflowY="auto" bg={bgColor}>
            <Stack px={4} py={4} pb={2}>
                <HStack spacing={3} align="flex-start">
                    <BoxIcon
                        letters={model.name.charAt(0).toUpperCase()}
                        bg={avatarStyle.bg}
                        color={avatarStyle.color}
                    />
                    <VStack align="stretch" spacing={0.5} flex={1} minW={0}>
                        <Text fontSize="15px" fontWeight={700} color={nameColor} noOfLines={2} lineHeight="1.3">
                            {model.name}
                        </Text>
                        {provider && (
                            <Text fontSize="11px" color={subColor}>
                                par {provider}
                            </Text>
                        )}
                    </VStack>
                </HStack>

                {model.description && (
                    <Text fontSize="12px" color={descColor} lineHeight="1.6" noOfLines={4}>
                        {model.description}
                    </Text>
                )}
            </Stack>

            <Box borderTopWidth="1px" borderTopStyle="solid" borderTopColor={dividerColor} />
            <Stack px={4} py={2} spacing={4}>
                <HStack spacing={2}>
                    {stats.map((s) => (
                        <StatBadge key={s.label} label={s.label} value={s.value} />
                    ))}
                </HStack>

                {inputModalities.length > 0 && (
                    <SectionModelInformation sectionTitle="Modalités d'entrée">
                        <Wrap spacing={1.5} p={2}>
                            {inputModalities.map((m) => (
                                <WrapItem key={m}>
                                    <CapabilityBadge label={m} />
                                </WrapItem>
                            ))}
                        </Wrap>
                    </SectionModelInformation>
                )}

                <SectionModelInformation sectionTitle="Performance">
                    <PerformanceBars modelId={model.id} />
                </SectionModelInformation>

                {capabilities.length > 0 && (
                    <SectionModelInformation sectionTitle="Capacités">
                        <Wrap spacing={1.5} p={2}>
                            {capabilities.map((c) => (
                                <WrapItem key={c}>
                                    <CapabilityBadge label={c} />
                                </WrapItem>
                            ))}
                        </Wrap>
                    </SectionModelInformation>
                )}

                <Button size="sm" borderRadius="8px" mt="auto" onClick={() => onConfirm(model.id)}>
                    Sélectionner
                </Button>
            </Stack>
        </VStack>
    );
};
