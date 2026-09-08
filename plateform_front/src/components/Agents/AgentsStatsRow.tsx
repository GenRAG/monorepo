import React from "react";
import { Card, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Bot, CheckCircle2, FileText, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";

interface StatTileProps {
    icon: LucideIcon;
    label: string;
    value: number;
}

const StatTile: React.FC<StatTileProps> = ({ icon, label, value }) => (
    <Card size="none" bg="surfaceModal" borderColor="borderSubtle" borderWidth="0.5px" p={4}>
        <HStack spacing={3}>
            <BoxIcon icon={icon} />
            <VStack align="start" spacing={0}>
                <Text variant="body-xs-muted">{label}</Text>
                <Text fontSize="xl" fontWeight="bold" color="textStrong">
                    {value}
                </Text>
            </VStack>
        </HStack>
    </Card>
);

interface AgentsStatsRowProps {
    total: number;
    production: number;
    development: number;
    totalDocuments: number;
}

export const AgentsStatsRow: React.FC<AgentsStatsRowProps> = ({ total, production, development, totalDocuments }) => (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
        <StatTile icon={Bot} label="Agents au total" value={total} />
        <StatTile icon={CheckCircle2} label="En production" value={production} />
        <StatTile icon={Wrench} label="En développement" value={development} />
        <StatTile icon={FileText} label="Documents indexés" value={totalDocuments} />
    </SimpleGrid>
);
