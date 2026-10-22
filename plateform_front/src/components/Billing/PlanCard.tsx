import React from "react";
import { Box, Card, HStack, SimpleGrid, Stack, Text, VStack } from "@chakra-ui/react";
import { ParentSize } from "@visx/responsive";
import { CreditCard, Sparkles } from "lucide-react";
import { Gauge } from "components/charts";
import Button from "components/ui/Button";
import useApiErrorToast from "hooks/useApiErrorToast";
import { useOpenBillingPortalMutation, useStartSubscriptionMutation } from "services/billing/billing";
import type { BillingSummary } from "types/billing/billing";

// Target width (px) of one notch + its gap, so notch count adapts to the gauge's rendered width.
const NOTCH_PITCH_PX = 4;

const fmtNumber = (n: number) => n.toLocaleString("fr-FR");
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
    <VStack align="start" spacing={0} minW={0}>
        <Text variant="caption-sm-muted">{label}</Text>
        <Text fontSize="lg" fontWeight="bold" color="textPrimary">
            {value}
        </Text>
        {hint && <Text variant="body-xs-muted">{hint}</Text>}
    </VStack>
);

const StatusBadge = ({ label, tone }: { label: string; tone: "accent" | "muted" }) => (
    <HStack bg={tone === "accent" ? "accentIconBg" : "surfaceSubtle"} px={2} py={0.5} borderRadius="full" spacing={1}>
        <Box w={1.5} h={1.5} borderRadius="full" bg={tone === "accent" ? "iconAccent" : "textFaint"} />
        <Text fontSize="xs" color={tone === "accent" ? "iconAccent" : "textLabel"} fontWeight="semibold">
            {label}
        </Text>
    </HStack>
);

/** The quota left this month, as a gauge that empties with use. */
const MonthlyQuota = ({ left, quota, renewsOn }: { left: number; quota: number; renewsOn: string | null }) => (
    <Box>
        <HStack align="baseline" spacing={1} mb={1.5} flexWrap="wrap">
            <Text fontSize="xl" fontWeight="bold" color="textPrimary">
                {fmtNumber(left)}
            </Text>
            <Text variant="body-md-muted">/ {fmtNumber(quota)} crédits restants ce mois-ci</Text>
        </HStack>
        {/* ParentSize fills its parent: without a height, the text below would slide under the gauge. */}
        <Box h="10px">
            <ParentSize debounceTime={10}>
                {({ width }) =>
                    width > 0 ? (
                        <Gauge
                            orientation="linear"
                            value={quota > 0 ? Math.round((left / quota) * 100) : 0}
                            width={width}
                            linearHeight={10}
                            notchCornerRadius={3}
                            notchWidthPercent={60}
                            totalNotches={Math.max(20, Math.round(width / NOTCH_PITCH_PX))}
                            inactiveFill="var(--border)"
                        />
                    ) : null
                }
            </ParentSize>
        </Box>
        {renewsOn && (
            <Text variant="body-sm-muted" mt={1}>
                Remis à {fmtNumber(quota)} le {fmtDate(renewsOn)}
            </Text>
        )}
    </Box>
);

interface PlanCardProps {
    workspaceId: string;
    summary: BillingSummary;
}

const PlanCard: React.FC<PlanCardProps> = ({ workspaceId, summary }) => {
    const notifyError = useApiErrorToast();
    const [startSubscription, { isLoading: isSubscribing }] = useStartSubscriptionMutation();
    const [openPortal, { isLoading: isOpeningPortal }] = useOpenBillingPortalMutation();
    const { plan, credits, limits, usage, subscription, subscriptionOffer: offer } = summary;
    const price = offer.priceCents / 100;
    const isSubscribed = plan === "PRO";

    const goTo = async (start: () => Promise<{ url: string }>, errorTitle: string) => {
        try {
            window.location.assign((await start()).url);
        } catch (error) {
            notifyError(errorTitle, error);
        }
    };

    const badge = isSubscribed
        ? subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd
            ? { label: `Résilié, actif jusqu'au ${fmtDate(subscription.currentPeriodEnd)}`, tone: "muted" as const }
            : { label: "Actif", tone: "accent" as const }
        : plan === "FREE"
          ? { label: "Bêta", tone: "accent" as const }
          : null;

    return (
        <VStack w="100%" align="stretch" spacing={3}>
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="textPrimary">
                Plan actuel
            </Text>
            <Card size="none" p={{ base: 4, md: 5 }}>
                <Stack direction={{ base: "column", md: "row" }} justify="space-between" mb={5} gap={3}>
                    <VStack align="start" spacing={0.5}>
                        <HStack spacing={2} flexWrap="wrap">
                            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="textPrimary">
                                {plan === "NONE" ? "Aucun abonnement" : summary.planName}
                            </Text>
                            {badge && <StatusBadge {...badge} />}
                        </HStack>
                        {!isSubscribed && (
                            <Text variant="body-sm-muted">
                                Abonnement : {price} € par mois, {fmtNumber(offer.monthlyCredits)} crédits renouvelés
                                chaque mois, {offer.maxAgents} agents et {offer.maxDatasets} bases.
                            </Text>
                        )}
                    </VStack>
                    {isSubscribed ? (
                        <Button
                            variant="secondary"
                            leftIcon={CreditCard}
                            isLoading={isOpeningPortal}
                            onClick={() => goTo(() => openPortal(workspaceId).unwrap(), "Ouverture impossible")}
                        >
                            Gérer l&apos;abonnement
                        </Button>
                    ) : (
                        <Button
                            variant="superPrimary"
                            leftIcon={Sparkles}
                            isLoading={isSubscribing}
                            onClick={() => goTo(() => startSubscription(workspaceId).unwrap(), "Paiement impossible")}
                        >
                            S&apos;abonner, {price} €/mois
                        </Button>
                    )}
                </Stack>

                <VStack align="stretch" spacing={5}>
                    {isSubscribed && (
                        <MonthlyQuota
                            left={credits.monthly}
                            quota={credits.monthlyQuota}
                            renewsOn={subscription?.cancelAtPeriodEnd ? null : (subscription?.currentPeriodEnd ?? null)}
                        />
                    )}
                    <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                        <Stat
                            label={isSubscribed ? "Crédits supplémentaires" : "Crédits disponibles"}
                            value={fmtNumber(isSubscribed ? credits.purchased : credits.balance)}
                            hint="Sans expiration"
                        />
                        <Stat label="Agents" value={`${usage.agents} / ${limits.agents}`} />
                        <Stat label="Bases de connaissances" value={`${usage.datasets} / ${limits.datasets}`} />
                    </SimpleGrid>
                </VStack>
            </Card>
        </VStack>
    );
};

export default PlanCard;
