import React from "react";
import {
    Box,
    HStack,
    Stack,
    Text,
    VStack,
    useColorMode,
} from "@chakra-ui/react";
import { ArrowUpRight, Settings } from "lucide-react";
import Button from "components/System/Atoms/Button";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

const TIER_DATA: Record<
    string,
    {
        displayName: string;
        total: number;
        used: number;
        monthlyCost: number | null;
        topUps: number;
        renewalDate: string;
        cycleStart: string;
        resetDays: number;
    }
> = {
    free: {
        displayName: "Découverte",
        total: 150,
        used: 80,
        monthlyCost: 0,
        topUps: 0,
        renewalDate: "21 mai 2026",
        cycleStart: "21 avr.",
        resetDays: 13,
    },
    pro: {
        displayName: "Pro",
        total: 3000,
        used: 1200,
        monthlyCost: 29,
        topUps: 200,
        renewalDate: "21 mai 2026",
        cycleStart: "21 avr.",
        resetDays: 13,
    },
    business: {
        displayName: "Business",
        total: 5000,
        used: 2418,
        monthlyCost: 79,
        topUps: 612,
        renewalDate: "21 mai 2026",
        cycleStart: "21 avr.",
        resetDays: 13,
    },
    enterprise: {
        displayName: "Enterprise",
        total: 20000,
        used: 8500,
        monthlyCost: null,
        topUps: 1200,
        renewalDate: "21 mai 2026",
        cycleStart: "21 avr.",
        resetDays: 13,
    },
};

const DonutChart: React.FC<{ remaining: number; percentage: number }> = ({
    remaining,
    percentage,
}) => {
    const size = 130;
    const center = size / 2;
    const radius = 47;
    const stroke = 12;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage / 100);

    return (
        <Box position="relative" w={`${size}px`} h={`${size}px`} flexShrink={0}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ transform: "rotate(-90deg)" }}
            >
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={stroke}
                />
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={currentDarkTheme.rgba.primary}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                textAlign="center"
                w="80px"
            >
                <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color={currentDarkTheme.primary}
                    lineHeight={1.1}
                >
                    {remaining.toLocaleString("fr-FR")}
                </Text>
                <Text
                    fontSize="8px"
                    color="grey.500"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    mt={0.5}
                >
                    restants
                </Text>
                <Text
                    fontSize="10px"
                    color={currentDarkTheme.primary}
                    fontWeight="semibold"
                    mt={0.5}
                >
                    {percentage}% restants
                </Text>
            </Box>
        </Box>
    );
};

interface PlanCardProps {
    tier: string;
}

const PlanCard: React.FC<PlanCardProps> = ({ tier }) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const data = TIER_DATA[tier] ?? TIER_DATA.business;
    const remaining = data.total - data.used;
    const percentage = Math.round((remaining / data.total) * 100);
    const progress = (data.used / data.total) * 100;
    const sub = isDark ? "grey.400" : "grey.500";
    const border = isDark ? "grey.700" : "grey.200";

    return (
        <Box
            bg={isDark ? "grey.950" : "white"}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            p={5}
            h="100%"
        >
            <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
                <VStack align="start" spacing={0.5}>
                    <Text
                        fontSize="9px"
                        letterSpacing="wider"
                        textTransform="uppercase"
                        color={sub}
                    >
                        Plan actuel
                    </Text>
                    <HStack spacing={2}>
                        <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color={isDark ? "white" : "grey.900"}
                        >
                            {data.displayName}
                        </Text>
                        <HStack
                            bg="rgba(52,211,169,0.12)"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            spacing={1}
                        >
                            <Box
                                w={1.5}
                                h={1.5}
                                borderRadius="full"
                                bg={currentDarkTheme.primary}
                            />
                            <Text
                                fontSize="xs"
                                color={currentDarkTheme.primary}
                                fontWeight="semibold"
                            >
                                Actif
                            </Text>
                        </HStack>
                    </HStack>
                    <Text fontSize="xs" color={sub}>
                        Renouvellement le {data.renewalDate} · mensuel
                    </Text>
                </VStack>
                <HStack spacing={2}>
                    <Button variant="secondary" size="sm" leftIcon={Settings}>
                        Gérer
                    </Button>
                    <Button size="sm" leftIcon={ArrowUpRight}>
                        Upgrade
                    </Button>
                </HStack>
            </HStack>

            <Stack
                direction={{ base: "column", sm: "row" }}
                spacing={5}
                align={{ base: "center", sm: "start" }}
            >
                <DonutChart remaining={remaining} percentage={percentage} />

                <VStack flex={1} align="stretch" spacing={3} minW={0}>
                    <Box>
                        <Text
                            fontSize="9px"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            color={sub}
                            mb={1}
                        >
                            Crédits du cycle
                        </Text>
                        <HStack align="baseline" spacing={1} mb={1.5}>
                            <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color={isDark ? "white" : "grey.900"}
                            >
                                {data.used.toLocaleString("fr-FR")}
                            </Text>
                            <Text fontSize="xs" color={sub}>
                                / {data.total.toLocaleString("fr-FR")} consommés
                            </Text>
                        </HStack>
                        <Box
                            h="5px"
                            bg={isDark ? "grey.700" : "grey.200"}
                            borderRadius="full"
                            overflow="hidden"
                        >
                            <Box
                                h="5px"
                                w={`${progress}%`}
                                bgGradient="linear(to-r, green.400, green.600)"
                                borderRadius="full"
                                transition="width 0.5s"
                            />
                        </Box>
                        <HStack justify="space-between" mt={1}>
                            <Text fontSize="10px" color={sub}>
                                Cycle commencé le {data.cycleStart}
                            </Text>
                            <Text fontSize="10px" color={sub}>
                                Reset dans {data.resetDays} jours
                            </Text>
                        </HStack>
                    </Box>

                    <HStack
                        spacing={0}
                        pt={3}
                        borderTop="1px solid"
                        borderColor={border}
                        align="start"
                    >
                        <VStack align="start" spacing={0} flex={1}>
                            <Text
                                fontSize="8px"
                                textTransform="uppercase"
                                letterSpacing="wider"
                                color={sub}
                            >
                                Top-ups
                            </Text>
                            <Text
                                fontSize="md"
                                fontWeight="bold"
                                color={isDark ? "white" : "grey.900"}
                            >
                                {data.topUps}
                            </Text>
                            <Text fontSize="10px" color={sub}>
                                non expirables
                            </Text>
                        </VStack>
                        <VStack align="start" spacing={0} flex={1}>
                            <Text
                                fontSize="8px"
                                textTransform="uppercase"
                                letterSpacing="wider"
                                color={sub}
                            >
                                Coût ce mois
                            </Text>
                            <Text
                                fontSize="md"
                                fontWeight="bold"
                                color={isDark ? "white" : "grey.900"}
                            >
                                {data.monthlyCost !== null
                                    ? `${data.monthlyCost} €`
                                    : "—"}
                            </Text>
                            <Text fontSize="10px" color={sub}>
                                {data.displayName} mensuel
                            </Text>
                        </VStack>
                    </HStack>
                </VStack>
            </Stack>
        </Box>
    );
};

export default PlanCard;
