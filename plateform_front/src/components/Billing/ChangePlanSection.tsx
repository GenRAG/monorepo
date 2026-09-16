import React from "react";
import { Box, Divider, Grid, HStack, Icon, Text, VStack, useColorMode } from "@chakra-ui/react";
import { Building2, Check, Rocket, Sparkles, Zap } from "lucide-react";
import Button from "components/ui/Button";

const TIERS = [
    {
        id: "free",
        name: "Découverte",
        description: "Essayez GenRAG sur un projet personnel.",
        monthlyPrice: 0 as number | null,
        icon: Zap,
        popular: false,
        features: ["5 crédits/jour (max 30/mois)", "1 assistant", "Projets publics", "Support communauté"],
        cta: "Commencer gratuitement",
    },
    {
        id: "pro",
        name: "Pro",
        description: "Pour les équipes qui passent en production.",
        monthlyPrice: 29 as number | null,
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
        monthlyPrice: 79 as number | null,
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
                {TIERS.map((tier) => {
                    const isSelected = currentTier === tier.id;
                    const price = tier.monthlyPrice;

                    return (
                        <Box
                            key={tier.id}
                            position="relative"
                            bg={
                                isSelected
                                    ? isDark
                                        ? "rgba(52,211,169,0.06)"
                                        : "rgba(52,211,169,0.04)"
                                    : "surfaceCard"
                            }
                            border="1px solid"
                            borderColor={
                                isSelected
                                    ? "iconAccent"
                                    : tier.popular
                                      ? isDark
                                          ? "grey.600"
                                          : "grey.300"
                                      : "borderDivider"
                            }
                            borderRadius="12px"
                            p={5}
                            cursor="pointer"
                            transition="all 0.15s"
                            onClick={() => onSelectTier(tier.id)}
                            _hover={{ borderColor: "iconAccent" }}
                        >
                            {tier.popular && (
                                <Box
                                    position="absolute"
                                    top="-11px"
                                    left="50%"
                                    transform="translateX(-50%)"
                                    bg="iconAccent"
                                    color="grey.900"
                                    px={3}
                                    py="2px"
                                    borderRadius="full"
                                    fontSize="9px"
                                    fontWeight={700}
                                    letterSpacing="0.08em"
                                    textTransform="uppercase"
                                    whiteSpace="nowrap"
                                >
                                    Populaire
                                </Box>
                            )}

                            {isSelected && (
                                <Box
                                    position="absolute"
                                    top="-11px"
                                    left="50%"
                                    transform="translateX(-50%)"
                                    border="1px solid"
                                    borderColor="iconAccent"
                                    color="iconAccent"
                                    px={3}
                                    py="2px"
                                    borderRadius="full"
                                    fontSize="9px"
                                    fontWeight={700}
                                    letterSpacing="0.08em"
                                    textTransform="uppercase"
                                    whiteSpace="nowrap"
                                    bg="surfaceCard"
                                >
                                    Plan actuel
                                </Box>
                            )}

                            <VStack align="start" spacing={4}>
                                <HStack spacing={2}>
                                    <Box
                                        w="30px"
                                        h="30px"
                                        borderRadius="8px"
                                        bg="surfaceSubtle"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Icon as={tier.icon} boxSize={4} color={isDark ? "green.400" : "green.600"} />
                                    </Box>
                                    <Text fontSize="sm" fontWeight="bold" color="textStrong">
                                        {tier.name}
                                    </Text>
                                </HStack>

                                <Box>
                                    {tier.monthlyPrice === null ? (
                                        <Text fontSize="xl" fontWeight="bold" color="textStrong">
                                            Sur-mesure
                                        </Text>
                                    ) : (
                                        <HStack align="baseline" spacing={1}>
                                            <Text
                                                fontSize="xl"
                                                fontWeight="bold"
                                                color="textStrong"
                                                letterSpacing="-0.02em"
                                            >
                                                {tier.monthlyPrice === 0 ? "Gratuit" : `${price} €`}
                                            </Text>
                                            {tier.monthlyPrice > 0 && (
                                                <Text fontSize="xs" color="textLabel">
                                                    /mois
                                                </Text>
                                            )}
                                        </HStack>
                                    )}
                                    <Text fontSize="11px" color="textLabel" mt={0.5} lineHeight={1.4}>
                                        {tier.description}
                                    </Text>
                                </Box>

                                <Divider borderColor="borderDivider" />

                                <Button
                                    w="100%"
                                    size="sm"
                                    variant={isSelected ? undefined : "secondary"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectTier(tier.id);
                                    }}
                                >
                                    {isSelected ? "Plan actuel" : tier.cta}
                                </Button>

                                <VStack align="start" spacing={1.5} w="100%">
                                    {tier.features.map((f) => (
                                        <HStack key={f} spacing={2} align="flex-start">
                                            <Box
                                                p={0.5}
                                                mt="1px"
                                                bg="rgba(52,211,169,0.1)"
                                                borderRadius="full"
                                                flexShrink={0}
                                            >
                                                <Check size={10} color="iconAccent" strokeWidth={3} />
                                            </Box>
                                            <Text fontSize="11px" color="textLabel" lineHeight={1.4}>
                                                {f}
                                            </Text>
                                        </HStack>
                                    ))}
                                </VStack>
                            </VStack>
                        </Box>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default ChangePlanSection;
