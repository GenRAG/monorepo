import { useEffect, useState } from "react";
import { Box, Button, HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { PrivacyRow } from "components/Deployment/PrivacyRow";
import SectionHeader from "components/Deployment/SectionHeader";

type RetentionDuration = "30d" | "90d" | "1y";

const RETENTION_OPTIONS: { value: RetentionDuration; label: string }[] = [
    { value: "30d", label: "30 jours" },
    { value: "90d", label: "90 jours" },
    { value: "1y", label: "1 an" },
];

const RETENTION_LABELS: Record<RetentionDuration, string> = {
    "30d": "30 jours",
    "90d": "90 jours",
    "1y": "1 an",
};

const DURATION_TO_DAYS: Record<RetentionDuration, number> = { "30d": 30, "90d": 90, "1y": 365 };

const toDuration = (days: number | null | undefined): RetentionDuration => {
    if (!days || days <= 30) return "30d";
    if (days <= 90) return "90d";
    return "1y";
};

interface DataPrivacyProps {
    apiLogs: boolean;
    onApiLogsChange: (v: boolean) => void;
    retentionDays: number | null;
    onRetentionDaysChange: (v: number | null) => void;
}

export const DataPrivacy = ({ apiLogs, onApiLogsChange, retentionDays, onRetentionDaysChange }: DataPrivacyProps) => {
    const [anonymize, setAnonymize] = useState(true);
    const [retention, setRetention] = useState(retentionDays !== null);
    const [retentionDuration, setRetentionDuration] = useState<RetentionDuration>(toDuration(retentionDays));
    const [auditLog, setAuditLog] = useState(true);

    useEffect(() => {
        setRetention(retentionDays !== null);
        setRetentionDuration(toDuration(retentionDays));
    }, [retentionDays]);

    const handleRetentionToggle = (v: boolean) => {
        setRetention(v);
        onRetentionDaysChange(v ? DURATION_TO_DAYS[retentionDuration] : null);
    };

    const handleDurationChange = (d: RetentionDuration) => {
        setRetentionDuration(d);
        onRetentionDaysChange(DURATION_TO_DAYS[d]);
    };

    const borderColor = useColorModeValue("grey.100", "grey.800");
    const bgColor = useColorModeValue("white", "grey.950");
    const segmentBg = useColorModeValue("grey.100", "grey.800");
    const segmentLabelColor = useColorModeValue("grey.600", "grey.400");

    return (
        <Box borderRadius="12px" border="1px solid" borderColor={borderColor} bg={bgColor}>
            <SectionHeader
                title="Confidentialité des données"
                subtitle="Gérez les paramètres de confidentialité et de sécurité de votre application"
            />
            <VStack spacing={0} align="stretch">
                <PrivacyRow
                    title="Anonymisation des données personnelles"
                    description="Détection et masquage automatique des PII (emails, noms, IBAN, numéros de sécurité sociale)."
                    checked={anonymize}
                    onChange={setAnonymize}
                    disabled
                    comingSoon
                />
                <PrivacyRow
                    title={`Politique de rétention — ${RETENTION_LABELS[retentionDuration]}`}
                    description="Les conversations sont automatiquement supprimées après la durée choisie."
                    recommended
                    checked={retention}
                    onChange={handleRetentionToggle}
                >
                    <HStack spacing={3} align="center">
                        <Text fontSize="xs" color={segmentLabelColor} whiteSpace="nowrap">
                            Durée
                        </Text>
                        <HStack spacing={0} bg={segmentBg} borderRadius="8px" p="2px" w="fit-content">
                            {RETENTION_OPTIONS.map((opt) => {
                                const isActive = retentionDuration === opt.value;
                                return (
                                    <Button
                                        key={opt.value}
                                        size="xs"
                                        variant={isActive ? "superPrimary" : "ghost"}
                                        onClick={() => handleDurationChange(opt.value)}
                                        w="100%"
                                        px="4"
                                    >
                                        {opt.label}
                                    </Button>
                                );
                            })}
                        </HStack>
                    </HStack>
                </PrivacyRow>
                <PrivacyRow
                    title="Journal d'audit"
                    description="Trace toutes les actions admin pour la conformité ISO 27001 et SOC 2."
                    checked={auditLog}
                    onChange={setAuditLog}
                    disabled
                    comingSoon
                />
                <PrivacyRow
                    title="Logs API détaillés"
                    description="Conservation des logs API pendant 90 jours pour debug et analyse."
                    checked={apiLogs}
                    onChange={onApiLogsChange}
                />
            </VStack>
        </Box>
    );
};

export default DataPrivacy;
