import React, { useMemo } from "react";
import { type Edge } from "@xyflow/react";
import { useFlowTypes } from "./useFlowTypes";
import { useWorkflowNodes, UseWorkflowNodesOptions } from "./useWorkflowNodes";
import NodeComponent from "../components/nodes/NodeComponent";
import { type LayoutStrategy } from "../layout";
import type { AppNode, NodeComponentType } from "../types/app-node";

export interface UseWorkflowCanvasOptions {
    initialNodes?: AppNode[];
    initialEdges?: Edge[];
    initialVertical?: boolean;
    readonly?: boolean;
    layout?: LayoutStrategy;

    nodeComponent?: NodeComponentType;

    onNodeClick?: (nodeId: string) => void;
    onEdgeClick?: () => void;
}

export function useWorkflowCanvas(options: UseWorkflowCanvasOptions = {}) {
    const {
        nodeComponent,
        onNodeClick,
        onEdgeClick,
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
    };

    const workflow = useWorkflowNodes(workflowNodesOptions);

    const { edgeTypes } = useFlowTypes({ onEdgeClick });

    const nodeTypes = useMemo(() => {
        const Renderer = nodeComponent ?? NodeComponent;
        return {
            GenNode: (props: any) =>
                React.createElement(Renderer, {
                    ...props,
                    isVertical: workflow.isVertical,
                    onNodeClick,
                    onRemoveNode: workflow.handleRemoveChainNode,
                }),
        };
    }, [nodeComponent, workflow.isVertical, onNodeClick, workflow.handleRemoveChainNode]);

    return {
        ...workflow,
        nodeTypes,
        edgeTypes,
    };
}
