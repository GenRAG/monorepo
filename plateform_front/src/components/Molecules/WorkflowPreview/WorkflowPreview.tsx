import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { Background, BackgroundVariant, Edge, ReactFlow } from "@xyflow/react";

import { useFlowTypes } from "hooks/workflow/useFlowTypes";
import { useWorkflowNodes } from "hooks/workflow/useWorkflowNodes";
import { AppNode } from "lib/type/app-node";

interface WorkflowPreviewProps {
    height?: string | number | { base: string | number; lg: string | number };
    nodes?: AppNode[];
    edges?: Edge[];
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({
    height = "200px",
}: WorkflowPreviewProps) => {
    const { colorMode } = useColorMode();
    const borderColor = useColorModeValue("grey.200", "grey.700");

    const { nodes, edges } = useWorkflowNodes(false);

    const { edgeTypes, nodeTypes } = useFlowTypes({ isVertical: false });

    return (
        <Box
            position="relative"
            h={height}
            w="100%"
            borderRadius="12px"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
        >
            <ReactFlow
                colorMode={colorMode === "dark" ? "dark" : "light"}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2, minZoom: 0.8, maxZoom: 1 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={12}
                    size={0.5}
                />
            </ReactFlow>
        </Box>
    );
};
