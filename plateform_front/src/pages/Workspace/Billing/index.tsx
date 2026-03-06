import {
    VStack,
    HStack,
    Box,
    Text,
    Button,
    useColorMode,
    Card,
    CardBody,
    Grid,
    Input,
    InputGroup,
    InputLeftElement,
    FormControl,
    FormLabel,
    MenuItem,
    Modal,
    ModalContent,
    ModalOverlay,
    ModalHeader,
    chakra,
} from "@chakra-ui/react";
import React, { ReactElement, useState } from "react";
import WorkspaceHeader from "components/Molecules/WorkspaceHeader";
import {
    CreditCard,
    Wallet,
    Plus,
    Coins,
    Check,
    Trash2,
    Zap,
} from "lucide-react";
import useThemedToast from "hooks/useThemedToast";
import { useForm } from "react-hook-form";

enum BillingTab {
    OVERVIEW = "overview",
    PAYMENT_METHODS = "paymentMethods",
}

const CREDIT_PACKAGES = [
    { id: "100", credits: 100, price: 9.99, popular: false },
    { id: "500", credits: 500, price: 39.99, popular: true },
    { id: "1000", credits: 1000, price: 69.99, popular: false },
    { id: "5000", credits: 5000, price: 299.99, popular: false },
];

export const BillingWorkspace = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const toast = useThemedToast();
    const [selectedTab, setSelectedTab] = useState<BillingTab>(
        BillingTab.OVERVIEW,
    );

    const [balance, setBalance] = useState(250);
    const [paymentMethods, setPaymentMethods] = useState([
        { id: "1", last4: "4242", brand: "Visa", expiry: "12/26" },
    ]);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

    const handleRemoveCard = (id: string) => {
        setPaymentMethods(paymentMethods.filter((p) => p.id !== id));
        toast({
            title: "Carte supprimée",
            status: "success",
            duration: 2000,
        });
    };

    const handlePurchaseCredits = async (packageId: string) => {
        const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
        if (!pkg || paymentMethods.length === 0) return;

        setIsPurchasing(packageId);
        await new Promise((r) => setTimeout(r, 1500));
        setBalance((b) => b + pkg.credits);
        setIsPurchasing(null);
        toast({
            title: "Credits added",
            description: `${pkg.credits} credits have been added to your balance`,
            status: "success",
            duration: 3000,
        });
    };

    const tabButton = (tab: BillingTab, label: string, icon: ReactElement) => (
        <Button
            size="md"
            variant="ghost"
            borderBottom="2px solid"
            borderColor={selectedTab === tab ? "green.500" : "transparent"}
            borderRadius="0"
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
            _hover={{ bg: isDark ? "grey.900" : "white" }}
        >
            {label}
        </Button>
    );

    return (
        <VStack
            w="100%"
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
        >
            <WorkspaceHeader
                title="Billing"
                description="Manage your credit balance and payment methods to use your deployed assistants."
            />
            <HStack
                borderBottom="1px solid"
                borderColor={isDark ? "grey.700" : "grey.100"}
                w="100%"
                spacing={0}
                px={6}
                pt={2}
                pl={0}
                bg={isDark ? "grey.950" : "white"}
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
                            creditPackages={CREDIT_PACKAGES}
                            paymentMethods={paymentMethods}
                            onPurchase={handlePurchaseCredits}
                            isPurchasing={isPurchasing}
                        />
                    )}
                    {selectedTab === BillingTab.PAYMENT_METHODS && (
                        <Elements stripe={stripePromise}>
                            <PaymentMethodsTab
                                isDark={isDark}
                                onAddCard={() => {}}
                                paymentMethods={paymentMethods}
                                onRemoveCard={handleRemoveCard}
                                isAddingCard={isAddingCard}
                                setIsAddingCard={setIsAddingCard}
                            />
                        </Elements>
                    )}
                </Box>
            </VStack>
        </VStack>
    );
};

interface OverviewTabProps {
    isDark: boolean;
    balance: number;
    creditPackages: typeof CREDIT_PACKAGES;
    paymentMethods: {
        id: string;
        last4: string;
        brand: string;
        expiry: string;
    }[];
    onPurchase: (id: string) => void;
    isPurchasing: string | null;
}

