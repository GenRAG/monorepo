import { useCallback, useRef, useState } from "react";
import {
    useNodesState,
    useEdgesState,
    useReactFlow,
    Edge,
} from "@xyflow/react";
import {
    CreateFlowNode,
    createSettingPlaceholders,
} from "../graph/create-flow-node";
import { TaskType, TaskParamType } from "../types/task";
import { TaskRegistry as LegacyTaskRegistry } from "../graph/task/registry";
import { AppNode } from "../types/app-node";
import { type LayoutStrategy, DEFAULT_LAYOUT } from "../layout";
import { getConfigInputs, getChainOutputs } from "../graph/task-utils";

export { getConfigInputs, getChainOutputs };

export interface UseWorkflowNodesOptions {
    initialVertical?: boolean;
    initialNodes?: AppNode[];
    initialEdges?: Edge[];
    readonly?: boolean;
    layout?: LayoutStrategy;
}

export const useWorkflowNodes = (
    options: UseWorkflowNodesOptions = {},
) => {
    const layout: LayoutStrategy = options.layout ?? DEFAULT_LAYOUT;
    const initialVertical = options.initialVertical ?? layout.isVertical;
    const customInitialNodes = options.initialNodes;
    const customInitialEdges = options.initialEdges;
    const readonlyMode: boolean = options.readonly ?? false;

    const [isVertical, setIsVertical] = useState(initialVertical);
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
    const {
        getEdges,
        deleteElements,
        addEdges,
    } = useReactFlow();

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
        async (nodeId: string) => {
            if (readonlyMode) return;
            const allEdges = getEdges();

            const settingEdges = allEdges.filter(
                (e) => e.source === nodeId && e.type === "settings",
            );
            const settingNodeIds = settingEdges.map((e) => e.target);

            const incomingEdge = allEdges.find((e) => e.target === nodeId);
            const outgoingEdge = allEdges.find((e) => e.source === nodeId);

            await deleteElements({
                nodes: [
                    { id: nodeId },
                    ...settingNodeIds.map((id) => ({ id })),
                ],
            });

            if (incomingEdge && outgoingEdge) {
                addEdges([
                    {
                        id: `${incomingEdge.source}-to-${outgoingEdge.target}`,
                        source: incomingEdge.source,
                        target: outgoingEdge.target,
                        sourceHandle: "main-source",
                        targetHandle: "main-target",
                        animated: true,
                        type: "default",
                    },
                ]);
            }
        },
        [getEdges, deleteElements, addEdges, readonlyMode],
    );

    const handleAddChainNode = useCallback(
        (nodeType: TaskType) => {
            
            if (readonlyMode) return;

            const nodes = nodesRef.current;
            const edges = edgesRef.current;

            const parentNode = nodes.find((n) =>
                LegacyTaskRegistry[n.data.type]?.chainOutputs?.some(
                    (o) => o.nodeType === nodeType,
                ),
            );

            if (!parentNode) return;

            const parentTask = LegacyTaskRegistry[parentNode.data.type];
            const outputDef = parentTask.chainOutputs?.find(
                (o) => o.nodeType === nodeType,
            );

            if (!outputDef) return;

            const outgoingEdge = edges.find(
                (e) =>
                    e.source === parentNode.id &&
                    e.sourceHandle === "main-source",
            );

            const nextNode = outgoingEdge
                ? nodes.find((n) => n.id === outgoingEdge.target)
                : null;

            const newNode = CreateFlowNode(
                nodeType,
                layout.getInitialPosition(),
                undefined,
                outputDef.optional,
            ).node;

            const cfgInputs = getConfigInputs(newNode.data.type);
            const { nodes: settingNodes, edges: settingEdges } =
                createSettingPlaceholders(newNode, cfgInputs, layout);

            const incomingEdge = {
                id: `${parentNode.id}-chain-to-${newNode.id}`,
                source: parentNode.id,
                target: newNode.id,
                sourceHandle: "main-source",
                targetHandle: "main-target",
                animated: true,
                type: "default",
            };

            const newOutgoingEdge = nextNode
                ? {
                    id: `${newNode.id}-chain-to-${nextNode.id}`,
                    source: newNode.id,
                    target: nextNode.id,
                    sourceHandle: "main-source",
                    targetHandle: "main-target",
                    animated: true,
                    type: "default",
                }
                : null;

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
                .filter(e => e.type === 'settings')
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
        [setNodes, setEdges, readonlyMode, layout],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    return {
        nodes,
        edges,
        isVertical,
        readonly: readonlyMode,
        setIsVertical,
        onNodesChange,
        onEdgesChange,
        onDragOver,
        handleSettingSelect,
        handleAddChainNode,
        handleRemoveChainNode,
    };
};
