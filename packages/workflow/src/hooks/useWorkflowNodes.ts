import { useCallback, useRef } from "react";
import {
    useNodesState,
    useEdgesState,
    useReactFlow,
    type Edge,
} from "@xyflow/react";
import {
    CreateFlowNode,
    createSettingPlaceholders,
    linkNodes,
} from "../graph/create-flow-node";
import { TaskType, TaskParamType, type WorkflowRegistry, TaskChainOutput } from "../types/task";
import { EdgeType, HandleId } from "../types/edge";
import { TaskRegistry } from "../graph/task/registry";
import { AppNode } from "../types/app-node";
import { type LayoutStrategy, DEFAULT_LAYOUT } from "../layout";
import { getConfigInputs } from "../graph/task-utils";

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
                    const fieldUpdate =
                        n.data.inputType === TaskParamType.STRING
                            ? { stringValue: item, isEditing: false }
                            : { modelName: item };
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

            const nodes = nodesRef.current;
            const edges = edgesRef.current;

            const parentNode = nodes.find((n) =>
                registry[n.data.type]?.chainOutputs?.some(
                    (o: TaskChainOutput) => o.nodeType === nodeType,
                ),
            );

            if (!parentNode) return;

            const parentTask = registry[parentNode.data.type];
            const outputDef = parentTask.chainOutputs?.find(
                (o: TaskChainOutput) => o.nodeType === nodeType,
            );

            if (!outputDef) return;

            const outgoingEdge = edges.find(
                (e) =>
                    e.source === parentNode.id &&
                    e.sourceHandle === HandleId.MainSource,
            );

            const nextNode = outgoingEdge
                ? nodes.find((n) => n.id === outgoingEdge.target)
                : null;

            const newNode = CreateFlowNode(nodeType, layout.getInitialPosition(), outputDef.optional);

            const cfgInputs = getConfigInputs(newNode.data.type, registry);
            const { nodes: settingNodes, edges: settingEdges } =
                createSettingPlaceholders(newNode, cfgInputs, layout);

            const incomingEdge = linkNodes(parentNode.id, newNode.id);
            const newOutgoingEdge = nextNode ? linkNodes(newNode.id, nextNode.id) : null;

            const allNewEdges: Edge[] = [
                ...edges.filter(e => e.id !== outgoingEdge?.id),
                incomingEdge,
                ...(newOutgoingEdge ? [newOutgoingEdge] : []),
                ...settingEdges,
            ];

            const allNewNodes: AppNode[] = [...nodes, newNode, ...settingNodes];

            const placements = layout.computePlacements(allNewNodes, allNewEdges, newNode.id);
            const placementMap = new Map(placements.map(p => [p.id, p.position]));

            const oldPositionMap = new Map(allNewNodes.map(n => [n.id, n.position]));
            const settingPlacementMap = new Map<string, { x: number; y: number }>();

            allNewEdges
                .filter(e => e.type === EdgeType.Settings)
                .forEach(e => {
                    const newParentPos = placementMap.get(e.source);
                    if (!newParentPos) return;
                    const oldParentPos = oldPositionMap.get(e.source);
                    const settingNode = allNewNodes.find(n => n.id === e.target);
                    if (!oldParentPos || !settingNode) return;
                    settingPlacementMap.set(e.target, {
                        x: newParentPos.x + (settingNode.position.x - oldParentPos.x),
                        y: newParentPos.y + (settingNode.position.y - oldParentPos.y),
                    });
                });

            setNodes(
                allNewNodes.map(n => {
                    if (placementMap.has(n.id)) return { ...n, position: placementMap.get(n.id)! };
                    if (settingPlacementMap.has(n.id)) return { ...n, position: settingPlacementMap.get(n.id)! };
                    return n;
                }),
            );
            setEdges(allNewEdges);
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
        handleAddChainNode,
        handleRemoveChainNode,
    };
};
