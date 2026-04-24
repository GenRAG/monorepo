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
import { TaskType, Task } from "../types/task";
import { TaskRegistry as LegacyTaskRegistry } from "../graph/task/registry";
import { type WorkflowRegistry, DEFAULT_TASK_REGISTRY } from "../graph/registry";
import { AppNode } from "../types/app-node";
import { type LayoutStrategy, DEFAULT_LAYOUT } from "../layout";
import { getConfigInputs, getChainOutputs } from "../graph/task-utils";

export { getConfigInputs, getChainOutputs };

export interface UseWorkflowNodesOptions {
    initialVertical?: boolean;
    initialNodes?: AppNode[];
    initialEdges?: Edge[];
    registry?: WorkflowRegistry;
    readonly?: boolean;
    layout?: LayoutStrategy;
}

export const useWorkflowNodes = (
    options: boolean | UseWorkflowNodesOptions = true,
) => {
    const layout: LayoutStrategy = (typeof options === "object" && options.layout) ? options.layout : DEFAULT_LAYOUT;
    const initialVertical =
        typeof options === "boolean"
            ? options
            : (options.initialVertical ?? layout.isVertical);
    const customInitialNodes = typeof options === "object" ? options.initialNodes : undefined;
    const customInitialEdges = typeof options === "object" ? options.initialEdges : undefined;
    const registry: WorkflowRegistry = (typeof options === "object" && options.registry) ? options.registry : DEFAULT_TASK_REGISTRY;
    const readonlyMode: boolean = (typeof options === "object" && options.readonly) ? options.readonly : false;

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

    const handleSettingSelect = useCallback(
        (nodeId: string, item: string) => {
            if (readonlyMode) return;
            const task = LegacyTaskRegistry[TaskType.MODEL] as Task;
            const offset = task?.position ?? { x: 0, y: 0 };

            setNodes((prev: AppNode[]) =>
                prev.map((n) => {
                    if (n.id !== nodeId) return n;
                    const pos = n.position ?? { x: 0, y: 0 };
                    const hasAlreadySelected = n.data.firstTime === false;
                    return {
                        ...n,
                        position: {
                            x: hasAlreadySelected ? pos.x : pos.x + offset.x,
                            y: hasAlreadySelected ? pos.y : pos.y + offset.y,
                        },
                        data: {
                            ...n.data,
                            isPlaceholder: false,
                            modelName: item,
                            firstTime: false,
                        },
                    };
                }),
            );
        },
        [setNodes, readonlyMode],
    );

    const pendingCollisionRef = useRef(false);

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

            const parentNode = nodes.find((n) => {
                const task = LegacyTaskRegistry[n.data.type] as Task;
                return task?.chainOutputs?.some((o) => o.nodeType === nodeType);
            });

            if (!parentNode) return;

            const parentTask = LegacyTaskRegistry[parentNode.data.type] as Task;
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
                createSettingPlaceholders(newNode, cfgInputs);

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

            pendingCollisionRef.current = true;
        },
        [nodes, edges, setNodes, setEdges, readonlyMode, layout],
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
        registry,
    };
};
