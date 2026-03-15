import { useCallback, useEffect, useRef, useState } from "react";
import {
    useNodesState,
    useEdgesState,
    useReactFlow,
    addEdge,
    Connection,
    Edge,
} from "@xyflow/react";
import {
    CreateFlowNode,
    linkNodes,
    createSettingPlaceholders,
} from "lib/workflow/create-flow-node";
import { TaskType, Task, TaskParam } from "lib/type/task";
import { TaskRegistry } from "lib/workflow/task/registry";
import { AppNode } from "lib/type/app-node";
import { resolveCollisions } from "lib/workflow/resolve-collisions";

export function getConfigInputs(taskType: TaskType): TaskParam[] {
    const task = TaskRegistry[taskType] as Task;
    return task.inputs.filter(
        (i: TaskParam) => !i.hideHandle && taskType === task.type,
    );
}

export function getChainOutputs(taskType: TaskType) {
    const task = TaskRegistry[taskType] as Task;
    return task.chainOutputs ?? [];
}

const buildInitialState = (isVertical: boolean = true) => {
    const n1 = CreateFlowNode(TaskType.QUERY, { x: 0, y: 0 }, undefined, false);
    const n2 = CreateFlowNode(
        TaskType.RETRIEVER,
        isVertical ? { x: 0, y: 200 } : { x: 300, y: 0 },
        undefined,
        false,
    );
    const n3 = CreateFlowNode(
        TaskType.RESPONSE,
        isVertical ? { x: 0, y: 400 } : { x: 600, y: 0 },
        undefined,
        false,
    );

    const mainNodes = [n1.node, n2.node, n3.node];
    const mainEdges: Edge[] = [
        linkNodes(n1.node.id, n2.node.id),
        linkNodes(n2.node.id, n3.node.id),
    ];

    const extraNodes: AppNode[] = [];
    const extraEdges: Edge[] = [];

    mainNodes.forEach((node) => {
        const cfgInputs = getConfigInputs(node.data.type);
        if (cfgInputs.length > 0) {
            const { nodes: pn, edges: pe } = createSettingPlaceholders(
                node,
                cfgInputs,
            );
            extraNodes.push(...pn);
            extraEdges.push(...pe);
        }
    });

    return {
        nodes: [...mainNodes, ...extraNodes],
        edges: [...mainEdges, ...extraEdges],
    };
};

