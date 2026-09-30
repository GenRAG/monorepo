import { useReactFlow } from "@xyflow/react";
import { AppNodeData } from "../types/app-node";
import { useTaskRegistry } from "../graph/task/registry";

const useNodeInformation = (selectedNodeId: string | null) => {
    const { getNode } = useReactFlow();
    const registry = useTaskRegistry();

    const selectedNode = selectedNodeId ? getNode(selectedNodeId) : null;
    const nodeData = selectedNode?.data as AppNodeData;
    const task = nodeData ? registry[nodeData.type] : null;

    return {
        task,
        nodeData,
    };
};

export default useNodeInformation;
