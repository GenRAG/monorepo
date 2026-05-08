import {
    VStack,
    HStack,
    Box,
    Text,
    Button,
    useColorMode,
    Grid,
    Input,
    FormControl,
    FormLabel,
    chakra,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Badge,
    Divider,
    Icon,
    Heading,
    Stack,
} from "@chakra-ui/react";
import { ReactElement, useState } from "react";
import {
    CreditCard,
    Wallet,
    Check,
    Trash2,
    Zap,
    Sparkles,
    Building2,
    Rocket,
    CoinsIcon,
} from "lucide-react";
import useThemedToast from "hooks/useThemedToast";
import { useForm } from "react-hook-form";

enum BillingTab {
    OVERVIEW = "overview",
    PAYMENT_METHODS = "paymentMethods",
}

const TIERS = [
    {
        id: "free",
        name: "Free",
        description: "Discover what GenRAG can do for you",
        monthlyPrice: 0,
        icon: Zap,
        color: "#34D3A9",
        features: [
            "5 daily credits (up to 30/month)",
            "1 assistant",
            "Public projects",
            "Community support",
        ],
        cta: "Get started",
        popular: false,
    },
    {
        id: "pro",
        name: "Pro",
        description: "For teams building RAG pipelines in production",
        monthlyPrice: 29,
        icon: Sparkles,
        color: "#34D3A9",
        features: [
            "Custom credit packages",
            "Up to 10 assistants",
            "Advanced workflow builder",
            "Priority support",
            "Credit rollovers",
        ],
        cta: "Upgrade to Pro",
        popular: true,
    },
    {
        id: "business",
        name: "Business",
        description: "Advanced controls for growing organizations",
        monthlyPrice: 79,
        icon: Rocket,
        color: "#34D3A9",
        features: [
            "Unlimited assistants",
            "SSO & team workspace",
            "Internal publish",
            "Custom integrations",
            "SLA guarantee",
        ],
        cta: "Upgrade to Business",
        popular: false,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        description: "Built for large orgs needing flexibility and governance",
        monthlyPrice: null,
        icon: Building2,
        color: "#34D3A9",
        features: [
            "Dedicated support",
            "Onboarding services",
            "Design systems",
            "SCIM & SAML",
            "Custom SLA",
        ],
        cta: "Book a demo",
        popular: false,
    },
];

const CREDIT_STEPS = [50, 100, 200, 500, 1000, 2000, 5000];
const CREDIT_PRICE_PER_UNIT = 0.08;

