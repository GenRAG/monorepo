import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { Background, BackgroundVariant } from "@xyflow/react";
import {
    WorkflowCanvas,
    NodeComponent,
    makeFlowNode,
    linkNodes,
    withAutoSettings,
    TaskType,
} from "@genrag/workflow";
import { useAppResponsive } from "hooks/useAppResponsive";

const { nodes: DEFAULT_NODES, edges: DEFAULT_EDGES } = withAutoSettings(
    [
        makeFlowNode("__q", TaskType.QUERY, 0, 0),
        makeFlowNode("__r", TaskType.RETRIEVER, 0, 200),
        makeFlowNode("__s", TaskType.RESPONSE, 0, 400),
    ],
    [linkNodes("__q", "__r"), linkNodes("__r", "__s")],
);

export const WorkflowDashboard = () => {
    const { colorMode } = useColorMode();
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const isMobile = useAppResponsive({ base: true, lg: false });

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
                <WorkflowCanvas
                    nodeComponent={NodeComponent as any}
                    initialVertical={isMobile}
                    readonly
                    initialNodes={DEFAULT_NODES}
                    initialEdges={DEFAULT_EDGES}
                    fitViewOptions={{ padding: 0.1, minZoom: 0.5, maxZoom: 1 }}
                    colorMode={colorMode === "dark" ? "dark" : "light"}
                >
                    <Background variant={BackgroundVariant.Dots} gap={16} />
                </WorkflowCanvas>
            </Box>
        </Box>
    );
};
