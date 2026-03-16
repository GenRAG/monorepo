import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react";
import {
    Background,
    BackgroundVariant,
    Edge,
    ReactFlow,
    ReactFlowProvider,
} from "@xyflow/react";
import { useMemo } from "react";

import * as WorkflowPackage from "@genrag/workflow";
import type { AppNode } from "@genrag/workflow";
import NodeComponent from "components/Molecules/Nodes/NodeComponent";

const { useFlowTypes, useWorkflowNodes } = WorkflowPackage as any;

type WorkflowNodesResult = {
    nodes: AppNode[];
    edges: Edge[];
};

type FlowTypesResult = {
    nodeTypes: any;
    edgeTypes: any;
};

interface WorkflowPreviewProps {
    height?: string | number | { base: string | number; lg: string | number };
    nodes?: AppNode[];
    edges?: Edge[];
    zoom?: number;
    padding?: number;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({
    height = "200px",
    zoom = 0.8,
    padding = 0.2,
    nodes: propNodes,
    edges: propEdges,
}: WorkflowPreviewProps) => {
    const { colorMode } = useColorMode();
    const borderColor = useColorModeValue("grey.200", "grey.700");

    return (
        <Box
            position="relative"
            h={height}
            w="100%"
            borderTopRadius="12px"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
        >
            <ReactFlowProvider>
                <WorkflowPreviewCanvas
                    colorMode={colorMode}
                    zoom={zoom}
                    padding={padding}
                    propNodes={propNodes}
                    propEdges={propEdges}
                />
            </ReactFlowProvider>
        </Box>
    );
};

const WorkflowPreviewCanvas = ({
    colorMode,
    zoom,
    padding,
    propNodes,
    propEdges,
}: {
    colorMode: string;
    zoom: number;
    padding: number;
    propNodes?: AppNode[];
    propEdges?: Edge[];
}) => {
    const { nodes: hookNodes, edges: hookEdges } = (
        useWorkflowNodes as (options?: boolean) => WorkflowNodesResult
    )(false);
    const nodes = propNodes ?? hookNodes;
    const edges = propEdges ?? hookEdges;

    const { edgeTypes, nodeTypes } = (
        useFlowTypes as (options?: { isVertical?: boolean }) => FlowTypesResult
    )({ isVertical: false });

    const appNodeTypes = useMemo(
        () => ({
            ...nodeTypes,
            GenNode: (props: any) => (
                <NodeComponent {...props} isVertical={false} />
            ),
        }),
        [nodeTypes],
    );

    return (
        <ReactFlow
            colorMode={colorMode === "dark" ? "dark" : "light"}
            nodes={nodes}
            edges={edges}
            nodeTypes={appNodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: padding, minZoom: zoom, maxZoom: 1 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
        >
            <Background variant={BackgroundVariant.Dots} gap={12} size={2} />
        </ReactFlow>
    );
};
