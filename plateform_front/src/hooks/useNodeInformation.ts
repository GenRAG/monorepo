import { useReactFlow } from "@xyflow/react";
import { AppNodeData } from "lib/type/app-node";
import { Task } from "lib/type/task";
import { TaskRegistry } from "lib/workflow/task/registry";
import { useMemo } from "react";


const useNodeInformation = (selectedNodeId: string | null) => {

    const { getNode } = useReactFlow();

    const selectedNode = useMemo(() => {
        if (!selectedNodeId) return null;
        return getNode(selectedNodeId as string);
    }, [selectedNodeId]);

    const nodeData = selectedNode?.data as AppNodeData;

    const task = useMemo(() => {
        if (!nodeData) return null;
        return TaskRegistry[nodeData.type] as Task;
    }, [nodeData]);

    return {
        task,
    };
};

export default useNodeInformation;