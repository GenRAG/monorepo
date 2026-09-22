import { Box, Divider, HStack, Text, VStack } from "@chakra-ui/react";
import { CreditCard } from "lucide-react";
import Button from "components/ui/Button";

interface CreditsOrderSummaryProps {
    credits: number;
    ht: number;
    tva: number;
    ttc: number;
    isPurchasing: boolean;
    onPurchase: () => void;
    paymentBrand: string;
    paymentLast4: string;
}

export const CreditsOrderSummary = ({
    credits,
    ht,
    tva,
    ttc,
    isPurchasing,
    onPurchase,
    paymentBrand,
    paymentLast4,
}: CreditsOrderSummaryProps) => (
    <Box
        w={{ base: "100%", lg: "260px" }}
        bg="surfaceSubtle"
        border="1px solid"
        borderColor="borderDivider"
        borderRadius="10px"
        p={4}
        flexShrink={0}
    >
        <VStack align="stretch" spacing={2} mb={4}>
            <HStack justify="space-between">
                <Text fontSize="sm" color="textLabel">
                    {credits.toLocaleString("fr-FR")} crédits
                </Text>
                <Text fontSize="sm" color="textSecondary">
                    {ht.toFixed(2)} €
                </Text>
            </HStack>
            <HStack justify="space-between">
                <Text fontSize="sm" color="textLabel">
                    TVA (20%)
                </Text>
                <Text fontSize="sm" color="textSecondary">
                    {tva.toFixed(2)} €
                </Text>
            </HStack>
            <Divider borderColor="borderDivider" my={1} />
            <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="bold" color="textStrong">
                    Total TTC
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="textStrong" letterSpacing="-0.02em">
                    {ttc.toFixed(2).replace(".", ",")} €
                </Text>
            </HStack>
        </VStack>

        <Button
            w="100%"
            leftIcon={CreditCard}
            isLoading={isPurchasing}
            loadingText="Traitement..."
            onClick={onPurchase}
            mb={2}
        >
            Acheter avec {paymentBrand} •• {paymentLast4}
        </Button>
        <Text fontSize="10px" color="textLabel" textAlign="center" lineHeight="1.4">
            Paiement sécurisé via Stripe · facture envoyée par email.
        </Text>
    </Box>
);
