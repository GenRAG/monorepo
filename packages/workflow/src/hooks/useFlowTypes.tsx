import { useMemo, useRef, createElement } from "react";
import GenEdge from "../components/edges/GenEdge";
import SettingsEdge from "../components/edges/SettingsEdge";
import { EdgeType } from "../types/edge";
import type { NodeComponentType } from "../types/app-node";
import NodeComponent from "../components/nodes/NodeComponent";
import { useWorkflowNodes, UseWorkflowNodesOptions } from "./useWorkflowNodes";

interface UseFlowTypesParams {
    onEdgeClick?: () => void;
    onNodeClick?: (nodeId: string) => void;
    onInstructionSave?: (nodeId: string) => void;
    onMutation?: () => void;
    nodeComponent?: NodeComponentType
    workflowNodesOptions: UseWorkflowNodesOptions;
}

export const useFlowTypes = ({
    onNodeClick,
    onEdgeClick,
    onInstructionSave,
    onMutation,
    nodeComponent,
    workflowNodesOptions
}: UseFlowTypesParams) => {

    const workflow = useWorkflowNodes(workflowNodesOptions);
    const onEdgeClickRef = useRef(onEdgeClick);
    onEdgeClickRef.current = onEdgeClick;

    const edgeTypes = useMemo(
        () => ({
            [EdgeType.Main]: (props: any) => (
                <GenEdge {...props} onToggle={onEdgeClickRef.current} />
            ),
            [EdgeType.Settings]: (props: any) => <SettingsEdge {...props} />,
        }),
        [],
    );

    const wrappedRemove = useMemo(
        () => (nodeId: string) => {
            workflow.handleRemoveChainNode(nodeId);
            onMutation?.();
        },
        [workflow.handleRemoveChainNode],
    );

    const nodeCallbacksRef = useRef({ onNodeClick, onRemoveNode: wrappedRemove, onInstructionSave, onMutation, isVertical: workflow.isVertical });
    nodeCallbacksRef.current = { onNodeClick, onRemoveNode: wrappedRemove, onInstructionSave, onMutation, isVertical: workflow.isVertical };
    const Renderer = nodeComponent ?? NodeComponent;

    const nodeTypes = useMemo(
        () => ({

            GenNode: (props: any) =>
                createElement(Renderer, {
                    ...props,
                    isVertical: nodeCallbacksRef.current.isVertical,
                    onNodeClick: nodeCallbacksRef.current.onNodeClick,
                    onRemoveNode: nodeCallbacksRef.current.onRemoveNode,
                    onInstructionSave: nodeCallbacksRef.current.onInstructionSave,
                    onMutation: nodeCallbacksRef.current.onMutation,
                }),
            }),

        [nodeComponent],
    );

    return { edgeTypes, nodeTypes, workflow };

};
