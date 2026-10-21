import { useEffect, useState } from "react";
import { Heading, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useParams, useSearchParams } from "react-router-dom";
import PlanCard from "components/Billing/PlanCard";
import TopUpCard from "components/Billing/TopUpCard";
import ConsumptionCard from "components/Billing/ConsumptionCard";
import { MainLayoutContainer } from "components/ui/MainLayoutContainer";
import useThemedToast from "hooks/useThemedToast";
import { useGetBillingSummaryQuery } from "services/billing/billing";

// Stripe confirms a payment through a webhook, a few seconds after sending the user back here.
const CONFIRMATION_POLL_MS = 3_000;
const CONFIRMATION_WINDOW_MS = 30_000;
const CHECKOUT_TOAST_ID = "checkout-success";

export const BillingWorkspace = () => {
    const { workspaceId = "" } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const toast = useThemedToast();
    const [isConfirming, setIsConfirming] = useState(false);

    const {
        data: summary,
        isLoading,
        isError,
    } = useGetBillingSummaryQuery(workspaceId, {
        skip: !workspaceId,
        refetchOnMountOrArgChange: true,
        pollingInterval: isConfirming ? CONFIRMATION_POLL_MS : 0,
    });

    useEffect(() => {
        const checkout = searchParams.get("checkout");
        if (!checkout) return;
        setSearchParams({}, { replace: true });
        if (checkout !== "success") return;

        // React's dev double run of effects would show it twice.
        if (toast.isActive(CHECKOUT_TOAST_ID)) return;
        toast({
            id: CHECKOUT_TOAST_ID,
            title: "Paiement en cours de confirmation",
            description: "Votre abonnement ou vos crédits apparaissent dans quelques secondes.",
            status: "success",
        });
        setIsConfirming(true);
    }, [searchParams, setSearchParams, toast]);

    // Its own effect: clearing the query string above re-runs that one, which would cancel this timer.
    useEffect(() => {
        if (!isConfirming) return;
        const timer = setTimeout(() => setIsConfirming(false), CONFIRMATION_WINDOW_MS);
        return () => clearTimeout(timer);
    }, [isConfirming]);

    const renderBody = () => {
        if (isLoading) return <Skeleton h="220px" borderRadius="12px" />;
        if (isError || !summary) {
            return <Text variant="body-sm-muted">Impossible de charger votre abonnement. Rechargez la page.</Text>;
        }
        return (
            <>
                <PlanCard workspaceId={workspaceId} summary={summary} />
                {summary.plan === "PRO" && (
                    <TopUpCard workspaceId={workspaceId} creditsPerEuro={summary.creditsPerEuro} />
                )}
                <ConsumptionCard />
            </>
        );
    };

    return (
        <MainLayoutContainer
            header={
                <Stack spacing={0.5} flexShrink={0}>
                    <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="textPrimary">
                        Abonnement et crédits
                    </Heading>
                    <Text variant="body-sm-muted">
                        Gérez votre abonnement, vos crédits et suivez votre consommation.
                    </Text>
                </Stack>
            }
            body={
                <Stack spacing={6} h="100%" w="100%" mx="auto">
                    {renderBody()}
                </Stack>
            }
        />
    );
};
