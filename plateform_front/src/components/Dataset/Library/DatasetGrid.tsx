import { Box, Flex, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { DatasetEntity } from "types/dataset/dataset";
import { DatasetAction } from "../DatasetActionsMenu";
import { DatasetCard } from "./DatasetCard";

interface DatasetGridProps {
    datasets: DatasetEntity[];
    onAction: (action: DatasetAction, dataset: DatasetEntity) => void;
    onCreate?: () => void;
}

export const DatasetGrid = ({ datasets, onAction, onCreate }: DatasetGridProps) => (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
        {datasets.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} onAction={onAction} />
        ))}
        {onCreate && (
            <Flex
                as="button"
                type="button"
                onClick={onCreate}
                direction="column"
                align="center"
                justify="center"
                gap={2}
                minH="160px"
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="borderStrong"
                borderRadius="12px"
                _hover={{ bg: "surfaceHover" }}
                transition="background 0.15s"
            >
                <Box p={2} borderRadius="8px" bg="surfaceThumbnail">
                    <Icon as={Plus} boxSize={4} color="textLabel" />
                </Box>
                <Text variant="body-sm-semibold">Créer une base</Text>
                <Text variant="caption-xs-muted">Importez ensuite vos documents</Text>
            </Flex>
        )}
    </SimpleGrid>
);
