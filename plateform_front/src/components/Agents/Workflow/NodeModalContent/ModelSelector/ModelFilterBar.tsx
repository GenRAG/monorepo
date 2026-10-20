import React from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { ActionMenu, ActionMenuSection } from "components/ui/ActionMenu";
import { ContextTier, ModelFilters, PriceTier, ProviderOption, countActiveFilters } from "utils/models/modelFilters";
import { ModelAvatar } from "./ModelAvatar";

interface Props {
    filters: ModelFilters;
    providers: ProviderOption[];
    onChange: (filters: ModelFilters) => void;
}

const PRICE_LABELS: Record<PriceTier, string> = {
    all: "Tous les prix",
    budget: "Économique (< 0,15 $/1M)",
    standard: "Standard",
    premium: "Premium (> 1,5 $/1M)",
};

const CONTEXT_LABELS: Record<ContextTier, string> = {
    all: "Toutes les tailles",
    "128k": "128K tokens et plus",
    "1m": "1M tokens et plus",
};

const check = (active: boolean) => (active ? "✓" : undefined);

const providerAvatar = (option: ProviderOption) => (
    <ModelAvatar model={{ id: `${option.slug}/`, name: option.label }} size="sm" />
);

const Chip = ({ isActive, children }: { isActive: boolean; children: React.ReactNode }) => (
    <HStack
        spacing={1}
        px={1.5}
        h="22px"
        w="100%"
        minW={0}
        borderRadius="6px"
        borderWidth="1px"
        borderStyle="solid"
        borderColor={isActive ? "iconAccent" : "borderSubtle"}
        color={isActive ? "iconAccent" : "textLabel"}
        _hover={{ bg: "surfaceHover" }}
        transition="background 0.12s"
    >
        {children}
    </HStack>
);

export const ModelFilterBar: React.FC<Props> = ({ filters, providers, onChange }) => {
    const set = (patch: Partial<ModelFilters>) => onChange({ ...filters, ...patch });
    const selectedProvider = providers.find((p) => p.slug === filters.provider);
    const otherFilters = countActiveFilters({ ...filters, provider: null });

    const providerSections: ActionMenuSection[] = [
        {
            items: [
                {
                    label: "Tous les fournisseurs",
                    badge: check(!filters.provider),
                    onClick: () => set({ provider: null }),
                },
            ],
        },
        {
            label: "Fournisseurs",
            items: providers.map((p) => ({
                label: `${p.label} (${p.count})`,
                icon: providerAvatar(p),
                badge: check(filters.provider === p.slug),
                onClick: () => set({ provider: p.slug }),
            })),
        },
    ];

    const filterSections: ActionMenuSection[] = [
        {
            label: "Prix d'entrée",
            hint: "Prix facturé pour le texte envoyé au modèle : la question et les passages de vos documents. C'est le gros du coût d'un agent RAG, car chaque question envoie plusieurs extraits.",
            items: (Object.keys(PRICE_LABELS) as PriceTier[]).map((price) => ({
                label: PRICE_LABELS[price],
                badge: check(filters.price === price),
                onClick: () => set({ price }),
            })),
        },
        {
            label: "Contexte",
            hint: "Volume de texte que le modèle peut lire en une fois : la question, les passages récupérés, l'historique et la réponse. 128K tokens font environ 200 pages, 1M environ 1 500 pages.",
            items: (Object.keys(CONTEXT_LABELS) as ContextTier[]).map((context) => ({
                label: CONTEXT_LABELS[context],
                badge: check(filters.context === context),
                onClick: () => set({ context }),
            })),
        },
        {
            label: "Capacités",
            items: [
                {
                    label: "Raisonnement",
                    hint: "Le modèle réfléchit avant de répondre. Meilleur sur les questions complexes ou qui croisent plusieurs documents, mais plus lent et plus cher.",
                    badge: check(filters.reasoning),
                    onClick: () => set({ reasoning: !filters.reasoning }),
                },
            ],
        },
    ];

    return (
        <HStack spacing={1.5} px={2} pt={2} minW={0}>
            <Box minW={0} flex={1}>
                <ActionMenu
                    trigger={
                        <Chip isActive={!!selectedProvider}>
                            <Text fontSize="10px" noOfLines={1}>
                                {selectedProvider?.label ?? "Fournisseur"}
                            </Text>
                            <ChevronDown size={10} />
                        </Chip>
                    }
                    sections={providerSections}
                    tooltipLabel="Fournisseur"
                    placement="bottom-start"
                    width="240px"
                    maxHeight="360px"
                    fullWidth
                />
            </Box>
            <ActionMenu
                trigger={
                    <Chip isActive={otherFilters > 0}>
                        <SlidersHorizontal size={10} />
                        <Text fontSize="10px">{otherFilters > 0 ? `Filtres (${otherFilters})` : "Filtres"}</Text>
                    </Chip>
                }
                sections={filterSections}
                tooltipLabel="Filtres"
                placement="bottom-start"
                width="230px"
            />
        </HStack>
    );
};
