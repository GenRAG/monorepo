import { useState } from "react";
import { Box, useColorModeValue, VStack } from "@chakra-ui/react";
import { PrivacyRow } from "components/Deployment/PrivacyRow";
import SectionHeader from "components/Deployment/SectionHeader";

export const DataPrivacy = () => {
    const [anonymize, setAnonymize] = useState(true);
    const [retention, setRetention] = useState(true);
    const [auditLog, setAuditLog] = useState(true);
    const [apiLogs, setApiLogs] = useState(true);

    const borderColor = useColorModeValue("grey.100", "grey.800");
    const bgColor = useColorModeValue("white", "grey.950");

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
                    recommended
                    checked={anonymize}
                    onChange={setAnonymize}
                />
                <PrivacyRow
                    title="Politique de rétention 30 jours"
                    description="Les conversations sont automatiquement supprimées après 30 jours."
                    recommended
                    checked={retention}
                    onChange={setRetention}
                />
                <PrivacyRow
                    title="Journal d'audit"
                    description="Trace toutes les actions admin pour la conformité ISO 27001 et SOC 2."
                    recommended
                    checked={auditLog}
                    onChange={setAuditLog}
                />
                <PrivacyRow
                    title="Logs API détaillés"
                    description="Conservation des logs API pendant 90 jours pour debug et analyse."
                    checked={apiLogs}
                    onChange={setApiLogs}
                />
            </VStack>
        </Box>
    );
};

export default DataPrivacy;
