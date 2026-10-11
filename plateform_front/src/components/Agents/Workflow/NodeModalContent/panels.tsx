import type { ComponentType } from "react";
import { TaskType, type AppNodeData } from "@genrag/workflow";
import useThemedToast from "hooks/useThemedToast";
import { TabbedNodePanel } from "./TabbedNodePanel";
import DatabaseNodeModal from "./Document/DocumentNodeContent";
import { DatasetSettingContent } from "./Datasets/DatasetSettingContent";
import { RETRIEVER_DATASET_INPUT } from "./Datasets/retrieverDatasetInput";
import { ModelSelectorContent } from "./ModelSelector/ModelSelectorContent";
import QueryOverviewTab from "./Query/QueryNodeOverviewTab";
import RewriterOverviewTab from "./Rewriter/RewriterNodeOverviewTab";
import RerankerOverviewTab from "./ReRanker/ReRankerNodeOverviewTab";
import ResponseOverviewTab from "./Response/ResponseNodeOverviewTab";

export interface PanelProps {
    nodeId: string;
    nodeData: AppNodeData;
    workspaceId: string;
    agentId: string;
    ownerType?: TaskType;
    onSettingSelect: (nodeId: string, item: string) => void;
    onAddSettingNode: (parentId: string, inputName: string, value: string) => void;
    onRemoveSettingNode: (nodeId: string) => void;
    onClose: () => void;
}

const overviewPanel = (Overview: ComponentType): ComponentType<PanelProps> => {
    const OverviewPanel = () => <TabbedNodePanel overview={<Overview />} />;
    return OverviewPanel;
};

const RetrieverPanel = ({ nodeId, workspaceId, agentId, onAddSettingNode, onRemoveSettingNode }: PanelProps) => (
    <DatabaseNodeModal
        retrieverId={nodeId}
        workspaceId={workspaceId}
        agentId={agentId}
        onAddDataset={(datasetId) => onAddSettingNode(nodeId, RETRIEVER_DATASET_INPUT.name, datasetId)}
        onRemoveSettingNode={onRemoveSettingNode}
    />
);

const DatasetPanel = ({
    nodeId,
    nodeData,
    workspaceId,
    agentId,
    onSettingSelect,
    onRemoveSettingNode,
    onClose,
}: PanelProps) => (
    <DatasetSettingContent
        nodeId={nodeId}
        nodeData={nodeData}
        workspaceId={workspaceId}
        agentId={agentId}
        onSelect={onSettingSelect}
        onRemove={(id) => {
            onRemoveSettingNode(id);
            onClose();
        }}
    />
);

const ModelPanel = ({ nodeId, nodeData, ownerType, onSettingSelect, onClose }: PanelProps) => {
    const toast = useThemedToast();
    return (
        <ModelSelectorContent
            ownerType={ownerType}
            currentModelId={nodeData.modelName}
            onSelect={(modelId) => {
                onSettingSelect(nodeId, modelId);
                toast({ title: `Modèle sélectionné: ${modelId}`, status: "success" });
                onClose();
            }}
        />
    );
};

export const PANELS: Record<TaskType, ComponentType<PanelProps>> = {
    [TaskType.QUERY]: overviewPanel(QueryOverviewTab),
    [TaskType.REWRITER]: overviewPanel(RewriterOverviewTab),
    [TaskType.RERANKER]: overviewPanel(RerankerOverviewTab),
    [TaskType.RESPONSE]: overviewPanel(ResponseOverviewTab),
    [TaskType.RETRIEVER]: RetrieverPanel,
    [TaskType.DATASET]: DatasetPanel,
    [TaskType.MODEL]: ModelPanel,
    [TaskType.INSTRUCTION]: () => null,
};
