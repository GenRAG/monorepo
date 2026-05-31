import { useState } from "react";
import { Heading, Stack, Text } from "@chakra-ui/react";
import PlanCard from "./components/PlanCard";
import ConsumptionCard from "./components/ConsumptionCard";
import BuyCreditsSection from "./components/BuyCreditsSection";
import ChangePlanSection from "./components/ChangePlanSection";
import { useIsDark } from "hooks/useIsDark";

export const BillingWorkspace = () => {
    const isDark = useIsDark();
    const [currentTier, setCurrentTier] = useState("business");

    return (
        <Stack p={{ base: 4, lg: 6 }} gap={{ base: 4, lg: 6 }} overflow="auto" maxH="100vh">
            <Stack spacing={0.5}>
                <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={isDark ? "white" : "grey.900"}>
                    Facturation
                </Heading>
                <Text fontSize="sm" color={isDark ? "grey.400" : "grey.500"}>
                    Gérez votre abonnement, vos crédits et consultez votre consommation.
                </Text>
            </Stack>

            <Stack direction={{ base: "column", xl: "row" }} spacing={4} align="stretch">
                <Stack flex={{ base: 1, xl: "0 0 58%" }} minW={0}>
                    <PlanCard tier={currentTier} />
                </Stack>
                <Stack flex={1} minW={0}>
                    <ConsumptionCard />
                </Stack>
            </Stack>

            <BuyCreditsSection />

            <ChangePlanSection currentTier={currentTier} onSelectTier={setCurrentTier} />
        </Stack>
    );
};
