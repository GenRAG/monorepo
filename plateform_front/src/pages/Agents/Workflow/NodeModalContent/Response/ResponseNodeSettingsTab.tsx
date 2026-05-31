import { VStack } from "@chakra-ui/react";
import type { Task, AppNodeData } from "@genrag/workflow";
import { NodeSettingsEditor } from "pages/Agents/Workflow/NodeModalContent/NodeSettingsEditor";

interface ResponseSettingsTabProps {
    task: Task;
    nodeData: AppNodeData;
    mainNodeId: string;
    onSettingSelect: (nodeId: string, item: string) => void;
}

const ResponseSettingsTab = ({ mainNodeId, onSettingSelect }: ResponseSettingsTabProps) => (
    <VStack flex={1} p={4} spacing={4} align="stretch" overflowY="auto">
        <NodeSettingsEditor mainNodeId={mainNodeId} onSettingSelect={onSettingSelect} />
    </VStack>
);

export default ResponseSettingsTab;
