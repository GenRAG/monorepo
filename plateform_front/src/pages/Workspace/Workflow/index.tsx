import { useMemo, useRef } from "react";
import "@xyflow/react/dist/style.css";
import { useColorMode, VStack, Box, useDisclosure } from "@chakra-ui/react";
import WorkspaceHeader from "components/Molecules/WorkspaceHeader";
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    MiniMap,
    ReactFlowProvider,
} from "@xyflow/react";
import {
    useFlowTypes,
    useNodeSelection,
    useWorkflowNodes,
} from "@genrag/workflow";
import { NodeModal } from "pages/Workspace/Workflow/NodeModal";
import MenuNodeModal from "pages/Workspace/Workflow/MenuNodeModal";
import CustomControls from "pages/Workspace/Workflow/CustomControls";
import NodeComponent from "components/Molecules/Nodes/NodeComponent";

import { TaskType } from "@genrag/workflow";

type WorkflowNodesResult = {
    nodes: any[];
    edges: any[];
    onNodesChange: any;
    onEdgesChange: any;
    onDragOver: (event: any) => void;
    onDrop: (event: any) => void;
    onConnect: any;
    handleSettingSelect: (nodeId: string, item: string) => void;
    handleAddChainNode: (nodeType: any) => void;
};

type WorkflowSelectionResult = {
    selectedNodeId: string | null;
    task: any;
    nodeData: any;
    isModalOpen: boolean;
    handleNodeClick: (nodeId: string) => void;
    handleModalClose: () => void;
};

type FlowTypesResult = {
    nodeTypes: any;
    edgeTypes: any;
};

const WorkflowCanvas = () => {
    const { colorMode } = useColorMode();
    const reactFlowContainerRef = useRef<HTMLDivElement>(null);

    const {
        isOpen: isMenuOpen,
        onOpen: onMenuOpen,
        onClose: onMenuClose,
    } = useDisclosure({ defaultIsOpen: false });

    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onDragOver,
        onDrop,
        onConnect,
        handleSettingSelect,
        handleAddChainNode,
    } = (useWorkflowNodes as unknown as () => WorkflowNodesResult)();

    const {
        selectedNodeId,
        task,
        nodeData,
        isModalOpen,
        handleNodeClick,
        handleModalClose,
    } = (useNodeSelection as unknown as () => WorkflowSelectionResult)();

    const { edgeTypes, nodeTypes } = (
        useFlowTypes as unknown as (options: any) => FlowTypesResult
    )({
        isMenuOpen,
        onMenuOpen,
        onMenuClose,
        onNodeClick: handleNodeClick,
        isVertical: true,
    });

    const appNodeTypes = useMemo(
        () => ({
            ...nodeTypes,
            GenNode: (props: any) => (
                <NodeComponent
                    {...props}
                    isVertical={true}
                    onNodeClick={handleNodeClick}
                />
            ),
        }),
        [nodeTypes, handleNodeClick],
    );

    const snapGrid: [number, number] = [50, 50];
    const fitViewOptions = { padding: 0.1, minZoom: 0.5, maxZoom: 1 };

    return (
        <Box
            ref={reactFlowContainerRef}
            flex={1}
            position="relative"
            overflow="hidden"
            display="flex"
        >
            <MenuNodeModal
                usedNodes={nodes as any}
                isOpen={isMenuOpen}
                addNode={(nodeType: any) => handleAddChainNode(nodeType)}
                onClose={onMenuClose}
                onToggle={isMenuOpen ? onMenuClose : onMenuOpen}
            />

            <Box flex={1} position="relative">
                <ReactFlow
                    colorMode={colorMode === "dark" ? "dark" : "light"}
                    nodes={nodes as any}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={appNodeTypes}
                    edgeTypes={edgeTypes}
                    snapGrid={snapGrid}
                    fitViewOptions={fitViewOptions}
                    snapToGrid={true}
                    fitView
                    onDragOver={onDragOver as any}
                    onDrop={onDrop as any}
                    onConnect={onConnect}
                >
                    <MiniMap
                        position="bottom-left"
                        nodeBorderRadius={12}
                        nodeStrokeWidth={6}
                        nodeColor={(node) => {
                            if ((node.data as any)?.isPlaceholder)
                                return "transparent";
                            switch ((node.data as any)?.type) {
                                case TaskType.QUERY:
                                    return "#34D3A9";
                                case TaskType.RESPONSE:
                                    return "#34D3A9";
                                case TaskType.MODEL:
                                    return "#8b5cf6";
                                case TaskType.INSTRUCTION:
                                    return "#34D3A9";
                                default:
                                    return "#34D3A9";
                            }
                        }}
                        nodeStrokeColor={(node) => {
                            if ((node.data as any)?.isPlaceholder)
                                return "transparent";
                            return (node.data as any)?.type === TaskType.MODEL
                                ? "#8b5cf6"
                                : "#34D3A9";
                        }}
                        maskColor={
                            colorMode === "dark"
                                ? "rgba(74, 74, 75, 0)"
                                : "rgba(240, 253, 250, 0)"
                        }
                        style={{
                            background:
                                colorMode === "dark"
                                    ? "rgba(74, 74, 75, 0)"
                                    : "#f0fdf450",
                            border: `1px solid ${colorMode === "dark" ? "#353535" : "#34D3A9"}`,
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                        }}
                    />
                    <Background variant={BackgroundVariant.Dots} gap={16} />
                    <CustomControls />
                </ReactFlow>
            </Box>

            <NodeModal
                task={task as any}
                nodeData={nodeData}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                selectedNodeId={selectedNodeId}
                onSettingSelect={handleSettingSelect}
            />
        </Box>
    );
};

const WorkflowWorkspace = () => {
    return (
        <VStack
            w="100%"
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
        >
            <VStack>
                <WorkspaceHeader
                    title="Workflow"
                    description="Manage your rag workflow. Customize it to add new features to your assistant."
                />
            </VStack>

            <ReactFlowProvider>
                <WorkflowCanvas />
            </ReactFlowProvider>
        </VStack>
    );
};

export default WorkflowWorkspace;
