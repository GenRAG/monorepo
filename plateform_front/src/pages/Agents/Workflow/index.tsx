import { useRef } from "react";
import "@xyflow/react/dist/style.css";
import {
    useColorMode,
    VStack,
    Box,
    useDisclosure,
    useToken,
    Spinner,
    Center,
} from "@chakra-ui/react";
import WorkspaceHeader from "components/System/Molecules/WorkspaceHeader";
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    MiniMap,
    ReactFlowProvider,
} from "@xyflow/react";
import {
    useNodeSelection,
    useWorkflowCanvas,
    sanitizeWorkflowEdges,
    TaskType,
    type AppNode,
    type AppNodeData,
} from "@genrag/workflow";
import type { Edge } from "@xyflow/react";
import { NodeModal } from "pages/Agents/Workflow/NodeModal";
import MenuNodeModal from "pages/Agents/Workflow/MenuNodeModal";
import CustomControls from "pages/Agents/Workflow/CustomControls";
import { NodeComponent } from "@genrag/workflow";
import { applyAlphaToColor } from "components/System/Molecules/WorkflowPreview/WorkflowPreview";
import { useParams } from "react-router-dom";
import {
    useGetActiveWorkflowQuery,
    useUpdateWorkflowMutation,
    useCreateWorkflowMutation,
} from "services/workflow/workflow";
import { serializeWorkflow } from "utils/workflowSerializer";
import type { WorkflowDefinition } from "utils/workflowSerializer";
import useThemedToast from "hooks/useThemedToast";

interface WorkflowInnerProps {
    initialNodes?: AppNode[];
    initialEdges?: Edge[];
    workflowExists: boolean;
    workspaceId: string;
    agentId: string;
}

const WorkflowInner = ({
    initialNodes,
    initialEdges,
    workflowExists,
    workspaceId,
    agentId,
}: WorkflowInnerProps) => {
    const { colorMode } = useColorMode();
    const reactFlowContainerRef = useRef<HTMLDivElement>(null);
    const toast = useThemedToast();

    const {
        isOpen: isMenuOpen,
        onOpen: onMenuOpen,
        onClose: onMenuClose,
    } = useDisclosure({ defaultIsOpen: false });

    const {
        selectedNodeId,
        task,
        nodeData,
        isModalOpen,
        handleNodeClick,
        handleModalClose,
    } = useNodeSelection();

    const {
        nodes,
        edges,
        nodeTypes,
        edgeTypes,
        onNodesChange,
        onEdgesChange,
        onDragOver,
        handleSettingSelect,
        handleAddChainNode,
    } = useWorkflowCanvas({
        nodeComponent: NodeComponent,
        onNodeClick: handleNodeClick,
        onEdgeClick: isMenuOpen ? onMenuClose : onMenuOpen,
        initialNodes,
        initialEdges,
    });

    const [updateWorkflow, { isLoading: isUpdating }] =
        useUpdateWorkflowMutation();
    const [createWorkflow, { isLoading: isCreating }] =
        useCreateWorkflowMutation();
    const isSaving = isUpdating || isCreating;

    const handleSave = async () => {
        const definition: WorkflowDefinition = serializeWorkflow(nodes, edges);
        const params = { workspaceId, agentId, definition };

        try {
            if (workflowExists) {
                await updateWorkflow(params).unwrap();
            } else {
                await createWorkflow(params).unwrap();
            }
            toast({
                title: "Workflow enregistré",
                description:
                    "Votre workflow d'execution a été enregistré avec succès.",
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "bottom-right",
            });
        } catch {
            toast({
                title: "Erreur lors de l'enregistrement",
                description:
                    "Une erreur est survenue lors de l'enregistrement de votre workflow.",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom-right",
            });
        }
    };

    const [gridLineLight, gridLineDark] = useToken("colors", [
        "grey.50",
        "grey.950",
    ]);
    const lineColor = applyAlphaToColor(
        colorMode === "dark" ? gridLineDark : gridLineLight,
        0.8,
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
                    fitView
                    onDragOver={onDragOver}
                >
                    <MiniMap
                        position="bottom-left"
                        nodeBorderRadius={12}
                        nodeStrokeWidth={6}
                        nodeColor={(node) => {
                            if ((node.data as AppNodeData).isPlaceholder)
                                return "transparent";
                            switch ((node.data as AppNodeData).type) {
                                case TaskType.QUERY:
                                case TaskType.RESPONSE:
                                case TaskType.INSTRUCTION:
                                    return "#34D3A9";
                                case TaskType.MODEL:
                                    return "#8b5cf6";
                                default:
                                    return "#34D3A9";
                            }
                        }}
                        nodeStrokeColor={(node) => {
                            if ((node.data as AppNodeData).isPlaceholder)
                                return "transparent";
                            return (node.data as AppNodeData).type ===
                                TaskType.MODEL
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
                    <Background
                        variant={BackgroundVariant.Lines}
                        color={lineColor}
                        gap={36}
                    />
                    <CustomControls
                        onMenuToggle={isMenuOpen ? onMenuClose : onMenuOpen}
                        onSave={handleSave}
                        isSaving={isSaving}
                    />
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
    );
};

const WorkflowWorkspace = () => {
    const { workspaceId, agentId } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    const { data: workflow, isLoading } = useGetActiveWorkflowQuery(
        { workspaceId: workspaceId!, agentId: agentId! },
        { skip: !workspaceId || !agentId },
    );

    const canvas = workflow?.definition as WorkflowDefinition | undefined;
    const { nodes: initialNodes, edges: initialEdges } =
        canvas?.nodes && canvas?.edges
            ? sanitizeWorkflowEdges(canvas.nodes, canvas.edges)
            : { nodes: canvas?.nodes, edges: canvas?.edges };

    return (
        <VStack
            w="100%"
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
        >
            <WorkspaceHeader
                title="Workflow"
                description="Manage your rag workflow. Customize it to add new features to your assistant."
            />

            {isLoading ? (
                <Center flex={1}>
                    <Spinner size="lg" color="green.500" />
                </Center>
            ) : (
                <ReactFlowProvider>
                    <WorkflowInner
                        initialNodes={initialNodes}
                        initialEdges={initialEdges}
                        workflowExists={!!workflow}
                        workspaceId={workspaceId!}
                        agentId={agentId!}
                    />
                </ReactFlowProvider>
            )}
        </VStack>
    );
};

export default WorkflowWorkspace;
