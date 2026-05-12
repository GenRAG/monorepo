import type {
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  Connection,
  EdgeTypes,
  NodeTypes,
} from "@xyflow/react";
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

export interface AppNodeData {
  type: TaskType;
  inputs: Record<string, string>;
  outputs: string[];
  [key: string]: any;
}

export interface AppNode extends Node {
  data: AppNodeData;
}

export declare function useFlowTypes(options?: {
  isMenuOpen?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onNodeClick?: (nodeId: string) => void;
  isVertical?: boolean;
}): {
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
};

export declare function useNodeSelection(): {
  selectedNodeId: string | null;
  task: any;
  nodeData: any;
  isModalOpen: boolean;
  handleNodeClick: (nodeId: string) => void;
  handleModalClose: () => void;
};

export declare function useWorkflowNodes(options?: boolean | {
  initialVertical?: boolean;
  preset?: "default" | "showcase";
}): {
  nodes: AppNode[];
  edges: Edge[];
  isVertical: boolean;
  setIsVertical: (value: boolean) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onDragOver: (event: any) => void;
  onDrop: (event: any) => void;
  handleSettingSelect: (nodeId: string, item: string) => void;
  handleAddChainNode: (nodeType: any) => void;
  handleRemoveChainNode: (nodeId: string) => void;
};

export declare function WorkflowBuilder(props: {
  interactive?: boolean;
  preset?: "default" | "showcase";
}): JSX.Element;
