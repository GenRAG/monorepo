import { useState } from "react";
import { TabBar } from "components/ui/TabBar";
import { RetrieverDatasetsTab } from "../Datasets/RetrieverDatasetsTab";
import DocumentOverviewTab from "./DocumentNodeOverviewTab";

const TABS = [
    { value: "Bases", label: "Bases" },
    { value: "Aperçu", label: "Aperçu" },
];

interface DatabaseNodeModalProps {
    retrieverId: string;
    workspaceId: string;
    agentId: string;
    onAddDataset: (datasetId: string) => void;
    onRemoveSettingNode: (nodeId: string) => void;
}

const DatabaseNodeModal = ({
    retrieverId,
    workspaceId,
    agentId,
    onAddDataset,
    onRemoveSettingNode,
}: DatabaseNodeModalProps) => {
    const [selectedTab, setSelectedTab] = useState("Bases");

    return (
        <>
            <TabBar tabs={TABS} activeTab={selectedTab} onChange={setSelectedTab} />
            {selectedTab === "Bases" && (
                <RetrieverDatasetsTab
                    retrieverId={retrieverId}
                    workspaceId={workspaceId}
                    agentId={agentId}
                    onAdd={onAddDataset}
                    onRemove={onRemoveSettingNode}
                />
            )}
            {selectedTab === "Aperçu" && <DocumentOverviewTab />}
        </>
    );
};

export default DatabaseNodeModal;
