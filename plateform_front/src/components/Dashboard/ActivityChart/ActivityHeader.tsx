import {
    Box,
    HStack,
    Icon,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { Activity } from "lucide-react";
import { Period } from "pages/Dashboard/data";

const PERIOD_LABELS: Record<Period, string> = {
    "24h": "24h",
    "7j": "7j",
    "30j": "30j",
};

export const ActivityHeader = ({
    period,
    setPeriod,
}: {
    period: Period;
    setPeriod: (period: Period) => void;
}) => {
    const pillBg = useColorModeValue("grey.100", "grey.800");
    const activePillBg = useColorModeValue("white", "grey.700");
    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");

    return (
        <Stack
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            w="100%"
            spacing={2}
        >
            <HStack spacing={2}>
                <Icon as={Activity} boxSize={3.5} color={textSecondary} />
                <Text fontSize="sm" fontWeight="600" color={textPrimary}>
                    Activité conversations
                </Text>
            </HStack>
            <HStack spacing={0.5} bg={pillBg} borderRadius="8px" flexShrink={0}>
                {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                    <Box
                        key={p}
                        as="button"
                        px={2.5}
                        py={1}
                        borderRadius="6px"
                        bg={period === p ? activePillBg : "transparent"}
                        fontSize="12px"
                        fontWeight={period === p ? "600" : "400"}
                        color={period === p ? textPrimary : textSecondary}
                        onClick={() => setPeriod(p)}
                        transition="all 0.15s"
                        boxShadow={period === p ? "sm" : "none"}
                    >
                        {PERIOD_LABELS[p]}
                    </Box>
                ))}
            </HStack>
        </Stack>
    );
};
