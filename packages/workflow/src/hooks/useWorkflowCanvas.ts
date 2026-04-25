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
    isMenuOpen?: boolean;
    onMenuOpen?: () => void;
    onMenuClose?: () => void;
}

export function useWorkflowCanvas(options: UseWorkflowCanvasOptions = {}) {
    const {
        nodeComponent,
        onNodeClick,
        isMenuOpen,
        onMenuOpen,
        onMenuClose,
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

    const { edgeTypes, nodeTypes } = useFlowTypes({
        isVertical: workflow.isVertical,
        onNodeClick,
        isMenuOpen,
        onMenuOpen,
        onMenuClose,
    });

    const resolvedNodeTypes = useMemo(() => {
        const Renderer = nodeComponent ?? NodeComponent;
        const GenNode = (props: any) =>
            React.createElement(Renderer, {
                ...props,
                isVertical: workflow.isVertical,
                onNodeClick,
                onRemoveNode: workflow.handleRemoveChainNode,
            });
        return { ...nodeTypes, GenNode };
    }, [nodeTypes, nodeComponent, workflow.isVertical, onNodeClick, workflow.handleRemoveChainNode]);

    return {
        ...workflow,
        nodeTypes: resolvedNodeTypes,
        edgeTypes,
    };
}
