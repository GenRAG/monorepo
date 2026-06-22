import React from "react";
import { Badge, Box, HStack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { seededValue } from "./modelUtils";

export const StatBadge: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const bg = useColorModeValue("grey.50", "grey.800");
    const labelColor = useColorModeValue("grey.400", "grey.500");
    const valueColor = useColorModeValue("grey.800", "grey.100");
    return (
        <Box bg={bg} borderRadius="8px" px={3} py={2} flex={1}>
            <Text fontSize="9px" color={labelColor} textTransform="uppercase" letterSpacing="0.06em">
                {label}
            </Text>
            <Text fontSize="12px" fontWeight={700} color={valueColor} mt={0.5} noOfLines={1}>
                {value}
            </Text>
        </Box>
    );
};

export const CapabilityBadge: React.FC<{ label: string }> = ({ label }) => {
    const bg = useColorModeValue("grey.100", "grey.700");
    const color = useColorModeValue("grey.600", "grey.300");
    return (
        <Badge bg={bg} color={color} fontSize="10px" fontWeight={600} px={2} py={1} borderRadius="6px">
            {label}
        </Badge>
    );
};

const PERF_METRICS = ["Vitesse", "Qualité", "Raisonnement", "Économie"];

export const PerformanceBars: React.FC<{ modelId: string }> = ({ modelId }) => {
    const trackBg = useColorModeValue("grey.100", "grey.900");
    const labelColor = useColorModeValue("grey.500", "grey.400");
    return (
        <VStack p="3" align="stretch" spacing={1.5}>
            {PERF_METRICS.map((label, i) => {
                const pct = Math.round(seededValue(modelId, i) * 100);
                const barColor = pct > 70 ? "green.400" : pct > 45 ? "green.300" : "green.200";
                return (
                    <VStack key={label} align="stretch" spacing={0.5}>
                        <HStack justify="space-between">
                            <Text fontSize="10px" color={labelColor}>
                                {label}
                            </Text>
                            <Text fontSize="10px" color={labelColor} fontWeight={600}>
                                {pct}%
                            </Text>
                        </HStack>
                        <Box h="4px" bg={trackBg} borderRadius="2px">
                            <Box h="100%" w={`${pct}%`} bg={barColor} borderRadius="2px" transition="width 0.3s" />
                        </Box>
                    </VStack>
                );
            })}
        </VStack>
    );
};