export const BillingWorkspace = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const toast = useThemedToast();
    const [selectedTab, setSelectedTab] = useState<BillingTab>(
        BillingTab.OVERVIEW,
    );
    const [balance, setBalance] = useState(250);
    const [currentTier, setCurrentTier] = useState("free");
    const [paymentMethods, setPaymentMethods] = useState([
        { id: "1", last4: "4242", brand: "Visa", expiry: "12/26" },
    ]);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [creditSliderIndex, setCreditSliderIndex] = useState(1); // 100 credits default
    const [isAnnual, setIsAnnual] = useState(false);

    const selectedCredits = CREDIT_STEPS[creditSliderIndex];
    const creditPrice = (selectedCredits * CREDIT_PRICE_PER_UNIT).toFixed(2);

    const handleRemoveCard = (id: string) => {
        setPaymentMethods(paymentMethods.filter((p) => p.id !== id));
        toast({ title: "Card removed", status: "success", duration: 2000 });
    };
    const textPrimary = isDark ? "white" : "grey.900";
    const textSecondary = isDark ? "grey.400" : "grey.500";

    const handlePurchaseCredits = async () => {
        if (paymentMethods.length === 0) return;
        setIsPurchasing(true);
        await new Promise((r) => setTimeout(r, 1500));
        setBalance((b) => b + selectedCredits);
        setIsPurchasing(false);
        toast({
            title: "Credits added",
            description: `${selectedCredits} credits added to your balance`,
            status: "success",
            duration: 3000,
        });
    };

    const tabButton = (tab: BillingTab, label: string, icon: ReactElement) => (
        <Button
            size="md"
            variant="ghost"
            borderRadius="0px"
            borderBottom="2px solid"
            borderColor={selectedTab === tab ? "green.500" : "transparent"}
            color={
                selectedTab === tab
                    ? isDark
                        ? "green.400"
                        : "green.600"
                    : isDark
                      ? "grey.400"
                      : "grey.600"
            }
            fontWeight={selectedTab === tab ? "600" : "500"}
            leftIcon={icon}
            onClick={() => setSelectedTab(tab)}
        >
            {label}
        </Button>
    );

    return (
        <Stack
            p={{ base: 4, lg: 6 }}
            gap={{ base: 4, lg: 6 }}
            overflow="auto"
            maxH="100vh"
        >
            <VStack align="stretch">
                <Heading
                    variant="heading-3xl"
                    color={textPrimary}
                    fontWeight="semibold"
                    fontSize={{ base: "xl", md: "3xl" }}
                >
                    Facturation
                </Heading>
                <Text color={textSecondary} variant="body-md">
                    Gestionnez votre abonnement, vos méthodes de paiement et
                    consultez votre historique de facturation.
                </Text>
            </VStack>
            <HStack
                borderBottom="1px solid"
                borderColor={isDark ? "grey.700" : "grey.100"}
                w="100%"
                borderRadius="8px"
                spacing={0}
                bg={isDark ? "grey.950" : "green.50"}
            >
                {tabButton(
                    BillingTab.OVERVIEW,
                    "Overview",
                    <Wallet size={16} />,
                )}
                {tabButton(
                    BillingTab.PAYMENT_METHODS,
                    "Payment methods",
                    <CreditCard size={16} />,
                )}
            </HStack>

            <VStack
                w="100%"
                flex={1}
                align="stretch"
                spacing={0}
                overflow="auto"
                bg={isDark ? "grey.975" : "white"}
            >
                <Box p={6}>
                    {selectedTab === BillingTab.OVERVIEW && (
                        <OverviewTab
                            isDark={isDark}
                            balance={balance}
                            currentTier={currentTier}
                            onSelectTier={setCurrentTier}
                            isAnnual={isAnnual}
                            onToggleAnnual={() => setIsAnnual(!isAnnual)}
                            creditSliderIndex={creditSliderIndex}
                            onSliderChange={setCreditSliderIndex}
                            selectedCredits={selectedCredits}
                            creditPrice={creditPrice}
                            onPurchase={handlePurchaseCredits}
                            isPurchasing={isPurchasing}
                            hasPaymentMethod={paymentMethods.length > 0}
                        />
                    )}
                    {selectedTab === BillingTab.PAYMENT_METHODS && (
                        <PaymentMethodsTab
                            isDark={isDark}
                            paymentMethods={paymentMethods}
                            onRemoveCard={handleRemoveCard}
                            isAddingCard={isAddingCard}
                            setIsAddingCard={setIsAddingCard}
                        />
                    )}
                </Box>
            </VStack>
        </Stack>
    );
};

