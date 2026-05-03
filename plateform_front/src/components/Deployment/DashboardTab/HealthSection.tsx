import {
    Box,
    Grid,
    GridItem,
    HStack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    Activity,
    AlertTriangle,
    Clock,
    Coins,
    ExternalLink,
    MessageSquare,
    ThumbsUp,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Sparkline } from "components/Deployment/Sparkline";
import Button from "components/System/Atoms/Button";

export interface HealthStat {
    label: string;
    value: string;
    sub: string;
    data: number[];
    icon: LucideIcon;
}

const HEALTH_STATS: HealthStat[] = [
    {
        label: "DISPONIBILITÉ",
        value: "99.98%",
        sub: "30 derniers jours",
        data: [98.1, 99.0, 99.4, 99.6, 99.7, 99.9, 99.98],
        icon: Activity,
    },
    {
        label: "LATENCE P95",
        value: "1.2s",
        sub: "stable",
        data: [1.7, 1.5, 1.4, 1.3, 1.4, 1.2, 1.2],
        icon: Clock,
    },
    {
        label: "CONVERSATIONS/24H",
        value: "1 842",
        sub: "+12% vs hier",
        data: [1180, 1390, 1540, 1680, 1740, 1820, 1842],
        icon: MessageSquare,
    },
    {
        label: "COÛT QUOTIDIEN",
        value: "€47.20",
        sub: "0.0023 €/req",
        data: [34, 38, 41, 44, 45.5, 46.8, 47.2],
        icon: Coins,
    },
    {
        label: "SATISFACTION",
        value: "94%",
        sub: "2 pts",
        data: [87, 89, 90, 91, 92, 93, 94],
        icon: ThumbsUp,
    },
    {
        label: "TAUX D'ERREUR",
        value: "0.2%",
        sub: "sain",
        data: [0.9, 0.7, 0.5, 0.4, 0.3, 0.25, 0.2],
        icon: AlertTriangle,
    },
];

const COLUMNS = 3;
const rows = [HEALTH_STATS.slice(0, COLUMNS), HEALTH_STATS.slice(COLUMNS)];

export const HealthSection = () => {
    const bgContainer = useColorModeValue("white", "grey.900");

    return (
        <Box
            bg={bgContainer}
            border="0.5px solid"
            borderColor="borderDefault"
            borderRadius="12px"
            overflow="hidden"
        >
            <HStack
                justify="space-between"
                p={4}
                borderBottom="0.5px solid"
                borderColor="borderDefault"
            >
                <Text
                    fontWeight="medium"
                    fontSize="sm"
                    color="textMuted"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                >
                    Santé · 7 derniers jours
                </Text>
                <Button
                    size="sm"
                    variant="outline"
                    leftIcon={ExternalLink}
                    onClick={() => alert("Voir le rapport complet")}
                >
                    Voir le rapport
                </Button>
            </HStack>
            {rows.map((row, rowIndex) => (
                <Grid
                    key={rowIndex}
                    templateColumns={`repeat(${COLUMNS}, 1fr)`}
                    borderBottom={
                        rowIndex < rows.length - 1 ? "0.5px solid" : undefined
                    }
                    borderColor="borderDefault"
                >
                    {row.map((stat, colIndex) => (
                        <GridItem
                            key={stat.label}
                            p={4}
                            borderRight={
                                colIndex < row.length - 1
                                    ? "0.5px solid"
                                    : undefined
                            }
                            borderColor="borderDefault"
                            position="relative"
                            overflow="hidden"
                        >
                            <Text
                                fontSize="sm"
                                color="textMuted"
                                fontWeight="medium"
                                textTransform="uppercase"
                                mb={1}
                            >
                                {stat.label}
                            </Text>
                            <HStack spacing={2}>
                                <Box
                                    as={stat.icon}
                                    size={14}
                                    color="gray.400"
                                />
                                <Text fontSize="sm" fontWeight="medium">
                                    {stat.value}
                                </Text>
                            </HStack>
                            <Text fontSize="xs" color="textMuted" mt={1}>
                                {stat.sub}
                            </Text>
                            <Box
                                position="absolute"
                                right={0}
                                bottom={-2}
                                opacity={0.55}
                            >
                                <Sparkline
                                    data={[...stat.data]}
                                    id={stat.label}
                                />
                            </Box>
                        </GridItem>
                    ))}
                </Grid>
            ))}
        </Box>
    );
};

export default HealthSection;
