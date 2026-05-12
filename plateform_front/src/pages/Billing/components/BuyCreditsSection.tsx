import React, { useState } from "react";
import {
    Box,
    Divider,
    HStack,
    Input,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Stack,
    Text,
    VStack,
    useColorMode,
} from "@chakra-ui/react";
import { CreditCard } from "lucide-react";
import Button from "components/System/Atoms/Button";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

const MIN_CREDITS = 1;
const MAX_CREDITS = 10000;
const PRICE_PER_CREDIT = 0.08;
const VAT_RATE = 0.2;

const SLIDER_MARKS = [
    { value: 1, label: "1" },
    { value: 1000, label: "1k" },
    { value: 2000, label: "2k" },
    { value: 5000, label: "5k" },
    { value: 10000, label: "10k" },
];

const MOCK_PAYMENT = { brand: "Visa", last4: "4242" };

const BuyCreditsSection: React.FC = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const [credits, setCredits] = useState(500);
    const [inputValue, setInputValue] = useState("500");
    const [isPurchasing, setIsPurchasing] = useState(false);

    const ht = credits * PRICE_PER_CREDIT;
    const tva = ht * VAT_RATE;
    const ttc = ht + tva;

    const handleSliderChange = (val: number) => {
        setCredits(val);
        setInputValue(String(val));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value.replace(/\D/g, ""));
    };

    const handleInputCommit = () => {
        const parsed = parseInt(inputValue, 10);
        if (!isNaN(parsed) && parsed >= MIN_CREDITS) {
            const clamped = Math.min(MAX_CREDITS, parsed);
            setCredits(clamped);
            setInputValue(String(clamped));
        } else {
            setInputValue(String(credits));
        }
    };

    const handlePurchase = async () => {
        setIsPurchasing(true);
        await new Promise((r) => setTimeout(r, 1500));
        setIsPurchasing(false);
    };

    const border = isDark ? "grey.700" : "grey.200";
    const sub = isDark ? "grey.400" : "grey.500";
    const cardBg = isDark ? "grey.950" : "white";

    return (
        <Box
            bg={cardBg}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            p={6}
        >
            <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
                <VStack align="start" spacing={0.5}>
                    <Text
                        fontSize="md"
                        fontWeight="bold"
                        color={isDark ? "white" : "grey.900"}
                    >
                        Acheter des crédits
                    </Text>
                    <Text fontSize="xs" color={sub}>
                        Crédits à la demande, sans expiration. Partagés entre
                        tous vos agents.
                    </Text>
                </VStack>
                <HStack
                    bg={isDark ? "grey.800" : "grey.50"}
                    border="1px solid"
                    borderColor={border}
                    px={3}
                    py={1.5}
                    borderRadius="8px"
                    spacing={1}
                >
                    <Text fontSize="sm" color={sub}>
                        €
                    </Text>
                    <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={isDark ? "white" : "grey.900"}
                    >
                        {PRICE_PER_CREDIT.toFixed(2)}
                    </Text>
                    <Text fontSize="xs" color={sub}>
                        / crédit
                    </Text>
                </HStack>
            </HStack>

            <Stack
                direction={{ base: "column", lg: "row" }}
                spacing={6}
                align="flex-start"
            >
                <VStack flex={1} align="stretch" spacing={5} minW={0}>
                    <Box>
                        <HStack align="center" spacing={3} mb={4}>
                            <HStack align="baseline" spacing={1} flex={1}>
                                <Text
                                    fontSize="3xl"
                                    fontWeight="bold"
                                    color={isDark ? "green.400" : "green.600"}
                                    letterSpacing="-0.03em"
                                >
                                    {credits.toLocaleString("fr-FR")}
                                </Text>
                                <Text fontSize="sm" color={sub}>
                                    crédits
                                </Text>
                            </HStack>
                            <HStack
                                border="1px solid"
                                borderColor={border}
                                borderRadius="8px"
                                px={2}
                                py={1}
                                bg={isDark ? "grey.800" : "grey.50"}
                                spacing={1}
                                flexShrink={0}
                            >
                                <Input
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onBlur={handleInputCommit}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            handleInputCommit();
                                    }}
                                    w="40px"
                                    h="28px"
                                    border="none"
                                    bg="transparent"
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color={isDark ? "white" : "grey.900"}
                                    textAlign="right"
                                    p={0}
                                    _focus={{ boxShadow: "none" }}
                                />
                                <Text fontSize="xs" color={sub} flexShrink={0}>
                                    crédits
                                </Text>
                            </HStack>
                        </HStack>

                        {/* Slider */}
                        <Box px={1} mb={2}>
                            <Slider
                                min={MIN_CREDITS}
                                max={MAX_CREDITS}
                                step={1}
                                value={credits}
                                onChange={handleSliderChange}
                                focusThumbOnChange={false}
                            >
                                <SliderTrack
                                    h="10px"
                                    borderRadius="full"
                                    bg={isDark ? "grey.700" : "grey.200"}
                                >
                                    <SliderFilledTrack bgGradient="linear(to-r, green.400, green.600)" />
                                </SliderTrack>
                                <SliderThumb
                                    w="20px"
                                    h="20px"
                                    boxShadow="0 2px 8px rgba(52,211,169,0.4)"
                                    border={0}
                                    bgColor={currentDarkTheme.primary}
                                />
                            </Slider>

                            <HStack justify="space-between" mt={2}>
                                {SLIDER_MARKS.map((m) => (
                                    <Text
                                        key={m.value}
                                        fontSize="9px"
                                        color={sub}
                                        cursor="pointer"
                                        onClick={() =>
                                            handleSliderChange(m.value)
                                        }
                                        _hover={{
                                            color: isDark
                                                ? "green.400"
                                                : "green.600",
                                        }}
                                        transition="color 0.15s"
                                    >
                                        {m.label}
                                    </Text>
                                ))}
                            </HStack>
                        </Box>
                    </Box>
                </VStack>

                <Box
                    w={{ base: "100%", lg: "260px" }}
                    bg={isDark ? "grey.800" : "grey.50"}
                    border="1px solid"
                    borderColor={border}
                    borderRadius="10px"
                    p={4}
                    flexShrink={0}
                >
                    <VStack align="stretch" spacing={2} mb={4}>
                        <HStack justify="space-between">
                            <Text fontSize="sm" color={sub}>
                                {credits.toLocaleString("fr-FR")} crédits
                            </Text>
                            <Text
                                fontSize="sm"
                                color={isDark ? "grey.200" : "grey.800"}
                            >
                                {ht.toFixed(2)} €
                            </Text>
                        </HStack>
                        <HStack justify="space-between">
                            <Text fontSize="sm" color={sub}>
                                TVA (20%)
                            </Text>
                            <Text
                                fontSize="sm"
                                color={isDark ? "grey.200" : "grey.800"}
                            >
                                {tva.toFixed(2)} €
                            </Text>
                        </HStack>
                        <Divider borderColor={border} my={1} />
                        <HStack justify="space-between">
                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color={isDark ? "white" : "grey.900"}
                            >
                                Total TTC
                            </Text>
                            <Text
                                fontSize="xl"
                                fontWeight="bold"
                                color={isDark ? "white" : "grey.900"}
                                letterSpacing="-0.02em"
                            >
                                {ttc.toFixed(2).replace(".", ",")} €
                            </Text>
                        </HStack>
                    </VStack>

                    <Button
                        w="100%"
                        leftIcon={CreditCard}
                        isLoading={isPurchasing}
                        loadingText="Traitement..."
                        onClick={handlePurchase}
                        mb={2}
                    >
                        Acheter avec {MOCK_PAYMENT.brand} ••{" "}
                        {MOCK_PAYMENT.last4}
                    </Button>
                    <Text
                        fontSize="10px"
                        color={sub}
                        textAlign="center"
                        lineHeight="1.4"
                    >
                        Paiement sécurisé via Stripe · facture envoyée par
                        email.
                    </Text>
                </Box>
            </Stack>
        </Box>
    );
};

export default BuyCreditsSection;
