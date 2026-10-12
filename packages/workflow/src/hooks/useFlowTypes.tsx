import { useMemo, useRef, createElement } from "react";
import GenEdge from "../components/edges/GenEdge";
import SettingsEdge from "../components/edges/SettingsEdge";
import { EdgeType } from "../types/edge";
import type { NodeComponentType } from "../types/app-node";
import NodeComponent from "../components/nodes/NodeComponent";
import AllDatasetsNode from "../components/nodes/SettingNodes/AllDatasetsNode";
import { EMPTY_SETTING_NODE_TYPE } from "../graph/create-flow-node";
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

    // In readonly mode nodes get no remove callback: NodeComponent only shows the trash button when it has one.
    const nodeCallbacks = {
        onNodeClick,
        onRemoveNode: workflow.readonly ? undefined : wrappedRemove,
        onInstructionSave,
        onMutation,
        isVertical: workflow.isVertical,
        readonly: workflow.readonly,
    };
    const nodeCallbacksRef = useRef(nodeCallbacks);
    nodeCallbacksRef.current = nodeCallbacks;
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
                    readonly: nodeCallbacksRef.current.readonly,
                }),
            [EMPTY_SETTING_NODE_TYPE]: (props: any) =>
                createElement(AllDatasetsNode, {
                    ...props,
                    onNodeClick: nodeCallbacksRef.current.onNodeClick,
                    readonly: nodeCallbacksRef.current.readonly,
                }),
            }),

        [nodeComponent],
    );

    return { edgeTypes, nodeTypes, workflow };

};
