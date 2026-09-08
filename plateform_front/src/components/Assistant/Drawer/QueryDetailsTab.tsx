import React from "react";
import { Divider, HStack, Text, VStack } from "@chakra-ui/react";
import { QueryDetailsInfo } from "./types";

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <HStack justify="space-between" py={2.5}>
        <Text variant="body-xs-muted">{label}</Text>
        <Text fontSize="sm" fontWeight="semibold" color="textStrong">
            {value}
        </Text>
    </HStack>
);

interface QueryDetailsTabProps {
    details: QueryDetailsInfo;
}

export const QueryDetailsTab: React.FC<QueryDetailsTabProps> = ({ details }) => (
    <VStack align="stretch" spacing={0} divider={<Divider borderColor="borderDefault" />}>
        <DetailRow label="Reçu le" value={details.receivedAt} />
        <DetailRow label="Agent" value={details.agentTitle} />
        {details.agentVersion && <DetailRow label="Version agent" value={details.agentVersion} />}
        {details.durationMs !== undefined && (
            <DetailRow label="Durée génération" value={`${(details.durationMs / 1000).toFixed(1)} s`} />
        )}
        <DetailRow label="Documents consultés" value={String(details.documentsConsulted)} />
    </VStack>
);
