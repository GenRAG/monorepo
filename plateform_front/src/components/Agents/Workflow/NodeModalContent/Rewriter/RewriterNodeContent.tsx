import { useState } from "react";
import { VStack } from "@chakra-ui/react";
import type { AppNodeData, Task } from "@genrag/workflow";
import { TabBar } from "components/ui/TabBar";
import { NodeSettingsEditor } from "components/Agents/Workflow/NodeModalContent/NodeSettingsEditor";
import RewriterOverviewTab from "components/Agents/Workflow/NodeModalContent/Rewriter/RewriterNodeOverviewTab";

interface RewriterNodeModalProps {
    task: Task;
    nodeData: AppNodeData;
    mainNodeId: string;
    onSettingSelect: (nodeId: string, item: string) => void;
}

const TABS = [
    { value: "Aperçu", label: "Aperçu" },
    { value: "Paramètres", label: "Paramètres" },
];

const RewriterNodeModal = ({ mainNodeId, onSettingSelect }: RewriterNodeModalProps) => {
    const [selectedTab, setSelectedTab] = useState("Aperçu");

    return (
        <>
            <TabBar tabs={TABS} activeTab={selectedTab} onChange={setSelectedTab} />
            {selectedTab === "Aperçu" && <RewriterOverviewTab />}
            {selectedTab === "Paramètres" && (
                <VStack flex={1} minH={0} p={4} spacing={4} align="stretch">
                    <NodeSettingsEditor mainNodeId={mainNodeId} onSettingSelect={onSettingSelect} />
                </VStack>
            )}
        </>
    );
};

export default RewriterNodeModal;
