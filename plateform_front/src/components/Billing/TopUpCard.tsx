import React, { useState } from "react";
import { Card, HStack, Input, InputGroup, InputRightElement, Stack, Text, VStack } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import Button from "components/ui/Button";
import useApiErrorToast from "hooks/useApiErrorToast";
import { useStartTopUpMutation } from "services/billing/billing";
import { MAX_TOP_UP_EUROS, MIN_TOP_UP_EUROS } from "types/billing/billing";

interface TopUpCardProps {
    workspaceId: string;
    creditsPerEuro: number;
}

/** Credits bought on top of the subscription, for any whole amount of euros; paid on Stripe's page. */
const TopUpCard: React.FC<TopUpCardProps> = ({ workspaceId, creditsPerEuro }) => {
    const notifyError = useApiErrorToast();
    const [startTopUp, { isLoading }] = useStartTopUpMutation();
    const [input, setInput] = useState("20");

    const euros = Number(input);
    const isValid = Number.isInteger(euros) && euros >= MIN_TOP_UP_EUROS && euros <= MAX_TOP_UP_EUROS;

    const handleBuy = async () => {
        try {
            const { url } = await startTopUp({ workspaceId, amountEuros: euros }).unwrap();
            window.location.assign(url);
        } catch (error) {
            notifyError("Paiement impossible", error);
        }
    };

    return (
        <VStack w="100%" align="stretch" spacing={3}>
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="textPrimary">
                Ajouter des crédits
            </Text>
            <Card size="none" p={{ base: 4, md: 5 }}>
                <Text variant="body-sm-muted" mb={4}>
                    Utilisés une fois le quota du mois épuisé, ils n&apos;expirent pas.{" "}
                    {creditsPerEuro.toLocaleString("fr-FR")} crédits par euro, de {MIN_TOP_UP_EUROS} à{" "}
                    {MAX_TOP_UP_EUROS.toLocaleString("fr-FR")} €.
                </Text>
                <Stack direction={{ base: "column", sm: "row" }} spacing={3} align={{ base: "stretch", sm: "center" }}>
                    <InputGroup maxW={{ sm: "160px" }}>
                        <Input
                            aria-label="Montant en euros"
                            inputMode="numeric"
                            value={input}
                            onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
                            onKeyDown={(e) => e.key === "Enter" && isValid && !isLoading && handleBuy()}
                        />
                        <InputRightElement pointerEvents="none">
                            <Text variant="body-sm-muted">€</Text>
                        </InputRightElement>
                    </InputGroup>
                    <HStack flex={1} spacing={1} align="baseline">
                        <Text fontWeight="bold" color="textPrimary">
                            {isValid ? (euros * creditsPerEuro).toLocaleString("fr-FR") : "-"}
                        </Text>
                        <Text variant="body-sm-muted">crédits</Text>
                    </HStack>
                    <Button
                        leftIcon={Plus}
                        variant="primary"
                        isDisabled={!isValid}
                        isLoading={isLoading}
                        onClick={handleBuy}
                    >
                        Acheter
                    </Button>
                </Stack>
            </Card>
        </VStack>
    );
};

export default TopUpCard;
