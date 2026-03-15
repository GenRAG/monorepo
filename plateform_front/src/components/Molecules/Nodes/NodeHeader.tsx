"use client";

import { TaskRegistry } from "lib/workflow/task/registry";
import { TaskType } from "lib/type/task";
import { GripVerticalIcon, TrashIcon } from "lucide-react";
import { Button } from "@chakra-ui/react";
import { useReactFlow } from "@xyflow/react";

function NodeHeader({
    taskType,
    nodeId,
}: {
    taskType: TaskType;
    nodeId: string;
}) {
    const task = TaskRegistry[taskType];
    const { deleteElements, getNodes, getEdges, setEdges, setNodes } =
        useReactFlow();

    const handleDeleteNode = async () => {
        const nodes = getNodes();
        const edges = getEdges();

        const incomingEdge = edges.find((edge) => edge.target === nodeId);
        const outgoingEdge = edges.find((edge) => edge.source === nodeId);

        if (incomingEdge && outgoingEdge) {
            const sourceNode = nodes.find(
                (node) => node.id === incomingEdge.source,
            );
            const targetNode = nodes.find(
                (node) => node.id === outgoingEdge.target,
            );

            if (sourceNode && targetNode) {
                const newEdge = {
                    id: `${incomingEdge.source}-to-${outgoingEdge.target}`,
                    source: incomingEdge.source,
                    target: outgoingEdge.target,
                    animated: true,
                };

                setEdges((prevEdges) =>
                    prevEdges
                        .filter(
                            (edge) =>
                                edge.source !== nodeId &&
                                edge.target !== nodeId,
                        )
                        .concat(newEdge),
                );

                setNodes((prevNodes) =>
                    prevNodes.map((node) => {
                        if (
                            node.id === targetNode.id ||
                            node.position.x >= targetNode.position.x
                        ) {
                            return {
                                ...node,
                                position: {
                                    x: node.position.x - 500,
                                    y: node.position.y,
                                },
                            };
                        }
                        return node;
                    }),
                );
            }
        } else {
            setEdges((prevEdges) =>
                prevEdges.filter(
                    (edge) => edge.source !== nodeId && edge.target !== nodeId,
                ),
            );
        }

        await deleteElements({ nodes: [{ id: nodeId }] });
    };

    return (
        <div className="flex items-center gap-2 p-2">
            <task.icon size={16} />
            <div
                className="flex justify-between items-center w-full"
                id={task.id}
            >
                <p className="text-xs font-bold uppercase text-muted-foreground">
                    {taskType}
                </p>
                <div className="flex gap-1 items-center">
                    {task.isDeletable && (
                        <Button
                            variant={"ghost"}
                            size={"icon"}
                            onClick={async () => {
                                await handleDeleteNode();
                            }}
                        >
                            <TrashIcon size={12} className="cursor-pointer" />
                        </Button>
                    )}
                    {task.isDraggable && (
                        <Button
                            variant={"ghost"}
                            size={"icon"}
                            className="drag-handle cursor-grab"
                        >
                            <GripVerticalIcon size={20} />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NodeHeader;
