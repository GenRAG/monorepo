import { useState } from "react";
import { Divider, Heading, Stack, Text } from "@chakra-ui/react";
import PlanCard from "components/Billing/PlanCard";
import ConsumptionCard from "components/Billing/ConsumptionCard";
//import BuyCreditsSection from "components/Billing/BuyCreditsSection";
//import ChangePlanSection from "components/Billing/ChangePlanSection";

export const BillingWorkspace = () => {
    const [currentTier, _setCurrentTier] = useState("free");

    return (
        <Stack
            py={{ base: 4, lg: 6 }}
            pl={{ base: 20, lg: 28 }}
            pr={{ base: 28, lg: 40 }}
            gap={4}
            overflow="auto"
            h="100vh"
        >
            <Stack spacing={0.5} flexShrink={0}>
                <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="textPrimary">
                    Crédits
                </Heading>
                <Text variant="body-sm-muted">Gérez vos crédits et consultez votre consommation.</Text>
            </Stack>

            <Stack spacing={0} h="100%" w="100%" mx="auto">
                <PlanCard tier={currentTier} />
                <Divider borderColor="borderStrong" />
                <ConsumptionCard />
            </Stack>
            {/*}
            <BuyCreditsSection />

            <ChangePlanSection currentTier={currentTier} onSelectTier={setCurrentTier} />
            */}
        </Stack>
    );
};
