import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react";
import {
    Background,
    BackgroundVariant,
    Edge,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from "@xyflow/react";
import GenEdge from "components/Molecules/Edges/eges";
import SettingsEdge from "components/Molecules/Edges/settings-edge";
import NodeComponent from "components/Molecules/Nodes/NodeComponent";
import { useAppResponsive } from "hooks/useAppResponsive";
import { AppNode } from "lib/type/app-node";
import { TaskType } from "lib/type/task";
import {
    CreateFlowNode,
    createSettingPlaceholders,
    linkNodes,
} from "lib/workflow/create-flow-node";
import { getConfigInputs } from "hooks/workflow/useWorkflowNodes";
import { useMemo } from "react";

export const WorkflowDashboard = () => {
    const { colorMode } = useColorMode();
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const isMobile = useAppResponsive({ base: true, lg: false });

    const initialState = useMemo(() => {
        const n1 = CreateFlowNode(
            TaskType.QUERY,
            { x: isMobile ? 0 : -200, y: isMobile ? -200 : 0 },
            undefined,
            false,
        );
        const n2 = CreateFlowNode(
            TaskType.RETRIEVER,
            { x: isMobile ? 0 : 0, y: isMobile ? 0 : 0 },
            undefined,
            false,
        );
        const n3 = CreateFlowNode(
            TaskType.RESPONSE,
            { x: isMobile ? 0 : 200, y: isMobile ? 200 : 0 },
            undefined,
            false,
        );

        const mainNodes = [n1.node, n2.node, n3.node];
        const mainEdges: Edge[] = [
            linkNodes(n1.node.id, n2.node.id),
            linkNodes(n2.node.id, n3.node.id),
        ];

        const extraNodes: AppNode[] = [];
        const extraEdges: Edge[] = [];

        /*mainNodes.forEach((node) => {
            const cfgInputs = getConfigInputs(node.data.type);
            if (cfgInputs.length > 0) {
                const { nodes: pn, edges: pe } = createSettingPlaceholders(
                    node,
                    cfgInputs,
                );
                extraNodes.push(...pn);
                extraEdges.push(...pe);
            }
        });*/

        return {
            nodes: [...mainNodes, ...extraNodes],
            edges: [...mainEdges, ...extraEdges],
        };
    }, [isMobile]);

    const [nodes, , onNodesChange] = useNodesState<AppNode>(initialState.nodes);
    const [edges, , onEdgesChange] = useEdgesState<Edge>(initialState.edges);

    const snapGrid: [number, number] = [50, 50];
    const fitViewOptions = { padding: 0.1, minZoom: 0.5, maxZoom: 1 };

    const edgeTypes = useMemo(
        () => ({
            default: (props: any) => (
                <GenEdge
                    {...props}
                    //onToggle={isMenuOpen ? onMenuClose : onMenuOpen}
                />
            ),
            settings: (props: any) => <SettingsEdge {...props} />,
        }),
        [],
    );

    const nodeTypes = useMemo(
        () => ({
            GenNode: (props: any) => (
                <NodeComponent
                    {...props}
                    isVertical={isMobile} /*onNodeClick={handleNodeClick}*/
                />
            ),
        }),
        [],
    );

    return (
        <Box
            flex={1}
            position="relative"
            minH={isMobile ? "400px" : 0}
            w="100%"
        >
            <Box
                position="absolute"
                inset={0}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="16px"
                overflow="hidden"
            >
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
                >
                    <Background variant={BackgroundVariant.Dots} gap={16} />
                </ReactFlow>
            </Box>
        </Box>
    );
};
