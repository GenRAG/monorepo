import { useReactFlow } from "@xyflow/react";
import { AppNodeData } from "../types/app-node";
import { Task } from "../types/task";
import { TaskRegistry } from "../graph/task/registry";

const useNodeInformation = (selectedNodeId: string | null) => {
    const { getNode } = useReactFlow();

    const selectedNode = selectedNodeId ? getNode(selectedNodeId) : null;
    const nodeData = selectedNode?.data as AppNodeData;
    const task = nodeData ? (TaskRegistry[nodeData.type] as Task) : null;

    return {
        task,
        nodeData,
    };
};

export default useNodeInformation;
