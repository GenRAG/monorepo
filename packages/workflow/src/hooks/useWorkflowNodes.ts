import { useCallback, useRef } from "react";
import {
    useNodesState,
    useEdgesState,
    useReactFlow,
    type Edge,
} from "@xyflow/react";
import { createMultipleSettingNode, insertChainNode, linkNodes } from "../graph/create-flow-node";
import { TaskType, type WorkflowRegistry } from "../types/task";
import { EdgeType } from "../types/edge";
import { TaskRegistry } from "../graph/task/registry";
import { AppNode } from "../types/app-node";
import { type LayoutStrategy, DEFAULT_LAYOUT } from "../layout";
import { getConfigInputs } from "../graph/task-utils";
import { SETTING_KINDS } from "../graph/setting-kinds";

export interface UseWorkflowNodesOptions {
    initialNodes?: AppNode[];
    initialEdges?: Edge[];
    readonly?: boolean;
    layout?: LayoutStrategy;
    registry?: WorkflowRegistry;
}

export const useWorkflowNodes = (
    options: UseWorkflowNodesOptions = {},
) => {
    const layout: LayoutStrategy = options.layout ?? DEFAULT_LAYOUT;
    const registry = options.registry ?? TaskRegistry;
    const customInitialNodes = options.initialNodes;
    const customInitialEdges = options.initialEdges;
    const readonlyMode: boolean = options.readonly ?? false;

    const initialStateRef = useRef({
        nodes: customInitialNodes ?? [] as AppNode[],
        edges: customInitialEdges ?? [] as Edge[],
    });

    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(
        initialStateRef.current.nodes,
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
        initialStateRef.current.edges,
    );
    const { getEdges } = useReactFlow();

    // Refs so handleAddChainNode can read the latest nodes/edges without
    // capturing them as useCallback deps (which would recreate the function
    // on every position update, causing unnecessary downstream re-renders).
    const nodesRef = useRef(nodes);
    nodesRef.current = nodes;
    const edgesRef = useRef(edges);
    edgesRef.current = edges;

    const handleSettingSelect = useCallback(
        (nodeId: string, item: string) => {
            if (readonlyMode) return;
            setNodes((prev: AppNode[]) =>
                prev.map((n) => {
                    if (n.id !== nodeId) return n;
                    const fieldUpdate = SETTING_KINDS[n.data.type]?.write(n.data, item);
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            ...fieldUpdate,
                            isPlaceholder: false,
                            firstTime: false,
                        },
                    };
                }),
            );
        },
        [setNodes, readonlyMode],
    );

    /** Adds a setting node with `value` on a `multiple` input of `parentId` (e.g. a DATASET of the RETRIEVER). */
    const handleAddSettingNode = useCallback(
        (parentId: string, inputName: string, value: string) => {
            if (readonlyMode) return;
            const parent = nodesRef.current.find((n) => n.id === parentId);
            const input = parent && getConfigInputs(parent.data.type, registry).find((i) => i.name === inputName);
            if (!parent || !input?.multiple) return;

            const existingCount = edgesRef.current.filter(
                (e) => e.source === parentId && e.type === EdgeType.Settings,
            ).length;
            const { node, edge } = createMultipleSettingNode(parent, input, value, existingCount, layout);

            setNodes((prev) => [...prev, node]);
            setEdges((prev) => [...prev, edge]);
        },
        [setNodes, setEdges, readonlyMode, layout, registry],
    );

    /** Removes a setting node and its settings edge (only meaningful for `multiple` inputs). */
    const handleRemoveSettingNode = useCallback(
        (nodeId: string) => {
            if (readonlyMode) return;
            setNodes((prev) => prev.filter((n) => n.id !== nodeId));
            setEdges((prev) => prev.filter((e) => e.target !== nodeId));
        },
        [setNodes, setEdges, readonlyMode],
    );

    const handleRemoveChainNode = useCallback(
        (nodeId: string) => {
            if (readonlyMode) return;
            const allEdges = getEdges();

            const settingNodeIds = allEdges
                .filter((e) => e.source === nodeId && e.type === EdgeType.Settings)
                .map((e) => e.target);

            const incomingEdge = allEdges.find(
                (e) => e.target === nodeId && e.type !== EdgeType.Settings,
            );
            const outgoingEdge = allEdges.find(
                (e) => e.source === nodeId && e.type !== EdgeType.Settings,
            );

            const idsToRemove = new Set([nodeId, ...settingNodeIds]);

            setNodes((prev) => prev.filter((n) => !idsToRemove.has(n.id)));
            setEdges((prev) => {
                const remaining = prev.filter(
                    (e) => !idsToRemove.has(e.source) && !idsToRemove.has(e.target),
                );
                if (!incomingEdge || !outgoingEdge) return remaining;
                return [...remaining, linkNodes(incomingEdge.source, outgoingEdge.target)];
            });
        },
        [getEdges, setNodes, setEdges, readonlyMode],
    );

    const handleAddChainNode = useCallback(
        (nodeType: TaskType) => {
            if (readonlyMode) return;
            const next = insertChainNode(nodesRef.current, edgesRef.current, nodeType, layout, registry);
            if (!next) return;
            // Refs updated before the render: a second call (double click) sees the node and does nothing.
            nodesRef.current = next.nodes;
            edgesRef.current = next.edges;
            setNodes(next.nodes);
            setEdges(next.edges);
        },
        [setNodes, setEdges, readonlyMode, layout, registry],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    return {
        nodes,
        edges,
        isVertical: layout.isVertical,
        readonly: readonlyMode,
        onNodesChange,
        onEdgesChange,
        onDragOver,
        handleSettingSelect,
        handleAddSettingNode,
        handleRemoveSettingNode,
        handleAddChainNode,
        handleRemoveChainNode,
    };
};
