import { useState } from "react";
import { Divider, Heading, Stack, Text } from "@chakra-ui/react";
import PlanCard from "components/Billing/PlanCard";
import ConsumptionCard from "components/Billing/ConsumptionCard";
//import BuyCreditsSection from "components/Billing/BuyCreditsSection";
//import ChangePlanSection from "components/Billing/ChangePlanSection";
import { useIsDark } from "hooks/useIsDark";

export const BillingWorkspace = () => {
    const isDark = useIsDark();
    const [currentTier, _setCurrentTier] = useState("free");

    return (
        <Stack p={{ base: 4, lg: 6 }} gap={{ base: 4, lg: 6 }} h="100vh" overflow="hidden">
            <Stack spacing={0.5} flexShrink={0}>
                <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={isDark ? "white" : "grey.900"}>
                    Crédits
                </Heading>
                <Text fontSize="sm" color={isDark ? "grey.400" : "grey.500"}>
                    Gérez vos crédits et consultez votre consommation.
                </Text>
            </Stack>

            <Stack spacing={0} h="100%" w="100%" mx="auto">
                <PlanCard tier={currentTier} />
                <Divider borderColor={isDark ? "grey.600" : "grey.200"} />
                <ConsumptionCard />
            </Stack>
            {/*}
            <BuyCreditsSection />

            <ChangePlanSection currentTier={currentTier} onSelectTier={setCurrentTier} />
            */}
        </Stack>
    );
};
