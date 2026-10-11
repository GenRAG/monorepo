import { Box, HStack, Icon, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Info } from "lucide-react";
import { GlassPanel } from "components/ui/GlassPanel";
import { DatasetEntity } from "types/dataset/dataset";
import { formatFileSize } from "utils/documentFormatters";

const Stat = ({ label, value }: { label: string; value: string }) => (
    <VStack align="start" spacing={0} minW={0}>
        <Text variant="caption-xs-semibold" color="textLabel" textTransform="uppercase" letterSpacing="0.06em">
            {label}
        </Text>
        <Text variant="heading-lg" noOfLines={1}>
            {value}
        </Text>
    </VStack>
);

interface AgentDatasetsSummaryProps {
    attached: DatasetEntity[];
    total: number;
}

/** Chiffres clés de l'agent + rappel du comportement par défaut du ciblage des bases. */
export const AgentDatasetsSummary = ({ attached, total }: AgentDatasetsSummaryProps) => {
    const documents = attached.reduce((sum, d) => sum + d.documentsCount, 0);
    const size = attached.reduce((sum, d) => sum + d.totalSize, 0);

    return (
        <GlassPanel p={{ base: 4, md: 5 }} flexShrink={0}>
            <SimpleGrid columns={3} spacing={{ base: 3, md: 6 }}>
                <Stat label="Bases" value={`${attached.length}/${total}`} />
                <Stat label="Documents" value={String(documents)} />
                <Stat label="Taille" value={formatFileSize(size)} />
            </SimpleGrid>
            <Box h="1px" bg="borderSubtle" my={{ base: 3, md: 4 }} />
            <HStack spacing={2.5} align="start">
                <Icon as={Info} boxSize={4} color="textLabel" mt={0.5} flexShrink={0} />
                <Text variant="body-xs-muted" fontSize={{ base: "xs", md: "sm" }} lineHeight="1.5">
                    Par défaut, l&apos;agent cherche dans toutes les bases ajoutées ici. Pour n&apos;en utiliser que
                    certaines, ajoutez des blocs « Base de connaissances » à la Recherche dans l&apos;onglet
                    Architecture.
                </Text>
            </HStack>
        </GlassPanel>
    );
};
