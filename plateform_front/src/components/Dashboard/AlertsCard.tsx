import { Badge, Box, Card, HStack, Icon, Skeleton, Text, VStack } from "@chakra-ui/react";
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ALERTS, type AlertEntry } from "pages/Dashboard/data";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import CardHeader from "components/ui/CardHeader";
import { STATUS_COLORS } from "themeNew/foundations/themeConfig";

const SEVERITY_ICON: Record<AlertEntry["severity"], LucideIcon> = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const AlertItem = ({ alert }: { alert: AlertEntry }) => {
    return (
        <HStack
            spacing={3}
            p={3}
            borderBottom="1px solid"
            borderColor="borderDefault"
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
                <Text variant="body-sm-semibold" noOfLines={1}>
                    {alert.title}
                </Text>
                <Text variant="body-2xs-muted" noOfLines={1}>
                    {alert.description}
                </Text>
                <Text variant="body-2xs-muted">
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
    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };

    const activeCount = ALERTS.filter((a) => a.severity === "error").length;

    if (isLoading) {
        return (
            <Card size="none" display="flex" flexDirection="column">
                <CardHeader>
                    <HStack spacing={2}>
                        <Skeleton {...skeletonProps} h="14px" w="14px" borderRadius="3px" />
                        <Skeleton {...skeletonProps} h="14px" w="50px" borderRadius="4px" />
                    </HStack>
                </CardHeader>
                <VStack spacing={0} align="stretch">
                    {[...Array(3)].map((_, i) => (
                        <HStack
                            key={i}
                            spacing={3}
                            p={3}
                            borderBottom="1px solid"
                            borderColor="borderDefault"
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
            </Card>
        );
    }

    return (
        <Card size="none" display="flex" flexDirection="column">
            <CardHeader>
                <HStack spacing={2}>
                    <Icon as={Bell} boxSize={3.5} color="textLabel" />
                    <Text variant="body-sm-semibold">Alertes</Text>
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
            </CardHeader>
            {isEmpty ? (
                <CardEmptyState
                    icon={CheckCircle}
                    iconBgColor={STATUS_COLORS.success}
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
        </Card>
    );
};
