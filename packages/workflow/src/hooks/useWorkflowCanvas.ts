import React from "react";
import { type Edge } from "@xyflow/react";
import { useFlowTypes } from "./useFlowTypes";
import { UseWorkflowNodesOptions } from "./useWorkflowNodes";
import { type LayoutStrategy } from "../layout";
import type { AppNode, NodeComponentType } from "../types/app-node";
import { TaskRegistry } from "../graph/task/registry";

export interface UseWorkflowCanvasOptions {
    initialNodes?: AppNode[];
    initialEdges?: Edge[];
    initialVertical?: boolean;
    readonly?: boolean;
    layout?: LayoutStrategy;

    nodeComponent?: NodeComponentType;

    onNodeClick?: (nodeId: string) => void;
    onEdgeClick?: () => void;
    onInstructionSave?: (nodeId: string) => void;
    onMutation?: () => void;
}

export function useWorkflowCanvas(options: UseWorkflowCanvasOptions = {}) {
    const {
        nodeComponent,
        onNodeClick,
        onEdgeClick,
        onInstructionSave,
        onMutation,
        initialNodes,
        initialEdges,
        initialVertical,
        readonly,
        layout,
    } = options;

    const workflowNodesOptions: UseWorkflowNodesOptions = {
        initialNodes,
        initialEdges,
        initialVertical,
        readonly,
        layout,
        registry: TaskRegistry,
    };

    const { edgeTypes, nodeTypes, workflow } = useFlowTypes({ onEdgeClick, onNodeClick, onInstructionSave, onMutation, nodeComponent, workflowNodesOptions });

    return {
        ...workflow,
        nodeTypes,
        edgeTypes,
    };
}
