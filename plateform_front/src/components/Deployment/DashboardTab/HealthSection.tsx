import { Badge, Box, HStack, Text, Tooltip, VStack, useColorModeValue } from "@chakra-ui/react";
import BoxIcon from "components/ui/BoxIcon";
import { Activity } from "lucide-react";

type DayStatus = "operational" | "degraded" | "incident" | "maintenance";

interface DayHealth {
    date: Date;
    status: DayStatus;
}

const STATUS_COLOR: Record<DayStatus, string> = {
    operational: "#12B98C",
    degraded: "#F59E0B",
    incident: "#EF4444",
    maintenance: "#6B7280",
};

const STATUS_LABEL: Record<DayStatus, string> = {
    operational: "Opérationnel",
    degraded: "Dégradé",
    incident: "Incident",
    maintenance: "Maintenance",
};

const DAYS = 90;

const INCIDENT_DAYS = new Set([12, 13, 47, 72]);
const DEGRADED_DAYS = new Set([5, 11, 14, 46, 48, 71, 73, 80]);
const MAINTENANCE_DAYS = new Set([30, 60]);

const HEALTH_DATA: DayHealth[] = Array.from({ length: DAYS }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (DAYS - 1 - i));

    let status: DayStatus = "operational";
    if (INCIDENT_DAYS.has(i)) status = "incident";
    else if (DEGRADED_DAYS.has(i)) status = "degraded";
    else if (MAINTENANCE_DAYS.has(i)) status = "maintenance";

    return { date, status };
});

const uptime = ((HEALTH_DATA.filter((d) => d.status === "operational").length / DAYS) * 100).toFixed(2);

const incidentCount = HEALTH_DATA.filter((d) => d.status === "incident").length;

const currentStatus = HEALTH_DATA[HEALTH_DATA.length - 1].status;

const formatDate = (date: Date) =>
    date.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });

export const HealthSection = () => {
    const bgContainer = useColorModeValue("white", "grey.900");
    const textPrimary = useColorModeValue("grey.900", "grey.50");

    const statusColor = STATUS_COLOR[currentStatus];
    const statusBg =
        currentStatus === "operational"
            ? "rgba(18,185,140,0.1)"
            : currentStatus === "incident"
              ? "rgba(239,68,68,0.1)"
              : "rgba(245,158,11,0.1)";
    const statusBorder =
        currentStatus === "operational"
            ? "rgba(18,185,140,0.25)"
            : currentStatus === "incident"
              ? "rgba(239,68,68,0.25)"
              : "rgba(245,158,11,0.25)";

    return (
        <Box bg={bgContainer} border="0.5px solid" borderColor="borderDefault" borderRadius="12px" overflow="hidden">
            <HStack justify="space-between" p={4} borderBottom="0.5px solid" borderColor="borderDefault">
                <HStack spacing={3}>
                    <HStack spacing={2}>
                        <BoxIcon icon={Activity} />
                        <Text fontWeight="600" fontSize="sm" color={textPrimary}>
                            Disponibilité
                        </Text>
                    </HStack>
                    <Badge color={statusColor} bg={statusBg} border="1px solid" borderColor={statusBorder}>
                        {STATUS_LABEL[currentStatus]}
                    </Badge>
                </HStack>
            </HStack>

            <VStack p={4} spacing={3} align="stretch">
                <HStack justify="space-between" align="baseline">
                    <HStack spacing={1.5} align="baseline">
                        <Text fontSize="2xl" fontWeight="700" color={textPrimary} lineHeight="1">
                            {uptime}%
                        </Text>
                        <Text fontSize="sm" color="textMuted">
                            uptime - {DAYS} derniers jours
                        </Text>
                    </HStack>
                    {incidentCount > 0 && (
                        <Text fontSize="xs" color="textMuted">
                            {incidentCount} incident
                            {incidentCount > 1 ? "s" : ""}
                        </Text>
                    )}
                </HStack>

                <Box>
                    <HStack spacing="2px" align="stretch" h="32px">
                        {HEALTH_DATA.map((day, i) => (
                            <Tooltip
                                key={i}
                                label={`${formatDate(day.date)} — ${STATUS_LABEL[day.status]}`}
                                color="white"
                                bg={STATUS_COLOR[day.status]}
                                borderRadius="8px"
                                hasArrow
                            >
                                <Box
                                    flex={1}
                                    h="100%"
                                    borderRadius="2px"
                                    bg={STATUS_COLOR[day.status]}
                                    opacity={day.status === "operational" ? 0.65 : 1}
                                    cursor="default"
                                    transition="opacity 0.1s"
                                    _hover={{ opacity: 1 }}
                                />
                            </Tooltip>
                        ))}
                    </HStack>
                    <HStack justify="space-between" mt={1.5}>
                        <Text fontSize="11px" color="textMuted">
                            Il y a {DAYS} jours
                        </Text>
                        <Text fontSize="11px" color="textMuted">
                            Aujourd&apos;hui
                        </Text>
                    </HStack>
                </Box>

                <HStack spacing={4} flexWrap="wrap">
                    {(Object.keys(STATUS_COLOR) as DayStatus[]).map((status) => (
                        <HStack key={status} spacing={1.5}>
                            <Box w="8px" h="8px" borderRadius="2px" bg={STATUS_COLOR[status]} flexShrink={0} />
                            <Text fontSize="11px" color="textMuted">
                                {STATUS_LABEL[status]}
                            </Text>
                        </HStack>
                    ))}
                </HStack>
            </VStack>
        </Box>
    );
};

export default HealthSection;
