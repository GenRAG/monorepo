import { Badge, HStack, Spinner } from "@chakra-ui/react";
import { DatasetEntity } from "types/dataset/dataset";
import { DATASET_HEALTH_CONFIG, getDatasetHealth } from "utils/dataset/datasetStatus";

export const DatasetHealthBadge = ({
    dataset,
}: {
    dataset: Pick<DatasetEntity, "statusCounts" | "documentsCount">;
}) => {
    const health = getDatasetHealth(dataset);
    const config = DATASET_HEALTH_CONFIG[health];

    return (
        <Badge colorScheme={config.colorScheme} size="sm">
            <HStack spacing={1}>
                {health === "indexing" && <Spinner size="xs" />}
                <span>{config.label}</span>
            </HStack>
        </Badge>
    );
};