const OverviewTab = ({
    isDark,
    balance,
    creditPackages,
    paymentMethods,
    onPurchase,
    isPurchasing,
}: OverviewTabProps) => (
    <VStack w="100%" spacing={8} align="stretch">
        <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={6} w="100%">
            <Card
                bg={isDark ? "grey.900" : "green.50"}
                borderRadius="16px"
                border="1px solid"
                borderColor={isDark ? "grey.700" : "green.200"}
                overflow="hidden"
            >
                <CardBody p={0}>
                    <HStack spacing={3} mb={4}>
                        <Box
                            p={2}
                            borderRadius="12px"
                            bg={isDark ? "grey.800" : "green.100"}
                        >
                            <Coins
                                size={24}
                                color={isDark ? "#34D3A9" : "#12B98C"}
                            />
                        </Box>
                        <Text
                            fontSize="sm"
                            fontWeight="600"
                            color={isDark ? "grey.300" : "grey.600"}
                        >
                            Current balance
                        </Text>
                    </HStack>
                    <Text
                        fontSize="3xl"
                        fontWeight="700"
                        color={isDark ? "grey.100" : "grey.900"}
                    >
                        {balance.toLocaleString()} credits
                    </Text>
                    <Text
                        fontSize="sm"
                        color={isDark ? "grey.400" : "grey.600"}
                        mt={2}
                    >
                        Used for the conversations of your deployed assistants
                    </Text>
                </CardBody>
            </Card>

            <Card
                bg={isDark ? "grey.900" : "white"}
                borderRadius="16px"
                border="1px solid"
                borderColor={isDark ? "grey.700" : "grey.100"}
            >
                <CardBody p={0}>
                    <HStack spacing={2} mb={4}>
                        <Zap size={20} color={isDark ? "#34D3A9" : "#12B98C"} />
                        <Text
                            fontSize="lg"
                            fontWeight="600"
                            color={isDark ? "grey.100" : "grey.900"}
                        >
                            How does it work?
                        </Text>
                    </HStack>
                    <VStack align="stretch" spacing={2}>
                        <Text
                            fontSize="sm"
                            color={isDark ? "grey.300" : "grey.600"}
                        >
                            • Each message exchanged with a deployed assistant
                            consumes credits
                        </Text>
                        <Text
                            fontSize="sm"
                            color={isDark ? "grey.300" : "grey.600"}
                        >
                            • Add credits at any time to continue using your
                            assistants
                        </Text>
                        <Text
                            fontSize="sm"
                            color={isDark ? "grey.300" : "grey.600"}
                        >
                            • Your balance is shared between all your workspaces
                        </Text>
                    </VStack>
                </CardBody>
            </Card>
        </Grid>

        <Box>
            <Text
                fontSize="lg"
                fontWeight="600"
                color={isDark ? "grey.100" : "grey.900"}
                mb={4}
            >
                Buy credits
            </Text>
            {paymentMethods.length === 0 ? (
                <Card
                    bg={isDark ? "grey.900" : "grey.50"}
                    borderRadius="12px"
                    border="1px dashed"
                    borderColor={isDark ? "grey.600" : "grey.300"}
                >
                    <CardBody p={0}>
                        <Text
                            fontSize="sm"
                            color={isDark ? "grey.400" : "grey.600"}
                        >
                            Add a payment method in the &quot;Payment
                            Methods&quot; tab to be able to buy credits.
                        </Text>
                    </CardBody>
                </Card>
            ) : (
                <Grid
                    templateColumns={{
                        base: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(4, 1fr)",
                    }}
                    gap={4}
                >
                    {creditPackages.map((pkg) => (
                        <Card
                            key={pkg.id}
                            bg={isDark ? "grey.900" : "white"}
                            borderRadius="16px"
                            border="1px solid"
                            borderColor={
                                pkg.popular
                                    ? "green.500"
                                    : isDark
                                      ? "grey.700"
                                      : "grey.100"
                            }
                            position="relative"
                            _hover={{
                                borderColor: "green.500",
                                borderWidth: "2px",
                            }}
                            transition="all 0.2s"
                        >
                            {pkg.popular && (
                                <Box
                                    position="absolute"
                                    top={-2}
                                    left="50%"
                                    transform="translateX(-50%)"
                                    bg="green.500"
                                    color="white"
                                    px={3}
                                    py={0.5}
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="600"
                                >
                                    Popular
                                </Box>
                            )}
                            <CardBody p={0}>
                                <VStack align="stretch" spacing={4}>
                                    <HStack>
                                        <Text
                                            fontSize="2xl"
                                            fontWeight="700"
                                            color={
                                                isDark ? "grey.100" : "grey.900"
                                            }
                                        >
                                            {pkg.credits.toLocaleString()}
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            color={
                                                isDark ? "grey.400" : "grey.600"
                                            }
                                        >
                                            credits
                                        </Text>
                                    </HStack>
                                    <Text
                                        fontSize="xl"
                                        fontWeight="700"
                                        color="green.500"
                                    >
                                        {pkg.price.toFixed(2)} €
                                    </Text>
                                    <Button
                                        variant="superSecondary"
                                        size="sm"
                                        w="100%"
                                        leftIcon={<Plus size={16} />}
                                        onClick={() => onPurchase(pkg.id)}
                                        isLoading={isPurchasing === pkg.id}
                                    >
                                        Buy
                                    </Button>
                                </VStack>
                            </CardBody>
                        </Card>
                    ))}
                </Grid>
            )}
        </Box>
    </VStack>
);

import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_xxxxxxxxx");

interface PaymentMethodsTabProps {
    isDark: boolean;
    paymentMethods: {
        id: string;
        last4: string;
        brand: string;
        expiry: string;
    }[];
    onAddCard: () => void;
    onRemoveCard: (id: string) => void;
    isAddingCard: boolean;
    setIsAddingCard: (v: boolean) => void;
}

