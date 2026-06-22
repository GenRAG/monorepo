import { useState } from "react";
import { VStack } from "@chakra-ui/react";
import type { AppNodeData, Task } from "@genrag/workflow";
import { TabBar } from "components/ui/TabBar";
import RerankerOverviewTab from "./ReRankerNodeOverviewTab";
import { NodeSettingsEditor } from "components/Agents/Workflow/NodeModalContent/NodeSettingsEditor";

interface RerankerNodeModalProps {
    task: Task;
    nodeData: AppNodeData;
    mainNodeId: string;
    onSettingSelect: (nodeId: string, item: string) => void;
}

const TABS = [
    { value: "Aperçu", label: "Aperçu" },
    { value: "Paramètres", label: "Paramètres" },
];

const RerankerNodeModal = ({ mainNodeId, onSettingSelect }: RerankerNodeModalProps) => {
    const [selectedTab, setSelectedTab] = useState("Aperçu");

    return (
        <>
            <TabBar tabs={TABS} activeTab={selectedTab} onChange={setSelectedTab} />
            {selectedTab === "Aperçu" && <RerankerOverviewTab />}
            {selectedTab === "Paramètres" && (
                <VStack flex={1} minH={0} p={4} spacing={4} align="stretch">
                    <NodeSettingsEditor mainNodeId={mainNodeId} onSettingSelect={onSettingSelect} />
                </VStack>
            )}
        </>
    );
};

export default RerankerNodeModal;
