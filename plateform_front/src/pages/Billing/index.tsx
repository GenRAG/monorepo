import { useState } from "react";
import { Heading, Stack, Text } from "@chakra-ui/react";
import PlanCard from "components/Billing/PlanCard";
import ConsumptionCard from "components/Billing/ConsumptionCard";
import { MainLayoutContainer } from "components/ui/MainLayoutContainer";
//import BuyCreditsSection from "components/Billing/BuyCreditsSection";
//import ChangePlanSection from "components/Billing/ChangePlanSection";

export const BillingWorkspace = () => {
    const [currentTier, _setCurrentTier] = useState("free");

    return (
        <MainLayoutContainer
            header={
                <Stack spacing={0.5} flexShrink={0}>
                    <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="textPrimary">
                        Crédits
                    </Heading>
                    <Text variant="body-sm-muted">Gérez vos crédits et consultez votre consommation.</Text>
                </Stack>
            }
            body={
                <Stack spacing={6} h="100%" w="100%" mx="auto">
                    <PlanCard tier={currentTier} />
                    <ConsumptionCard />
                    {/*}
                    <BuyCreditsSection />

                    <ChangePlanSection currentTier={currentTier} onSelectTier={setCurrentTier} />
                    */}
                </Stack>
            }
        />
    );
};
