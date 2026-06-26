import { useState } from "react";

import type { Task, AppNodeData } from "@genrag/workflow";
import ResponseSettingsTab from "./ResponseNodeSettingsTab";
import ResponseOverviewTab from "./ResponseNodeOverviewTab";
import { TabBar } from "components/ui/TabBar";

interface ResponseNodeModalProps {
    task: Task;
    nodeData: AppNodeData;
    mainNodeId: string;
    onSettingSelect: (nodeId: string, item: string) => void;
}

const TABS = [
    { value: "Aperçu", label: "Aperçu" },
    { value: "Paramètres", label: "Paramètres" },
];

const ResponseNodeModal = ({ task, nodeData, mainNodeId, onSettingSelect }: ResponseNodeModalProps) => {
    const [selectedTab, setSelectedTab] = useState("Aperçu");

    return (
        <>
            <TabBar tabs={TABS} activeTab={selectedTab} onChange={setSelectedTab} />
            {selectedTab === "Aperçu" && <ResponseOverviewTab />}
            {selectedTab === "Paramètres" && (
                <ResponseSettingsTab
                    task={task}
                    nodeData={nodeData}
                    mainNodeId={mainNodeId}
                    onSettingSelect={onSettingSelect}
                />
            )}
        </>
    );
};

export default ResponseNodeModal;
