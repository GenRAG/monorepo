import { HStack, Text, VStack } from "@chakra-ui/react";
import { DATASET_ID_INPUT, type AppNodeData } from "@genrag/workflow";
import { Library, Trash2 } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";
import { useAgentDatasets } from "hooks/dataset/useAgentDatasets";
import { usePickDataset } from "hooks/dataset/usePickDataset";
import { pluralize } from "utils/dataset/datasetStatus";
import { DatasetPicker } from "./DatasetPicker";

interface DatasetSettingContentProps {
    nodeId: string;
    nodeData: AppNodeData;
    workspaceId: string;
    agentId: string;
    onSelect: (nodeId: string, datasetId: string) => void;
    onRemove: (nodeId: string) => void;
}

/** Panel of a DATASET setting node: change the dataset it points to, or remove it. */
export const DatasetSettingContent = ({
    nodeId,
    nodeData,
    workspaceId,
    agentId,
    onSelect,
    onRemove,
}: DatasetSettingContentProps) => {
    const { attached, others } = useAgentDatasets(workspaceId, agentId);
    const { pick, isAttaching } = usePickDataset(workspaceId, agentId, (datasetId) => onSelect(nodeId, datasetId));
    const datasetId = nodeData.inputs?.[DATASET_ID_INPUT] ?? "";
    const dataset = attached.find((d) => d.id === datasetId);

    return (
        <VStack align="stretch" spacing={4} p={4}>
            <HStack p={3} borderRadius="10px" bg="surfaceSubtle" spacing={3}>
                <BoxIcon icon={Library} />
                <VStack align="start" spacing={0} minW={0}>
                    <Text variant="body-sm-semibold" noOfLines={1}>
                        {dataset?.name ?? "Base introuvable"}
                    </Text>
                    <Text variant="body-xs-muted">
                        {dataset
                            ? pluralize(dataset.documentsCount, "document")
                            : "Cette base a été supprimée ou retirée de l'agent : elle est ignorée."}
                    </Text>
                </VStack>
            </HStack>

            <DatasetPicker
                label="Changer de base"
                attached={attached}
                others={others}
                excludedIds={[datasetId]}
                onPick={(picked, needsAttach) => void pick(picked, needsAttach)}
                isLoading={isAttaching}
            />

            <Button size="sm" variant="ghost" leftIcon={Trash2} onClick={() => onRemove(nodeId)}>
                Retirer cette base de la recherche
            </Button>
        </VStack>
    );
};
