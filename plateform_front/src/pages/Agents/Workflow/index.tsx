import { useRef, useState, useEffect, useCallback } from "react";
import { useColorMode, VStack, Box, useDisclosure, useToken, Spinner, Center } from "@chakra-ui/react";
import { useBlocker } from "react-router-dom";
import { ReactFlow, Background, BackgroundVariant, MiniMap, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import {
    useNodeSelection,
    useWorkflowCanvas,
    sanitizeWorkflowEdges,
    serializeWorkflow,
    getTaskDef,
    TaskType,
    type AppNode,
    type AppNodeData,
    type WorkflowDefinition,
} from "@genrag/workflow";
import type { Edge } from "@xyflow/react";
import { NodeModal } from "pages/Agents/Workflow/NodeModal";
import MenuNodeModal from "pages/Agents/Workflow/MenuNodeModal";
import CustomControls from "pages/Agents/Workflow/CustomControls";
import { applyAlphaToColor } from "components/ui/workflow-preview/WorkflowPreview";
import { useParams } from "react-router-dom";
import {
    useGetActiveWorkflowQuery,
    useUpdateWorkflowMutation,
    useCreateWorkflowMutation,
} from "services/workflow/workflow";
import { useGetModelsGenerationQuery } from "services/models/models";
import useThemedToast from "hooks/useThemedToast";

interface WorkflowInnerProps {
    initialNodes?: AppNode[];
    initialEdges?: Edge[];
    workflowExists: boolean;
    workspaceId: string;
    agentId: string;
}

const WorkflowInner = ({ initialNodes, initialEdges, workflowExists, workspaceId, agentId }: WorkflowInnerProps) => {
    const { colorMode } = useColorMode();
    const reactFlowContainerRef = useRef<HTMLDivElement>(null);
    const toast = useThemedToast();

    useGetModelsGenerationQuery();

    const [isDirty, setIsDirty] = useState(false);
    const markDirty = useCallback(() => setIsDirty(true), []);

    const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure({ defaultIsOpen: false });

    const { selectedNodeId, task, nodeData, isModalOpen, handleNodeClick, handleModalClose } = useNodeSelection();

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
        onNodeClick: handleNodeClick,
        onEdgeClick: isMenuOpen ? onMenuClose : onMenuOpen,
        onInstructionSave: () => {
            markDirty();
            toast({ title: "Instruction modifiée", status: "success", duration: 2000 });
        },
        onMutation: markDirty,
        initialNodes,
        initialEdges,
    });

    const { updateNodeData } = useReactFlow();
    const [updateWorkflow, { isLoading: isUpdating }] = useUpdateWorkflowMutation();
    const [createWorkflow, { isLoading: isCreating }] = useCreateWorkflowMutation();
    const isSaving = isUpdating || isCreating;

    const handleSave = async () => {
        const incompleteNodes = nodes.filter((n) => n.data.isPlaceholder);
        if (incompleteNodes.length > 0) {
            const names = incompleteNodes.map((n) => {
                const parent = nodes.find((p) => p.id === n.data.parentNodeId);
                const parentLabel = parent ? (getTaskDef(parent.data.type)?.label ?? parent.data.type) : null;
                const settingLabel =
                    n.data.settingLabel ?? (n.data.type === TaskType.MODEL ? "Modèle IA" : "Instructions");
                return parentLabel ? `${parentLabel} - ${settingLabel}` : settingLabel;
            });
            incompleteNodes.forEach((n) => updateNodeData(n.id, { isHighlighted: true }));
            setTimeout(() => {
                incompleteNodes.forEach((n) => updateNodeData(n.id, { isHighlighted: false }));
            }, 2000);

            toast({
                title: "Configuration incomplète",
                description: (
                    <div>
                        {names.map((name, i) => (
                            <div key={i}>{name}</div>
                        ))}
                    </div>
                ),
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const definition: WorkflowDefinition = serializeWorkflow(nodes, edges);
        const params = { workspaceId, agentId, definition };

        try {
            if (workflowExists) {
                await updateWorkflow(params).unwrap();
            } else {
                await createWorkflow(params).unwrap();
            }
            setIsDirty(false);
            toast({
                title: "Workflow enregistré",
                description: "Votre workflow d'execution a été enregistré avec succès.",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch {
            toast({
                title: "Erreur lors de l'enregistrement",
                description: "Une erreur est survenue lors de l'enregistrement de votre workflow.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // handleSettingSelect (model selection) triggers setNodes internally → mark dirty at call site
    const handleSettingSelectWithDirty = useCallback(
        (nodeId: string, item: string) => {
            handleSettingSelect(nodeId, item);
            markDirty();
        },
        [handleSettingSelect, markDirty],
    );

    // handleAddChainNode triggers setNodes internally → mark dirty at call site
    const handleAddChainNodeWithDirty = useCallback(
        (nodeType: Parameters<typeof handleAddChainNode>[0]) => {
            handleAddChainNode(nodeType);
            markDirty();
        },
        [handleAddChainNode, markDirty],
    );

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname,
    );
    const blockerRef = useRef(blocker);
    blockerRef.current = blocker;

    useEffect(() => {
        if (blocker.state !== "blocked") return;
        if (toast.isActive("workflow-unsaved")) return;
        toast({
            id: "workflow-unsaved",
            title: "Modifications non enregistrées",
            status: "warning",
            description: "Vous avez des modifications non enregistrées. Quitter la page ?",
            actionLabel: "Quitter sans enregistrer",
            onAction: () => {
                toast.close("workflow-unsaved");
                blockerRef.current.proceed?.();
            },
            onCloseComplete: () => {
                if (blockerRef.current.state === "blocked") blockerRef.current.reset?.();
            },
        } as any);
    }, [blocker.state, toast]);

    const [gridLineLight, gridLineDark] = useToken("colors", ["grey.50", "grey.950"]);
    const lineColor = applyAlphaToColor(colorMode === "dark" ? gridLineDark : gridLineLight, 0.8);

    const snapGrid: [number, number] = [50, 50];
    const fitViewOptions = { padding: 0.1, minZoom: 0.5, maxZoom: 1 };

    return (
        <Box ref={reactFlowContainerRef} flex={1} position="relative" overflow="hidden" display="flex">
            <MenuNodeModal
                usedNodes={nodes}
                isOpen={isMenuOpen}
                addNode={handleAddChainNodeWithDirty}
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
                            if ((node.data as AppNodeData).isPlaceholder) return "transparent";
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
                            if ((node.data as AppNodeData).isPlaceholder) return "transparent";
                            return (node.data as AppNodeData).type === TaskType.MODEL ? "#8b5cf6" : "#34D3A9";
                        }}
                        maskColor={colorMode === "dark" ? "rgba(74, 74, 75, 0)" : "rgba(240, 253, 250, 0)"}
                        style={{
                            background: colorMode === "dark" ? "rgba(74, 74, 75, 0)" : "#f0fdf450",
                            border: `1px solid ${colorMode === "dark" ? "#353535" : "#34D3A9"}`,
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                        }}
                    />
                    <Background variant={BackgroundVariant.Lines} color={lineColor} gap={36} />
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
                onSettingSelect={handleSettingSelectWithDirty}
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
        <VStack w="100%" h="100vh" align="stretch" spacing={0} overflow="hidden">
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
