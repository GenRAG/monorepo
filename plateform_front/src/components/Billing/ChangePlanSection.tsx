import React from "react";
import { Box, Grid, HStack, Text, VStack, useColorMode } from "@chakra-ui/react";
import { Building2, Rocket, Sparkles, Zap } from "lucide-react";
import { PlanTierCard, type PlanTier } from "components/Billing/PlanTierCard";

const TIERS: PlanTier[] = [
    {
        id: "free",
        name: "Découverte",
        description: "Essayez GenRAG sur un projet personnel.",
        monthlyPrice: 0,
        icon: Zap,
        popular: false,
        features: ["5 crédits/jour (max 30/mois)", "1 assistant", "Projets publics", "Support communauté"],
        cta: "Commencer gratuitement",
    },
    {
        id: "pro",
        name: "Pro",
        description: "Pour les équipes qui passent en production.",
        monthlyPrice: 29,
        icon: Sparkles,
        popular: true,
        features: [
            "Crédits à la demande",
            "Jusqu'à 10 assistants",
            "Builder de workflow avancé",
            "Support prioritaire",
            "Report des crédits",
        ],
        cta: "Passer au Pro",
    },
    {
        id: "business",
        name: "Business",
        description: "Contrôles avancés pour les organisations.",
        monthlyPrice: 79,
        icon: Rocket,
        popular: false,
        features: [
            "Assistants illimités",
            "SSO & workspace équipe",
            "Publication interne",
            "Intégrations personnalisées",
            "Garantie SLA",
        ],
        cta: "Passer au Business",
    },
    {
        id: "enterprise",
        name: "Enterprise",
        description: "Sur-mesure : volume, gouvernance, SLA.",
        monthlyPrice: null,
        icon: Building2,
        popular: false,
        features: ["Support dédié", "Services d'onboarding", "SCIM & SAML", "SLA custom", "Tarification négociée"],
        cta: "Réserver une démo",
    },
];

interface ChangePlanSectionProps {
    currentTier: string;
    onSelectTier: (tier: string) => void;
}

const ChangePlanSection: React.FC<ChangePlanSectionProps> = ({ currentTier, onSelectTier }) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";

    return (
        <Box>
            <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
                <VStack align="start" spacing={0.5}>
                    <Text fontSize="md" fontWeight="bold" color="textStrong">
                        Changer de plan
                    </Text>
                    <Text fontSize="xs" color="textLabel">
                        Vous pouvez upgrader / downgrader à tout moment. La facturation est calculée au prorata.
                    </Text>
                </VStack>
            </HStack>

            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    xl: "repeat(4, 1fr)",
                }}
                gap={4}
            >
                {TIERS.map((tier) => (
                    <PlanTierCard
                        key={tier.id}
                        tier={tier}
                        isSelected={currentTier === tier.id}
                        isDark={isDark}
                        onSelect={onSelectTier}
                    />
                ))}
            </Grid>
        </Box>
    );
};

export default ChangePlanSection;
