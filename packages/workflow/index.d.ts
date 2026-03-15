import type { Edge, NodeChange, EdgeChange, Connection } from "@xyflow/react";
import type { JSX } from "react";

export enum TaskType {
  QUERY = "QUERY",
  REWRITER = "REWRITER",
  RETRIEVER = "RETRIEVER",
  RERANKER = "RERANKER",
  RESPONSE = "RESPONSE",
  MODEL = "MODEL",
  INSTRUCTION = "INSTRUCTION",
}

export declare function useFlowTypes(options?: {
  isVertical?: boolean;
}): {
  nodeTypes: Record<string, unknown>;
  edgeTypes: Record<string, unknown>;
};

export declare function useNodeSelection(options: {
  selectedNodeId: string | null;
  nodes: any[];
  setNodes: (updater: (nodes: any[]) => any[]) => void;
}): {
  node: any;
  selectedNode: any;
  updateNodeParamValue: (paramName: string, value: string) => void;
  updateInputNodeModelType: (value: string) => void;
  updateInputNodeInstructionPrompt: (value: string) => void;
};

export declare function useWorkflowNodes(options?: {
  isVertical?: boolean;
}): {
  nodes: any[];
  edges: Edge[];
  selectedNode: any;
  setNodes: (updater: any) => void;
  setEdges: (updater: any) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onDragOver: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
  onNodeClick: (event: MouseEvent, node: any) => void;
  onInit: (instance: any) => void;
  handleDeleteNode: (nodeId: string) => void;
  setSelectedNode: (node: any) => void;
};

export declare function WorkflowBuilder(props: {
  interactive?: boolean;
  preset?: "default" | "showcase";
}): JSX.Element;
