import { useState, useCallback } from "react";
import { useColorMode, VStack, Box, useDisclosure, useToken, Center, Text } from "@chakra-ui/react";
import { ReactFlow, Background, BackgroundVariant, ReactFlowProvider } from "@xyflow/react";
import {
    useNodeSelection,
    useWorkflowCanvas,
    DatasetCatalogProvider,
    sanitizeWorkflowEdges,
    type AppNode,
    type WorkflowDefinition,
} from "@genrag/workflow";
import type { Edge } from "@xyflow/react";
import { NodeModal } from "pages/Agents/Workflow/NodeModal";
import MenuNodeModal from "pages/Agents/Workflow/MenuNodeModal";
import CustomControls from "pages/Agents/Workflow/CustomControls";
import { applyAlphaToColor } from "components/ui/workflow-preview/WorkflowPreview";
import { GenragLoader } from "components/ui/GenragLoader";
import { useParams } from "react-router-dom";
import { useGetActiveWorkflowQuery } from "services/workflow/workflow";
import { useGetModelsGenerationQuery } from "services/models/models";
import { useAgentDatasetCatalog } from "hooks/dataset/useAgentDatasetCatalog";
import useThemedToast from "hooks/useThemedToast";
import { useUnsavedChangesBlocker } from "hooks/useUnsavedChangesBlocker";
import { useSaveWorkflow } from "hooks/workflow/useSaveWorkflow";
import { WorkflowMiniMap } from "pages/Agents/Workflow/WorkflowMiniMap";

interface WorkflowInnerProps {
    initialNodes?: AppNode[];
    initialEdges?: Edge[];
    workflowExists: boolean;
    workspaceId: string;
    agentId: string;
}

const SNAP_GRID: [number, number] = [50, 50];
const FIT_VIEW_OPTIONS = { padding: 0.1, minZoom: 0.5, maxZoom: 1 };

const WorkflowInner = ({ initialNodes, initialEdges, workflowExists, workspaceId, agentId }: WorkflowInnerProps) => {
    const { colorMode } = useColorMode();
    const toast = useThemedToast();

    useGetModelsGenerationQuery();

    const [isDirty, setIsDirty] = useState(false);
    const markDirty = useCallback(() => setIsDirty(true), []);

    const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure({ defaultIsOpen: false });

    const { selectedNodeId, task, nodeData, isModalOpen, handleNodeClick, handleModalClose } = useNodeSelection();

    const {
        nodes,
        edges,
        canvasNodes,
        canvasEdges,
        nodeTypes,
        edgeTypes,
        onNodesChange,
        onEdgesChange,
        onDragOver,
        handleSettingSelect,
        handleAddSettingNode,
        handleRemoveSettingNode,
        handleAddChainNode,
    } = useWorkflowCanvas({
        onNodeClick: handleNodeClick,
        onEdgeClick: isMenuOpen ? onMenuClose : onMenuOpen,
        onInstructionSave: () => {
            markDirty();
            toast({
                title: "Instruction modifiée",
                status: "success",
                duration: 2000,
            });
        },
        onMutation: markDirty,
        initialNodes,
        initialEdges,
    });

    const { save, isSaving } = useSaveWorkflow({
        workspaceId,
        agentId,
        workflowExists,
        onSaved: () => setIsDirty(false),
    });

    const withDirty =
        <A extends unknown[]>(fn: (...args: A) => void) =>
        (...args: A) => {
            fn(...args);
            markDirty();
        };

    useUnsavedChangesBlocker(isDirty);

    const [gridLineLight, gridLineDark] = useToken("colors", ["grey.200", "grey.800"]);
    const lineColor = applyAlphaToColor(colorMode === "dark" ? gridLineDark : gridLineLight, 0.8);

    return (
        <Box flex={1} position="relative" overflow="hidden" display="flex">
            <MenuNodeModal
                usedNodes={nodes}
                isOpen={isMenuOpen}
                addNode={withDirty(handleAddChainNode)}
                onClose={onMenuClose}
                onToggle={isMenuOpen ? onMenuClose : onMenuOpen}
            />

            <Box flex={1} position="relative">
                <ReactFlow
                    colorMode="light"
                    nodes={canvasNodes}
                    edges={canvasEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    snapGrid={SNAP_GRID}
                    fitViewOptions={FIT_VIEW_OPTIONS}
                    fitView
                    onDragOver={onDragOver}
                    // Backspace would delete the selected edge or node and cut the pipeline; removals go through buttons.
                    deleteKeyCode={null}
                >
                    <WorkflowMiniMap isDark={colorMode === "dark"} />
                    <Background variant={BackgroundVariant.Lines} color={lineColor} gap={36} />
                    <CustomControls
                        onMenuToggle={isMenuOpen ? onMenuClose : onMenuOpen}
                        onSave={() => save(nodes, edges)}
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
                onSettingSelect={withDirty(handleSettingSelect)}
                onAddSettingNode={withDirty(handleAddSettingNode)}
                onRemoveSettingNode={withDirty(handleRemoveSettingNode)}
                workspaceId={workspaceId}
                agentId={agentId}
            />
        </Box>
    );
};

const WorkflowWorkspace = () => {
    const { workspaceId, agentId } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    const {
        data: workflow,
        isLoading,
        isError,
        error,
    } = useGetActiveWorkflowQuery({ workspaceId: workspaceId!, agentId: agentId! }, { skip: !workspaceId || !agentId });
    const is404 = typeof error === "object" && error !== null && "status" in error && error.status === 404;

    // DATASET nodes show the name of their dataset; one missing from the agent is displayed as an error.
    const datasetCatalog = useAgentDatasetCatalog(workspaceId!, agentId!);

    // Legacy workflows may have a `definition` that doesn't (yet) match the current WorkflowDefinition shape.
    const canvas = workflow?.definition as Partial<WorkflowDefinition> | undefined;
    const { nodes: initialNodes, edges: initialEdges } =
        canvas?.nodes && canvas?.edges
            ? sanitizeWorkflowEdges(canvas.nodes, canvas.edges)
            : { nodes: canvas?.nodes, edges: canvas?.edges };

    return (
        <VStack w="100%" h="100%" align="stretch" spacing={0} overflow="hidden">
            {isLoading ? (
                <Center flex={1}>
                    <GenragLoader size={64} />
                </Center>
            ) : isError && !is404 ? (
                <Center flex={1}>
                    <Text color="textError">Impossible de charger le workflow de cet agent. Réessayez plus tard.</Text>
                </Center>
            ) : (
                <ReactFlowProvider>
                    <DatasetCatalogProvider value={datasetCatalog}>
                        <WorkflowInner
                            initialNodes={initialNodes}
                            initialEdges={initialEdges}
                            workflowExists={!!workflow}
                            workspaceId={workspaceId!}
                            agentId={agentId!}
                        />
                    </DatasetCatalogProvider>
                </ReactFlowProvider>
            )}
        </VStack>
    );
};

export default WorkflowWorkspace;