const OverviewTab = ({
    isDark,
    balance,
    currentTier,
    onSelectTier,
    isAnnual,
    onToggleAnnual,
    creditSliderIndex,
    onSliderChange,
    selectedCredits,
    creditPrice,
    onPurchase,
    isPurchasing,
    hasPaymentMethod,
}: any) => {
    const cardBg = isDark ? "grey.900" : "white";
    const cardBorder = isDark ? "grey.700" : "grey.100";
    const textMain = isDark ? "grey.100" : "grey.900";
    const textSub = isDark ? "grey.100" : "grey.800";

    return (
        <VStack spacing={8} align="stretch">
            <HStack
                bg={isDark ? "grey.900" : "white"}
                border="1px solid"
                borderColor={isDark ? "grey.700" : "green.100"}
                borderRadius="8px"
                p={5}
                justify="space-between"
                flexWrap="wrap"
                gap={4}
                boxShadow="0 1px 4px rgba(0,0,0,0.1)"
            >
                <HStack spacing={4}>
                    <Box
                        w="44px"
                        h="44px"
                        borderRadius="8px"
                        bg={isDark ? "grey.800" : "green.50"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="0 1px 4px rgba(0,0,0,0.1)"
                    >
                        <CoinsIcon color={isDark ? "#34D3A9" : "#12B98C"} />
                    </Box>
                    <VStack align="start" spacing={0}>
                        <Text
                            fontSize="xs"
                            fontWeight={600}
                            letterSpacing="0.06em"
                            textTransform="uppercase"
                            color={textSub}
                        >
                            Current balance
                        </Text>
                        <Text
                            fontSize="2xl"
                            fontWeight={800}
                            color={textMain}
                            letterSpacing="-0.02em"
                        >
                            {balance.toLocaleString()}{" "}
                            <Box
                                as="span"
                                fontSize="sm"
                                fontWeight={500}
                                color={textSub}
                            >
                                credits
                            </Box>
                        </Text>
                    </VStack>
                </HStack>
                <HStack spacing={3}>
                    <Box
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg={isDark ? "grey.800" : "green.50"}
                        border="1px solid"
                        borderColor={isDark ? "grey.600" : "green.200"}
                    >
                        <Text
                            fontSize="xs"
                            fontWeight={700}
                            color={isDark ? "green.400" : "green.600"}
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                        >
                            {TIERS.find((t) => t.id === currentTier)?.name} plan
                        </Text>
                    </Box>
                </HStack>
            </HStack>

            <HStack justify="center" spacing={3}>
                <Text fontSize="sm" color={textSub}>
                    Monthly
                </Text>
                <Box
                    as="button"
                    onClick={onToggleAnnual}
                    w="44px"
                    h="24px"
                    borderRadius="full"
                    bg={
                        isAnnual
                            ? "green.500"
                            : isDark
                              ? "grey.600"
                              : "grey.300"
                    }
                    position="relative"
                    transition="background 0.2s"
                >
                    <Box
                        position="absolute"
                        top="3px"
                        left={isAnnual ? "23px" : "3px"}
                        w="18px"
                        h="18px"
                        borderRadius="full"
                        bg="white"
                        transition="left 0.2s"
                        boxShadow="0 1px 4px rgba(0,0,0,0.2)"
                    />
                </Box>
                <HStack spacing={1}>
                    <Text fontSize="sm" color={textSub}>
                        Annual
                    </Text>
                    <Badge
                        colorScheme="green"
                        fontSize="10px"
                        borderRadius="full"
                    >
                        Save 20%
                    </Badge>
                </HStack>
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
                    const price =
                        isAnnual && tier.monthlyPrice
                            ? Math.round(tier.monthlyPrice * 0.8)
                            : tier.monthlyPrice;

                    return (
                        <Box
                            key={tier.id}
                            position="relative"
                            bg={
                                isSelected
                                    ? isDark
                                        ? "linear-gradient(145deg, #0d2b22 0%, #0a1f1a 100%)"
                                        : "linear-gradient(145deg, #f0fdf8 0%, #dcfcf0 100%)"
                                    : tier.popular
                                      ? isDark
                                          ? "linear-gradient(145deg, #0f2920 0%, #0d1f18 100%)"
                                          : "linear-gradient(145deg, #f7fdfb 0%, #edfaf4 100%)"
                                      : cardBg
                            }
                            border="2px solid"
                            borderColor={
                                isSelected
                                    ? "green.500"
                                    : tier.popular
                                      ? isDark
                                          ? "green.700"
                                          : "green.200"
                                      : cardBorder
                            }
                            borderRadius="8px"
                            p={5}
                            cursor="pointer"
                            transition="all 0.18s ease"
                            onClick={() => onSelectTier(tier.id)}
                            boxShadow={
                                isSelected
                                    ? "0 0 0 1px var(--chakra-colors-green-500), 0 8px 32px rgba(52,211,169,0.2)"
                                    : tier.popular
                                      ? isDark
                                          ? "0 4px 20px rgba(52,211,169,0.08)"
                                          : "0 4px 20px rgba(52,211,169,0.1)"
                                      : "0 2px 8px rgba(0,0,0,0.05)"
                            }
                            _hover={{
                                bg: isDark
                                    ? "linear-gradient(145deg, #0f2e24 0%, #0b2119 100%)"
                                    : "linear-gradient(145deg, #f0fdf8 0%, #d4f9e8 100%)",
                                borderColor: "green.400",
                                transform: "translateY(-2px)",
                                boxShadow: "0 8px 32px rgba(52,211,169,0.18)",
                            }}
                        >
                            {tier.popular && (
                                <Box
                                    position="absolute"
                                    top="-12px"
                                    left="50%"
                                    transform="translateX(-50%)"
                                    bg="green.500"
                                    color="white"
                                    px={3}
                                    py="2px"
                                    borderRadius="full"
                                    fontSize="10px"
                                    zIndex={10000}
                                    fontWeight={700}
                                    letterSpacing="0.06em"
                                    textTransform="uppercase"
                                    whiteSpace="nowrap"
                                >
                                    Most popular
                                </Box>
                            )}

                            {isSelected && (
                                <Box
                                    position="absolute"
                                    top={3}
                                    right={3}
                                    w="20px"
                                    h="20px"
                                    borderRadius="full"
                                    bg="green.500"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Check
                                        size={12}
                                        color="white"
                                        strokeWidth={3}
                                    />
                                </Box>
                            )}

                            <VStack align="start" spacing={4}>
                                <HStack spacing={2}>
                                    <Box
                                        w="32px"
                                        h="32px"
                                        borderRadius="8px"
                                        bg={isDark ? "grey.800" : "green.50"}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Icon
                                            as={tier.icon}
                                            boxSize={4}
                                            color={
                                                isDark
                                                    ? "green.400"
                                                    : "green.600"
                                            }
                                        />
                                    </Box>
                                    <Text
                                        fontSize="sm"
                                        fontWeight={700}
                                        color={textMain}
                                        letterSpacing="-0.01em"
                                    >
                                        {tier.name}
                                    </Text>
                                </HStack>

                                <Box>
                                    {tier.monthlyPrice === null ? (
                                        <Text
                                            fontSize="2xl"
                                            fontWeight={800}
                                            color={textMain}
                                            letterSpacing="-0.03em"
                                        >
                                            Custom
                                        </Text>
                                    ) : (
                                        <HStack align="baseline" spacing={1}>
                                            <Text
                                                fontSize="2xl"
                                                fontWeight={800}
                                                color={textMain}
                                                letterSpacing="-0.03em"
                                            >
                                                {tier.monthlyPrice === 0
                                                    ? "Free"
                                                    : `€${price}`}
                                            </Text>
                                            {tier.monthlyPrice > 0 && (
                                                <Text
                                                    fontSize="xs"
                                                    color={textSub}
                                                >
                                                    /mo
                                                </Text>
                                            )}
                                        </HStack>
                                    )}
                                    <Text
                                        fontSize="11px"
                                        color={textSub}
                                        mt={0.5}
                                        lineHeight={1.4}
                                    >
                                        {tier.description}
                                    </Text>
                                </Box>

                                <Divider
                                    borderColor={
                                        isDark ? "grey.700" : "grey.100"
                                    }
                                />
                                <Button
                                    w="100%"
                                    size="sm"
                                    bg={
                                        isSelected ? "green.500" : "transparent"
                                    }
                                    color={
                                        isSelected
                                            ? "white"
                                            : isDark
                                              ? "green.400"
                                              : "green.600"
                                    }
                                    border="1px solid"
                                    borderColor={
                                        isSelected
                                            ? "green.500"
                                            : isDark
                                              ? "green.700"
                                              : "green.300"
                                    }
                                    borderRadius="10px"
                                    fontSize="12px"
                                    fontWeight={600}
                                    _hover={{
                                        bg: isSelected
                                            ? "green.600"
                                            : isDark
                                              ? "green.900"
                                              : "green.50",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectTier(tier.id);
                                    }}
                                >
                                    {tier.cta}
                                </Button>

                                <VStack align="start" spacing={1.5} w="100%">
                                    {tier.features.map((f) => (
                                        <HStack
                                            key={f}
                                            spacing={2}
                                            align="center"
                                        >
                                            <Box
                                                flexShrink={0}
                                                p="1"
                                                mt="2px"
                                                bg="rgba(94, 255, 175, 0.1)"
                                                borderRadius="999px"
                                            >
                                                <Check
                                                    size={12}
                                                    color="#34D3A9"
                                                    strokeWidth={3}
                                                />
                                            </Box>
                                            <Text
                                                fontSize="11px"
                                                color={
                                                    isDark
                                                        ? "grey.100"
                                                        : "grey.800"
                                                }
                                                lineHeight={1.4}
                                            >
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

            <Box
                bg={cardBg}
                border="1px solid"
                borderColor={isDark ? "grey.700" : "grey.100"}
                borderRadius="8px"
                p={6}
            >
                <HStack justify="space-between" mb={6} flexWrap="wrap" gap={3}>
                    <VStack align="start" spacing={0}>
                        <Text fontSize="md" fontWeight={700} color={textMain}>
                            Top up credits
                        </Text>
                        <Text fontSize="xs" color={textSub}>
                            Add credits anytime — shared across all your
                            assistants
                        </Text>
                    </VStack>
                    <HStack
                        bg={isDark ? "grey.800" : "green.50"}
                        borderRadius="8px"
                        px={4}
                        py={2}
                        border="1px solid"
                        borderColor={isDark ? "grey.700" : "green.100"}
                    >
                        <Text
                            fontSize="2xl"
                            fontWeight={800}
                            color={isDark ? "green.400" : "green.600"}
                            letterSpacing="-0.03em"
                        >
                            {selectedCredits.toLocaleString()}
                        </Text>
                        <Text fontSize="sm" color={textSub} fontWeight={500}>
                            credits
                        </Text>
                    </HStack>
                </HStack>

                {/* Slider */}
                <Box px={2} mb={6}>
                    <Slider
                        min={0}
                        max={CREDIT_STEPS.length - 1}
                        step={1}
                        value={creditSliderIndex}
                        onChange={onSliderChange}
                        focusThumbOnChange={false}
                    >
                        <SliderTrack
                            h="6px"
                            borderRadius="full"
                            bg={isDark ? "grey.700" : "grey.200"}
                        >
                            <SliderFilledTrack
                                bg="linear-gradient(90deg, #34D3A9, #12B98C)"
                                borderRadius="full"
                            />
                        </SliderTrack>
                        <SliderThumb
                            w="22px"
                            h="22px"
                            boxShadow="0 2px 8px rgba(52,211,169,0.4)"
                            border="2px solid"
                            borderColor="green.400"
                        >
                            <Box
                                w="8px"
                                h="8px"
                                borderRadius="full"
                                bg="green.400"
                            />
                        </SliderThumb>
                    </Slider>

                    <HStack justify="space-between" mt={2}>
                        {CREDIT_STEPS.map((step, i) => (
                            <Text
                                key={step}
                                fontSize="9px"
                                color={
                                    i === creditSliderIndex
                                        ? isDark
                                            ? "green.400"
                                            : "green.600"
                                        : textSub
                                }
                                fontWeight={i === creditSliderIndex ? 700 : 400}
                                transition="color 0.15s"
                            >
                                {step >= 1000 ? `${step / 1000}k` : step}
                            </Text>
                        ))}
                    </HStack>
                </Box>

                <HStack
                    justify="space-between"
                    align="center"
                    flexWrap="wrap"
                    gap={4}
                >
                    <VStack align="start" spacing={0}>
                        <HStack align="baseline" spacing={1}>
                            <Text
                                fontSize="3xl"
                                fontWeight={800}
                                color={isDark ? "green.400" : "green.600"}
                                letterSpacing="-0.03em"
                            >
                                €{creditPrice}
                            </Text>
                            <Text fontSize="sm" color={textSub}>
                                one-time
                            </Text>
                        </HStack>
                        <Text fontSize="xs" color={textSub}>
                            €{CREDIT_PRICE_PER_UNIT} per credit · no expiry
                        </Text>
                    </VStack>

                    <Button
                        bg="green.500"
                        color="white"
                        borderRadius="8px"
                        px={8}
                        h="44px"
                        fontWeight={700}
                        fontSize="sm"
                        isDisabled={!hasPaymentMethod}
                        isLoading={isPurchasing}
                        loadingText="Processing..."
                        onClick={onPurchase}
                        _hover={{
                            bg: "green.600",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 16px rgba(52,211,169,0.3)",
                        }}
                        _active={{ transform: "translateY(0)" }}
                        transition="all 0.15s"
                    >
                        Buy {selectedCredits.toLocaleString()} credits
                    </Button>
                </HStack>

                {!hasPaymentMethod && (
                    <Text
                        fontSize="xs"
                        color={isDark ? "orange.400" : "orange.500"}
                        mt={3}
                    >
                        Add a payment method in the &quot;Payment methods&quot;
                        tab to buy credits.
                    </Text>
                )}
            </Box>
        </VStack>
    );
};

interface PaymentMethodsTabProps {
    isDark: boolean;
    paymentMethods: {
        id: string;
        last4: string;
        brand: string;
        expiry: string;
    }[];
    onRemoveCard: (id: string) => void;
    isAddingCard: boolean;
    setIsAddingCard: (v: boolean) => void;
}

import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe("pk_test_xxxxxxxxx");

import {
    PaymentElement,
    useStripe,
    useElements,
    Elements,
} from "@stripe/react-stripe-js";

const PaymentMethodsTab = ({
    isDark,
    paymentMethods,
    onRemoveCard,
    isAddingCard,
    setIsAddingCard,
}: PaymentMethodsTabProps) => {
    const cardBg = isDark ? "grey.900" : "white";
    const cardBorder = isDark ? "grey.700" : "grey.100";
    const textMain = isDark ? "grey.100" : "grey.900";
    const textSub = isDark ? "grey.400" : "grey.500";

    return (
        <Elements stripe={stripePromise}>
            <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                        <Text fontSize="md" fontWeight={700} color={textMain}>
                            Saved cards
                        </Text>
                        <Text fontSize="xs" color={textSub}>
                            {paymentMethods.length} card
                            {paymentMethods.length !== 1 ? "s" : ""} saved
                        </Text>
                    </VStack>
                    {!isAddingCard && (
                        <Button
                            size="sm"
                            bg="green.500"
                            color="white"
                            borderRadius="10px"
                            fontWeight={600}
                            _hover={{ bg: "green.600" }}
                            onClick={() => setIsAddingCard(true)}
                        >
                            + Add card
                        </Button>
                    )}
                </HStack>

                {paymentMethods.length === 0 && !isAddingCard && (
                    <Box
                        bg={cardBg}
                        border="1px dashed"
                        borderColor={isDark ? "grey.600" : "grey.300"}
                        borderRadius="8px"
                        p={8}
                        textAlign="center"
                    >
                        <Text fontSize="sm" color={textSub}>
                            No payment methods saved yet.
                        </Text>
                    </Box>
                )}

                {paymentMethods.map((pm) => (
                    <HStack
                        key={pm.id}
                        bg={cardBg}
                        border="1px solid"
                        borderColor={cardBorder}
                        borderRadius="14px"
                        p={4}
                        justify="space-between"
                    >
                        <HStack spacing={3}>
                            <Box
                                w="40px"
                                h="40px"
                                borderRadius="10px"
                                bg={isDark ? "grey.800" : "grey.100"}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <CreditCard
                                    size={18}
                                    color={isDark ? "#34D3A9" : "#12B98C"}
                                />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text
                                    fontSize="sm"
                                    fontWeight={600}
                                    color={textMain}
                                >
                                    {pm.brand} •••• {pm.last4}
                                </Text>
                                <Text fontSize="xs" color={textSub}>
                                    Expires {pm.expiry}
                                </Text>
                            </VStack>
                        </HStack>
                        <Button
                            size="sm"
                            variant="ghost"
                            color={isDark ? "red.400" : "red.500"}
                            _hover={{ bg: isDark ? "red.900" : "red.50" }}
                            leftIcon={<Trash2 size={14} />}
                            onClick={() => onRemoveCard(pm.id)}
                        >
                            Remove
                        </Button>
                    </HStack>
                ))}

                {isAddingCard && (
                    <AddCardForm
                        isDark={isDark}
                        onClose={() => setIsAddingCard(false)}
                    />
                )}
            </VStack>
        </Elements>
    );
};

const AddCardForm = ({
    isDark,
    onClose,
}: {
    isDark: boolean;
    onClose: () => void;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const {
        handleSubmit,
        register,
        formState: { isSubmitting },
    } = useForm<{ name: string }>();

    const onSubmit = handleSubmit(async ({ name }) => {
        if (!stripe || !elements) return;
        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                payment_method_data: { billing_details: { name } },
            },
            redirect: "if_required",
        });
        if (error) {
            console.error(error.message);
            return;
        }
        onClose();
    });

    return (
        <Box
            bg={isDark ? "grey.900" : "white"}
            border="1px solid"
            borderColor={isDark ? "grey.700" : "green.200"}
            borderRadius="8px"
            p={5}
        >
            <Text
                fontSize="sm"
                fontWeight={700}
                color={isDark ? "grey.100" : "grey.900"}
                mb={4}
            >
                New payment method
            </Text>
            <chakra.form onSubmit={onSubmit}>
                <VStack spacing={4}>
                    <FormControl>
                        <FormLabel
                            fontSize="xs"
                            fontWeight={600}
                            color={isDark ? "grey.400" : "grey.600"}
                        >
                            Cardholder name
                        </FormLabel>
                        <Input
                            placeholder="Jean Dupont"
                            {...register("name", { required: true })}
                            bg={isDark ? "grey.800" : "white"}
                            borderColor={isDark ? "grey.600" : "grey.200"}
                            borderRadius="10px"
                            fontSize="sm"
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel
                            fontSize="xs"
                            fontWeight={600}
                            color={isDark ? "grey.400" : "grey.600"}
                        >
                            Card details
                        </FormLabel>
                        <Box
                            p={3}
                            border="1px solid"
                            borderRadius="10px"
                            borderColor={isDark ? "grey.600" : "grey.200"}
                            bg={isDark ? "grey.800" : "white"}
                        >
                            <PaymentElement />
                        </Box>
                    </FormControl>
                    <HStack w="100%" spacing={3} pt={2}>
                        <Button
                            bg="green.500"
                            color="white"
                            borderRadius="10px"
                            fontWeight={600}
                            fontSize="sm"
                            type="submit"
                            isLoading={isSubmitting}
                            _hover={{ bg: "green.600" }}
                            leftIcon={<Check size={14} />}
                        >
                            Save card
                        </Button>
                        <Button
                            variant="ghost"
                            fontSize="sm"
                            onClick={onClose}
                            color={isDark ? "grey.400" : "grey.600"}
                        >
                            Cancel
                        </Button>
                    </HStack>
                </VStack>
            </chakra.form>
        </Box>
    );
};
