import React from "react";
import { Box, HStack, SimpleGrid, Stack, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { RagModel } from "types/models/models";
import { useGetModelInfoQuery } from "services/models/models";
import {
    formatContextLength,
    formatContextTooltip,
    formatMaxOutputTooltip,
    formatPrice,
    formatPriceConversionTooltip,
    formatPricePerMillion,
    getProviderName,
} from "./modelUtils";
import {
    CapabilityBadge,
    LatencyIndicator,
    ModelBadge,
    ModelDetailPanelSkeleton,
    ScoreBar,
    StatBadge,
} from "./ModelDetailHelpers";
import BoxIcon from "components/ui/BoxIcon";
import { getAgentAvatar } from "utils/agentAvatar";
import Button from "components/ui/Button";
import { ChartInfoTooltip } from "components/Agents/Analytics/ChartInfoTooltip";

const SECTION_TOOLTIPS: Record<string, string> = {
    Latence:
        "Temps de réponse observé pour ce modèle : le délai avant le premier mot de la réponse (« time to first token »), puis le débit de génération une fois la réponse lancée.",
    "Profile de Performance":
        "Scores relatifs sur 100, comparant ce modèle aux autres modèles disponibles sur la qualité des réponses, la vitesse de génération et le coût.",
    "Modalités d'entrée":
        "Types de contenu que ce modèle peut recevoir en entrée (texte, image, audio, vidéo, fichier).",
    Capacités:
        "Fonctionnalités techniques supportées par l'API de ce modèle (appel d'outils, format de réponse structuré, etc.).",
};

interface Props {
    model: RagModel | null;
    onConfirm: (modelId: string) => void;
}

const SectionLabel: React.FC<{ children: string; tooltip?: React.ReactNode }> = ({ children, tooltip }) => {
    return (
        <HStack spacing={1} px={3} pt={3}>
            <Text
                fontSize="9px"
                fontWeight={700}
                color="textDescription"
                textTransform="uppercase"
                letterSpacing="0.06em"
            >
                {children}
            </Text>
            {tooltip && <ChartInfoTooltip label={tooltip} />}
        </HStack>
    );
};

const SectionModelInformation: React.FC<{ children: React.ReactNode; sectionTitle: string }> = ({
    children,
    sectionTitle,
}) => {
    return (
        <VStack align="stretch" spacing={0}>
            <SectionLabel tooltip={SECTION_TOOLTIPS[sectionTitle]}>{sectionTitle}</SectionLabel>
            {children}
        </VStack>
    );
};

const getPricePerMillion = (detailsValue: number | undefined, fallback: string | undefined): number | undefined => {
    if (detailsValue !== undefined) return detailsValue;
    if (fallback) {
        const parsed = parseFloat(fallback) * 1_000_000;
        if (!Number.isNaN(parsed)) return parsed;
    }
    return undefined;
};

export const ModelDetailPanel: React.FC<Props> = ({ model, onConfirm }) => {
    const { currentData: modelInfo, isFetching: isModelInfoLoading } = useGetModelInfoQuery(model?.id ?? "", {
        skip: !model,
    });

    if (!model) {
        return (
            <VStack flex={1} align="center" justify="center">
                <Text fontSize="12px" color="textLabel">
                    Sélectionnez un modèle
                </Text>
            </VStack>
        );
    }

    if (isModelInfoLoading) {
        return <ModelDetailPanelSkeleton />;
    }

    const provider = getProviderName(model.id, model.provider);
    const inputModalities = model.architecture?.input_modalities ?? [];
    const details = modelInfo?.details;
    const contextLength = details?.context_length ?? model.context_length;

    const promptPricePerMillion = getPricePerMillion(details?.prompt_price_per_million, model.pricing?.prompt);
    const completionPricePerMillion = getPricePerMillion(
        details?.completion_price_per_million,
        model.pricing?.completion,
    );

    const stats = [
        {
            label: "Contexte",
            value: contextLength ? formatContextLength(contextLength) : "—",
            tooltip: contextLength ? formatContextTooltip(contextLength) : undefined,
        },
        {
            label: "Entrée",
            value:
                details?.prompt_price_per_million !== undefined
                    ? `${formatPricePerMillion(details.prompt_price_per_million)}/1M`
                    : formatPrice(model.pricing?.prompt),
            tooltip:
                promptPricePerMillion !== undefined
                    ? formatPriceConversionTooltip(promptPricePerMillion, "input")
                    : undefined,
        },
        {
            label: "Sortie",
            value:
                details?.completion_price_per_million !== undefined
                    ? `${formatPricePerMillion(details.completion_price_per_million)}/1M`
                    : formatPrice(model.pricing?.completion),
            tooltip:
                completionPricePerMillion !== undefined
                    ? formatPriceConversionTooltip(completionPricePerMillion, "output")
                    : undefined,
        },
        ...(details
            ? [
                  {
                      label: "Réponse max",
                      value: formatContextLength(details.max_output_tokens),
                      tooltip: formatMaxOutputTooltip(details.max_output_tokens),
                  },
              ]
            : []),
    ];

    const avatarStyle = getAgentAvatar(model.name);

    return (
        <VStack flex={1} align="stretch" overflowY="auto" bg="surfacePrimary">
            <Stack px={4} py={4} pb={2}>
                <HStack spacing={3} align="flex-start" justify="space-between">
                    <HStack spacing={3} align="flex-start" flex={1} minW={0}>
                        <BoxIcon
                            letters={model.name.charAt(0).toUpperCase()}
                            bg={avatarStyle.bg}
                            color={avatarStyle.color}
                        />
                        <VStack align="stretch" spacing={0.5} flex={1} minW={0}>
                            <Text fontSize="15px" fontWeight={700} color="textStrong" noOfLines={2} lineHeight="1.3">
                                {model.name}
                            </Text>
                            {provider && (
                                <Text fontSize="11px" color="textLabel">
                                    par {provider}
                                </Text>
                            )}
                        </VStack>
                    </HStack>
                    {modelInfo?.badge && <ModelBadge badge={modelInfo.badge} />}
                </HStack>

                {model.description && (
                    <Text fontSize="12px" color="textDescription" lineHeight="1.6" noOfLines={4}>
                        {model.description}
                    </Text>
                )}
            </Stack>

            <Box borderTopWidth="1px" borderTopStyle="solid" borderTopColor="borderSubtle" />
            <Stack px={4} py={2} spacing={2}>
                <SimpleGrid columns={2} spacing={2}>
                    {stats.map((s) => (
                        <StatBadge key={s.label} label={s.label} value={s.value} tooltip={s.tooltip} />
                    ))}
                </SimpleGrid>

                {details && (
                    <SectionModelInformation sectionTitle="Latence">
                        <LatencyIndicator label={details.latency_label} latencyMs={details.latency_ms} />
                    </SectionModelInformation>
                )}

                {modelInfo?.scores && (
                    <SectionModelInformation sectionTitle="Profile de Performance">
                        <VStack p={3} align="stretch" spacing={2.5}>
                            <ScoreBar label="Qualité" value={modelInfo.scores.quality} color="green.400" />
                            <ScoreBar label="Vitesse" value={modelInfo.scores.speed} color="blue.400" />
                            <ScoreBar label="Économie" value={modelInfo.scores.economy} color="purple.400" />
                        </VStack>
                    </SectionModelInformation>
                )}

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
                <Stack px={2}>
                    <Button size="md" mt="auto" onClick={() => onConfirm(model.id)}>
                        Sélectionner
                    </Button>
                </Stack>
            </Stack>
        </VStack>
    );
};
