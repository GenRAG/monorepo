import { HStack, IconButton, Stack, Text, VStack } from "@chakra-ui/react";
import { useNodeConnections, useNodesData } from "@xyflow/react";
import { DATASET_ID_INPUT, EMPTY_SETTING_NODE_TYPE, type AppNode } from "@genrag/workflow";
import { Library, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";
import { useAgentDatasets } from "hooks/dataset/useAgentDatasets";
import { usePickDataset } from "hooks/dataset/usePickDataset";
import { pluralize } from "utils/dataset/datasetStatus";
import { DatasetPicker } from "./DatasetPicker";
import { RETRIEVER_DATASET_HANDLE } from "./retrieverDatasetInput";

interface RetrieverDatasetsTabProps {
    retrieverId: string;
    workspaceId: string;
    agentId: string;
    onAdd: (datasetId: string) => void;
    onRemove: (settingNodeId: string) => void;
}

const noop = () => undefined;

/** Datasets searched by the retriever: none selected means every dataset attached to the agent. */
export const RetrieverDatasetsTab = ({
    retrieverId,
    workspaceId,
    agentId,
    onAdd,
    onRemove,
}: RetrieverDatasetsTabProps) => {
    const navigate = useNavigate();
    const { attached, others } = useAgentDatasets(workspaceId, agentId);

    const connections = useNodeConnections({
        id: retrieverId,
        handleType: "source",
        handleId: RETRIEVER_DATASET_HANDLE,
    });
    const settingNodes = useNodesData<AppNode>(connections.map((c) => c.target));
    // The canvas also links the display-only "all bases" node to this handle: it is not a selected base.
    const selected = settingNodes
        .filter((node) => node.type !== EMPTY_SETTING_NODE_TYPE)
        .map((node) => ({
            nodeId: node.id,
            datasetId: node.data.inputs?.[DATASET_ID_INPUT] ?? "",
        }));
    const datasetById = new Map(attached.map((d) => [d.id, d]));
    // Nothing to limit yet: picking a base only attaches it, and the retriever keeps searching all of them.
    const isAddingFirstBase = attached.length === 0 && selected.length === 0;
    const { pick, isAttaching } = usePickDataset(workspaceId, agentId, isAddingFirstBase ? noop : onAdd);

    return (
        <VStack align="stretch" spacing={4} p={4}>
            {selected.length === 0 ? (
                <VStack align="stretch" spacing={2} p={3} borderRadius="10px" bg="surfaceSubtle">
                    <Text variant="body-sm-semibold">Toutes les bases de l&apos;agent</Text>
                    {attached.length === 0 ? (
                        <>
                            <Text variant="body-xs-muted">
                                Cet agent n&apos;a encore aucune base : il répondra sans consulter de documents.
                            </Text>
                            {others.length === 0 && (
                                <Button
                                    size="xs"
                                    variant="secondary"
                                    w="fit-content"
                                    onClick={() =>
                                        void navigate(`/workspaces/${workspaceId}/agents/${agentId}/datasets`)
                                    }
                                >
                                    Ajouter des bases à l&apos;agent
                                </Button>
                            )}
                        </>
                    ) : (
                        <Text variant="body-xs-muted">
                            La recherche porte sur {pluralize(attached.length, "base")} :{" "}
                            {attached.map((d) => d.name).join(", ")}. Choisissez des bases ci-dessous pour la limiter.
                        </Text>
                    )}
                </VStack>
            ) : (
                <Stack spacing={2}>
                    {selected.map(({ nodeId, datasetId }) => {
                        const dataset = datasetById.get(datasetId);
                        return (
                            <HStack
                                key={nodeId}
                                p={2.5}
                                borderRadius="10px"
                                borderWidth="1px"
                                borderStyle="solid"
                                borderColor={dataset ? "borderDefault" : "borderError"}
                            >
                                <BoxIcon icon={Library} size="sm" />
                                <VStack align="start" spacing={0} flex={1} minW={0}>
                                    <Text variant="body-sm-semibold" noOfLines={1}>
                                        {dataset?.name ?? "Base introuvable"}
                                    </Text>
                                    <Text variant="caption-xs-muted">
                                        {dataset
                                            ? pluralize(dataset.documentsCount, "document")
                                            : "Supprimée ou retirée de l'agent : ignorée"}
                                    </Text>
                                </VStack>
                                <IconButton
                                    aria-label="Retirer cette base"
                                    icon={<X size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => onRemove(nodeId)}
                                />
                            </HStack>
                        );
                    })}
                </Stack>
            )}

            {(!isAddingFirstBase || others.length > 0) && (
                <DatasetPicker
                    label={isAddingFirstBase ? "Ajouter une base à l'agent" : "Limiter à une base"}
                    attached={attached}
                    others={others}
                    excludedIds={selected.map((s) => s.datasetId)}
                    onPick={(dataset, needsAttach) => void pick(dataset, needsAttach)}
                    isLoading={isAttaching}
                />
            )}
        </VStack>
    );
};
