import { Badge, Box, HStack, Icon, Skeleton, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ALERTS, type AlertEntry } from "pages/Dashboard/data";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";

const SEVERITY_ICON: Record<AlertEntry["severity"], LucideIcon> = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const AlertItem = ({ alert }: { alert: AlertEntry }) => {
    const divider = useColorModeValue("grey.100", "grey.800");
    const titleCol = useColorModeValue("grey.900", "grey.100");
    const metaCol = useColorModeValue("grey.500", "grey.400");

    return (
        <HStack
            spacing={3}
            p={3}
            borderBottom="1px solid"
            borderColor={divider}
            _last={{ borderBottom: "none" }}
            align="start"
        >
            <Box
                bg={alert.accentColor}
                borderRadius="6px"
                p={1.5}
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Icon as={SEVERITY_ICON[alert.severity]} boxSize={3} color="white" />
            </Box>
            <VStack align="start" spacing={0.5} flex={1} minW={0}>
                <Text fontSize="13px" fontWeight="600" color={titleCol} noOfLines={1}>
                    {alert.title}
                </Text>
                <Text fontSize="11px" color={metaCol} noOfLines={1}>
                    {alert.description}
                </Text>
                <Text fontSize="11px" color={metaCol}>
                    {alert.time} - {alert.source}
                </Text>
            </VStack>
        </HStack>
    );
};

interface AlertsCardProps {
    isEmpty?: boolean;
    isLoading?: boolean;
}

export const AlertsCard = ({ isEmpty = false, isLoading = false }: AlertsCardProps) => {
    const cardBg = useColorModeValue("white", "grey.850");
    const border = useColorModeValue("grey.100", "grey.800");
    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");
    const skeletonStart = useColorModeValue("grey.100", "grey.800");
    const skeletonEnd = useColorModeValue("grey.200", "grey.700");
    const skeletonProps = { startColor: skeletonStart, endColor: skeletonEnd };

    const activeCount = ALERTS.filter((a) => a.severity === "error").length;

    if (isLoading) {
        return (
            <Box
                bg={cardBg}
                border="1px solid"
                borderColor={border}
                borderRadius="12px"
                display="flex"
                flexDirection="column"
            >
                <HStack justify="space-between" borderBottom="1px solid" borderColor={border} p={4}>
                    <HStack spacing={2}>
                        <Skeleton {...skeletonProps} h="14px" w="14px" borderRadius="3px" />
                        <Skeleton {...skeletonProps} h="14px" w="50px" borderRadius="4px" />
                    </HStack>
                </HStack>
                <VStack spacing={0} align="stretch">
                    {[...Array(3)].map((_, i) => (
                        <HStack
                            key={i}
                            spacing={3}
                            p={3}
                            borderBottom="1px solid"
                            borderColor={border}
                            _last={{ borderBottom: "none" }}
                            align="start"
                        >
                            <Skeleton {...skeletonProps} w="24px" h="24px" borderRadius="6px" flexShrink={0} />
                            <VStack align="start" spacing={1.5} flex={1} minW={0}>
                                <Skeleton {...skeletonProps} h="13px" w="140px" borderRadius="4px" />
                                <Skeleton {...skeletonProps} h="11px" w="180px" borderRadius="4px" />
                                <Skeleton {...skeletonProps} h="11px" w="100px" borderRadius="4px" />
                            </VStack>
                        </HStack>
                    ))}
                </VStack>
            </Box>
        );
    }

    return (
        <Box
            bg={cardBg}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            display="flex"
            flexDirection="column"
        >
            <HStack justify="space-between" borderBottom="1px solid" borderColor={border} p={4}>
                <HStack spacing={2}>
                    <Icon as={Bell} boxSize={3.5} color={textSecondary} />
                    <Text fontSize="sm" fontWeight="600" color={textPrimary}>
                        Alertes
                    </Text>
                    {!isEmpty && activeCount > 0 && (
                        <Badge
                            bg="orange.500"
                            color="white"
                            borderRadius="5px"
                            fontSize="10px"
                            fontWeight="700"
                            px={1.5}
                            py={0.5}
                            letterSpacing="0.04em"
                        >
                            {activeCount} ACTIVE
                        </Badge>
                    )}
                </HStack>
                {!isEmpty && (
                    <Text
                        fontSize="xs"
                        color="green.400"
                        fontWeight="500"
                        cursor="pointer"
                        _hover={{ color: "green.300" }}
                    >
                        Tout voir
                    </Text>
                )}
            </HStack>
            {isEmpty ? (
                <CardEmptyState
                    icon={CheckCircle}
                    iconBgColor="#12B98C"
                    title="Tout est en ordre"
                    description="Aucune alerte active pour le moment."
                />
            ) : (
                <VStack spacing={0} align="stretch">
                    {ALERTS.map((alert, i) => (
                        <AlertItem key={i} alert={alert} />
                    ))}
                </VStack>
            )}
        </Box>
    );
};