export const useWorkflowNodes = (initialVertical: boolean = true) => {
    const [isVertical, setIsVertical] = useState(initialVertical);
    const initialStateRef = useRef(buildInitialState(initialVertical));

    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(
        initialStateRef.current.nodes,
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
        initialStateRef.current.edges,
    );
    const {
        screenToFlowPosition,
        updateNodeData,
        getEdges,
        deleteElements,
        addEdges,
    } = useReactFlow();

    const handleSettingSelect = useCallback(
        (nodeId: string, item: string) => {
            const task = TaskRegistry[TaskType.MODEL] as Task;
            const offset = task?.position ?? { x: 0, y: 0 };

            setNodes((prev: AppNode[]) =>
                prev.map((n: AppNode) => {
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
        [setNodes],
    );

    const pendingCollisionRef = useRef(false);

    useEffect(() => {
        if (!pendingCollisionRef.current) return;
        const allMeasured = nodes.every((n) => n.measured?.width !== undefined);
        if (!allMeasured) return;

        pendingCollisionRef.current = false;
        setNodes(
            (prev: AppNode[]) =>
                resolveCollisions(prev, {
                    maxIterations: Infinity,
                    overlapThreshold: 0.5,
                    margin: 15,
                }) as AppNode[],
        );
    }, [nodes, setNodes]);

    const handleRemoveChainNode = useCallback(
        async (nodeId: string) => {
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
        [getEdges, deleteElements, addEdges],
    );

    const handleAddChainNode = useCallback(
        (nodeType: TaskType) => {
            const parentNode = nodes.find((n) => {
                const task = TaskRegistry[n.data.type] as Task;
                return task.chainOutputs?.some((o) => o.nodeType === nodeType);
            });
            if (!parentNode) return;

            const parentTask = TaskRegistry[parentNode.data.type] as Task;
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

            const isVert = nextNode
                ? Math.abs(nextNode.position.y - parentNode.position.y) >
                  Math.abs(nextNode.position.x - parentNode.position.x)
                : true;

            const position = nextNode
                ? {
                      x: (parentNode.position.x + 50 + nextNode.position.x) / 2,
                      y: (parentNode.position.y + 50 + nextNode.position.y) / 2,
                  }
                : {
                      x: parentNode.position.x + (outputDef.position.x ?? 0),
                      y: parentNode.position.y + (outputDef.position.y ?? 0),
                  };

            const newNode = CreateFlowNode(
                nodeType,
                position,
                undefined,
                outputDef.optional,
            ).node;

            const cfgInputs = getConfigInputs(nodeType);
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

            const getDownstreamNodes = (startNodeId: string): string[] => {
                const downstream: string[] = [];
                const visited = new Set<string>();
                const queue = [startNodeId];
                while (queue.length > 0) {
                    const currentId = queue.shift()!;
                    if (visited.has(currentId)) continue;
                    visited.add(currentId);
                    downstream.push(currentId);
                    const mainEdge = edges.find(
                        (e) =>
                            e.source === currentId &&
                            e.sourceHandle === "main-source",
                    );
                    if (mainEdge) queue.push(mainEdge.target);
                    edges
                        .filter(
                            (e) =>
                                e.source === currentId && e.type === "settings",
                        )
                        .forEach((e) => queue.push(e.target));
                }
                return downstream;
            };

            if (nextNode) {
                const downstreamIds = getDownstreamNodes(nextNode.id);
                const OFFSET_X = isVert
                    ? 0
                    : (nextNode.position.x - parentNode.position.x) / 2;
                const OFFSET_Y = isVert
                    ? (nextNode.position.y - parentNode.position.y) / 2
                    : 0;

                setNodes((prev: AppNode[]) => [
                    ...prev.map((n: AppNode) => {
                        if (!downstreamIds.includes(n.id)) return n;
                        return {
                            ...n,
                            position: {
                                x: n.position.x + OFFSET_X,
                                y: n.position.y + OFFSET_Y,
                            },
                        };
                    }),
                    newNode,
                    ...settingNodes,
                ]);
            } else {
                setNodes((prev: AppNode[]) => [
                    ...prev,
                    newNode,
                    ...settingNodes,
                ]);
            }

            setEdges((prev: Edge[]) => {
                const filtered = outgoingEdge
                    ? prev.filter((e: Edge) => e.id !== outgoingEdge.id)
                    : prev;
                return [
                    ...filtered,
                    incomingEdge,
                    ...(newOutgoingEdge ? [newOutgoingEdge] : []),
                    ...settingEdges,
                ];
            });
        },
        [nodes, edges, setNodes, setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const taskType = event.dataTransfer.getData(
                "application/reactflow",
            );
            if (!taskType) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = CreateFlowNode(taskType as TaskType, position).node;
            const cfgInputs = getConfigInputs(taskType as TaskType);
            const { nodes: pNodes, edges: pEdges } = createSettingPlaceholders(
                newNode,
                cfgInputs,
            );

            setNodes((prev: AppNode[]) => [...prev, newNode, ...pNodes]);
            if (pEdges.length > 0) {
                setEdges((prev: Edge[]) => [...prev, ...pEdges]);
            }
        },
        [screenToFlowPosition, setNodes, setEdges],
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((edges: Edge[]) =>
                addEdge({ ...connection, animated: true }, edges),
            );
            if (!connection.targetHandle) return;

            const node = nodes.find((n) => n.id === connection.target);
            if (!node) return;

            updateNodeData(node.id, {
                inputs: { ...node.data.inputs, [connection.targetHandle]: "" },
            });
        },
        [setEdges, updateNodeData, nodes],
    );

    return {
        nodes,
        edges,
        isVertical,
        setIsVertical,
        onNodesChange,
        onEdgesChange,
        onDragOver,
        onDrop,
        onConnect,
        handleSettingSelect,
        handleAddChainNode,
        handleRemoveChainNode,
    };
};
