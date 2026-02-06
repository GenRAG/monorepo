import { v4 as uuidv4 } from "uuid";
import { AppNode } from "lib/type/app-node";
import { TaskType } from "lib/type/task";
import { Edge } from "@xyflow/react";

export function CreateFlowNode(
  nodeType: TaskType,
  position?: { x: number; y: number },
  targetNodeId?: string,
  deletable?: boolean,
): { node: AppNode; edge?: Edge } {
  const newNode: AppNode = {
    id: uuidv4(),
    type: "GenNode",
    dragHandle: ".drag-handle",
    data: {
      type: nodeType,
      inputs: {},
      outputs: [],
    },
    deletable: deletable ?? true,
    position: position ?? { x: 0, y: 0 },
  };

  const newEdge = targetNodeId
    ? {
        id: `${newNode.id}-to-${targetNodeId}`,
        source: newNode.id,
        target: targetNodeId,
        animated: true,
      }
    : undefined;

  return { node: newNode, edge: newEdge };
}

export function linkNodes(sourceNode: string, targetNode: string) {
  return {
    id: `${sourceNode}-to-${targetNode}`,
    source: sourceNode,
    target: targetNode,
    animated: true,
  };
}