import {
    PaymentElement,
    useStripe,
    useElements,
    Elements,
} from "@stripe/react-stripe-js";

const PaymentMethodsTab = ({
    isDark,
    paymentMethods,
    onAddCard,
    onRemoveCard,
    isAddingCard,
    setIsAddingCard,
}: PaymentMethodsTabProps) => {
    const stripe = useStripe();
    const elements = useElements();

    const {
        handleSubmit,
        register,
        formState: { isSubmitting },
    } = useForm<{ name: string }>();

    const handleCloseAddCard = () => {
        setIsAddingCard(false);
    };

    const onSubmit = handleSubmit(async ({ name }) => {
        if (!stripe || !elements) return;

        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                payment_method_data: {
                    billing_details: {
                        name,
                    },
                },
            },
            redirect: "if_required",
        });

        if (error) {
            console.error(error.message);
            return;
        }

        onAddCard();
        handleCloseAddCard();
    });

    return (
        <VStack w="100%" spacing={6} align="stretch">
            <HStack justify="space-between">
                <Text
                    fontSize="lg"
                    fontWeight="600"
                    color={isDark ? "grey.100" : "grey.900"}
                >
                    Saved cards
                </Text>

                {!isAddingCard && (
                    <Button
                        leftIcon={<Plus size={16} />}
                        colorScheme="green"
                        size="sm"
                        onClick={() => setIsAddingCard(true)}
                    >
                        Add a card
                    </Button>
                )}
            </HStack>

            {paymentMethods.map((pm) => (
                <Card
                    key={pm.id}
                    bg={isDark ? "grey.900" : "white"}
                    borderRadius="12px"
                    border="1px solid"
                    borderColor={isDark ? "grey.700" : "grey.100"}
                >
                    <CardBody py={4}>
                        <HStack justify="space-between">
                            <HStack spacing={4}>
                                <Box
                                    p={2}
                                    borderRadius="8px"
                                    bg={isDark ? "grey.800" : "grey.100"}
                                >
                                    <CreditCard
                                        size={20}
                                        color={isDark ? "#34D3A9" : "#12B98C"}
                                    />
                                </Box>

                                <VStack align="start" spacing={0}>
                                    <Text
                                        fontSize="sm"
                                        fontWeight="600"
                                        color={isDark ? "grey.100" : "grey.900"}
                                    >
                                        {pm.brand} •••• {pm.last4}
                                    </Text>

                                    <Text
                                        fontSize="xs"
                                        color={isDark ? "grey.400" : "grey.600"}
                                    >
                                        Expires {pm.expiry}
                                    </Text>
                                </VStack>
                            </HStack>

                            <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                leftIcon={<Trash2 size={14} />}
                                onClick={() => onRemoveCard(pm.id)}
                            >
                                Delete
                            </Button>
                        </HStack>
                    </CardBody>
                </Card>
            ))}

            {isAddingCard && (
                <Modal
                    isOpen={isAddingCard}
                    onClose={handleCloseAddCard}
                    isCentered
                >
                    <ModalOverlay />

                    <ModalContent
                        bg={isDark ? "grey.900" : "white"}
                        borderRadius="16px"
                        border="1px solid"
                        borderColor={isDark ? "grey.700" : "green.200"}
                        p={6}
                        gap={6}
                    >
                        <chakra.form onSubmit={onSubmit}>
                            <ModalHeader p={0}>
                                <Text
                                    fontSize="lg"
                                    fontWeight="600"
                                    color={isDark ? "grey.100" : "grey.900"}
                                    mb="2"
                                >
                                    New Payment Method
                                </Text>

                                <Text>
                                    Add a payment method to your account to
                                    start your subscription.
                                </Text>
                            </ModalHeader>

                            <FormControl mb={4}>
                                <FormLabel fontSize="sm">
                                    Cardholder name
                                </FormLabel>

                                <Input
                                    placeholder="Jean Dupont"
                                    {...register("name", { required: true })}
                                    bg={isDark ? "grey.800" : "white"}
                                    borderColor={
                                        isDark ? "grey.600" : "grey.100"
                                    }
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm">
                                    Card details
                                </FormLabel>

                                <Box
                                    p={3}
                                    border="1px solid"
                                    borderRadius="8px"
                                    borderColor={
                                        isDark ? "grey.600" : "grey.200"
                                    }
                                    bg={isDark ? "grey.800" : "white"}
                                >
                                    <PaymentElement />
                                </Box>
                            </FormControl>

                            <HStack spacing={3} pt={6}>
                                <Button
                                    colorScheme="green"
                                    leftIcon={<Check size={16} />}
                                    type="submit"
                                    isLoading={isSubmitting}
                                >
                                    Save card
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={handleCloseAddCard}
                                >
                                    Cancel
                                </Button>
                            </HStack>
                        </chakra.form>
                    </ModalContent>
                </Modal>
            )}
        </VStack>
    );
};
