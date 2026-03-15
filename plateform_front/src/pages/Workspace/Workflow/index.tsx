import { useRef } from "react";
import "@xyflow/react/dist/style.css";
import { useColorMode, VStack, Box, useDisclosure } from "@chakra-ui/react";
import WorkspaceHeader from "components/Molecules/WorkspaceHeader";
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    MiniMap,
} from "@xyflow/react";
import { NodeModal } from "pages/Workspace/Workflow/NodeModal";
import MenuNodeModal from "pages/Workspace/Workflow/MenuNodeModal";
import { useWorkflowNodes } from "hooks/workflow/useWorkflowNodes";
import { useNodeSelection } from "hooks/workflow/useNodeSelection";
import { useFlowTypes } from "hooks/workflow/useFlowTypes";
import CustomControls from "pages/Workspace/Workflow/CustomControls";
import { TaskType } from "lib/type/task";

const WorkflowWorkspace = () => {
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
    } = useWorkflowNodes();

    const {
        selectedNodeId,
        task,
        nodeData,
        isModalOpen,
        handleNodeClick,
        handleModalClose,
    } = useNodeSelection();

    const { edgeTypes, nodeTypes } = useFlowTypes({
        isMenuOpen,
        onMenuOpen,
        onMenuClose,
        onNodeClick: handleNodeClick,
    });

    const snapGrid: [number, number] = [50, 50];
    const fitViewOptions = { padding: 0.1, minZoom: 0.5, maxZoom: 1 };

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

            <Box
                ref={reactFlowContainerRef}
                flex={1}
                position="relative"
                overflow="hidden"
                display="flex"
            >
                <MenuNodeModal
                    usedNodes={nodes}
                    isOpen={isMenuOpen}
                    addNode={handleAddChainNode}
                    onClose={onMenuClose}
                    onToggle={isMenuOpen ? onMenuClose : onMenuOpen}
                />

                <Box flex={1} position="relative">
                    <ReactFlow
                        colorMode={colorMode === "dark" ? "dark" : "light"}
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        snapGrid={snapGrid}
                        fitViewOptions={fitViewOptions}
                        snapToGrid={true}
                        fitView
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        onConnect={onConnect}
                    >
                        <MiniMap
                            position="bottom-left"
                            nodeBorderRadius={12}
                            nodeStrokeWidth={6}
                            nodeColor={(node) => {
                                if (node.data?.isPlaceholder)
                                    return "transparent";
                                switch (node.data?.type) {
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
                                if (node.data?.isPlaceholder)
                                    return "transparent";
                                return node.data?.type === TaskType.MODEL
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
                    task={task}
                    nodeData={nodeData}
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    selectedNodeId={selectedNodeId}
                    onSettingSelect={handleSettingSelect}
                />
            </Box>
        </VStack>
    );
};

export default WorkflowWorkspace;
