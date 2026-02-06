import { HStack, Button, useColorMode, VStack, useColorModeValue, Box, useDisclosure } from "@chakra-ui/react"
import WorkspaceHeader from "components/Molecules/WorkspaceHeader"
import { ReactFlow, Background, BackgroundVariant, Controls, useReactFlow, Edge, useNodesState, useEdgesState, Connection, addEdge } from "@xyflow/react"
import '@xyflow/react/dist/style.css';
import { Expand, Minus, Plus, ZoomIn, ZoomOut } from "lucide-react";
import { CreateFlowNode, linkNodes } from "lib/workflow/create-flow-node";
import { TaskType } from "lib/type/task";
import { AppNode } from "lib/type/app-node";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import GenEdge from "components/Molecules/Edges/eges";
import NodeComponent from "components/Molecules/Nodes/NodeComponent";
import { NodeModal } from "pages/Workspace/Workflow/NodeModal";
import useNodeInformation from "hooks/useNodeInformation";
import MenuNodeModal from "pages/Workspace/Workflow/MenuNodeModal";

const CustomControls = () => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const bgColor = useColorModeValue('white', 'grey.800');
    const hoverBg = useColorModeValue('grey.100', 'grey.700');
    const iconColor = useColorModeValue('black', 'white');

    return (
        <HStack
            position="absolute"
            bottom="20px"
            right="50%"
            transform="translateX(50%)"
            boxShadow="lg"
            spacing="0"
            zIndex={5}
            bg={bgColor}
            borderRadius="50px"
            border="1px solid"
            borderColor={useColorModeValue('grey.200', 'green.600')}
            overflow="hidden"
        >
            <Button
                aria-label="Zoom in"
                onClick={() => zoomIn()}
                borderRadius="0"
                borderRight="1px solid"
                borderColor={useColorModeValue('white', 'green.700')}
                bg="transparent"
                _hover={{
                    bg: hoverBg
                }}
                _active={{
                    bg: hoverBg
                }}
                _focus={{
                    bg: hoverBg
                }}
            >
                <Plus color={iconColor} size={20} />
            </Button>
            <Button
                aria-label="Zoom out"
                onClick={() => zoomOut()}
                borderRadius="0"
                borderRight="1px solid"
                borderColor={useColorModeValue('white', 'green.700')}
                bg="transparent"
                _hover={{
                    bg: hoverBg
                }}
                _active={{
                    bg: hoverBg
                }}
                _focus={{
                    bg: hoverBg
                }}
            >
                <Minus color={iconColor} size={20} />
            </Button>
            <Button
                aria-label="Zoom in"
                onClick={() => fitView({ duration: 500 })}
                borderRadius="0"
                borderRight="1px solid"
                borderColor={useColorModeValue('white', 'green.700')}
                bg="transparent"
                _hover={{
                    bg: hoverBg
                }}
                _active={{
                    bg: hoverBg
                }}
                _focus={{
                    bg: hoverBg
                }}
            >
                <Expand color={iconColor} size={20} />
            </Button>
        </HStack>
    )
}

const WorkflowWorkspace = () => {

    const { colorMode } = useColorMode();
    const reactFlowContainerRef = useRef<HTMLDivElement>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure({ defaultIsOpen: true });
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const { task } = useNodeInformation(selectedNodeId);

    /*const node1 = CreateFlowNode(
        TaskType.QUERY,
        { x: -400, y: 0 },
        undefined,
        false
    );
    const node2 = CreateFlowNode(
        TaskType.RETRIEVER,
        { x: 0, y: 0 },
        undefined,
        false
    );
    const node3 = CreateFlowNode(
        TaskType.RESPONSE,
        { x: 400, y: 0 },
        undefined,
        false
    );*/

    const node1 = CreateFlowNode(
        TaskType.QUERY,
        { x: 0, y: -200 },
        undefined,
        false
    );
    const node2 = CreateFlowNode(
        TaskType.RETRIEVER,
        { x: 0, y: 0 },
        undefined,
        false
    );
    const node3 = CreateFlowNode(
        TaskType.RESPONSE,
        { x: 0, y: 200 },
        undefined,
        false
    );

    const { fitView, screenToFlowPosition, updateNodeData, getNode } = useReactFlow();

    const initialEdges: Edge[] = [
        linkNodes(node1.node.id, node2.node.id),
        linkNodes(node2.node.id, node3.node.id),
    ];

    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([
        node1.node,
        node2.node,
        node3.node,
    ]);

    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

    const workspaceId = useMemo(() => {
        if (typeof window !== "undefined") {
            return window.location.pathname.split("/").pop();
        }
        return null;
    }, []);

    /*async function fetchWorkflowData(): Promise<void> {
      try {
        const response = await fetch(`http://localhost:8080/workflow/get/${workspaceId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Error fetching workflow data: ${response.statusText}`);
        }
        const json = await response.json();
        if (json.definition != "TODO") {
          const flow = JSON.parse(json.definition);
          setNodes(flow.nodes || []);
          setEdges(flow.edges || []);
        }
        console.log(json);
      } catch (error) {
        console.error("Failed to fetch workflow data:", error);
      }
    }*/

    /*useEffect(() => {
      fetchWorkflowData();
    }, [setNodes, setEdges]);*/

    const handleNodeClick = useCallback((nodeId: string) => {
        setSelectedNodeId(nodeId);
        onOpen();
    }, [onOpen]);

    const edgeTypes = useMemo(
        () => ({
            default: (props: any) => <GenEdge {...props} onToggle={isMenuOpen ? onMenuClose : onMenuOpen} />,
        }),
        []
    );

    const nodeTypes = useMemo(
        () => ({
            GenNode: (props: any) => <NodeComponent {...props} onNodeClick={handleNodeClick} />,
        }),
        [handleNodeClick]
    );

    console.log(nodes);

    const snapGrid: [number, number] = [50, 50];
    const fitViewOptions = { padding: 0.1 };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const taskType = event.dataTransfer.getData("application/reactflow");
        if (typeof taskType === undefined || !taskType) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        const newNode = CreateFlowNode(taskType as TaskType, position).node;
        setNodes((prevNodes) => {
            const updatedNodes = [...prevNodes, newNode];
            return updatedNodes;
        });
    }, []);

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((edges) => addEdge({ ...connection, animated: true }, edges));
            if (!connection.targetHandle) return;

            const node = nodes.find((node) => node.id === connection.target);
            if (!node) return;
            const nodeInputs = node.data.inputs;
            updateNodeData(node.id, {
                inputs: {
                    ...nodeInputs,
                    [connection.targetHandle]: "",
                },
            });
        },
        [setEdges, updateNodeData, nodes]
    );


    return (
        <VStack w="100%" h="100vh" align="stretch" spacing={0} overflow="hidden">
            <VStack>
                <WorkspaceHeader title="Workflow" description="Manage your rag workflow. Customize it to add new features to your assistant." />
            </VStack>
            <Box ref={reactFlowContainerRef} flex={1} position="relative" overflow="hidden" display="flex">
                <MenuNodeModal usedNodes={nodes} isOpen={isMenuOpen} onClose={onMenuClose} onToggle={isMenuOpen ? onMenuClose : onMenuOpen} />
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
                        <Background variant={BackgroundVariant.Dots} gap={16} />
                        <CustomControls />
                    </ReactFlow>
                </Box>
                <NodeModal task={task} isOpen={isOpen} onClose={onClose} />
            </Box>
        </VStack>
    )
}

export default WorkflowWorkspace;