import {
    Box,
    useColorMode,
    useColorModeValue,
    useToken,
} from "@chakra-ui/react";
import { Background, BackgroundVariant, Edge } from "@xyflow/react";
import { HorizontalLayoutStrategy, WorkflowCanvas } from "@genrag/workflow";
import type { AppNode } from "@genrag/workflow";
import { NodeComponent } from "@genrag/workflow";

export const applyAlphaToColor = (color: string, alpha: number): string => {
    if (color.startsWith("#")) {
        const hex = color.slice(1);
        const normalizedHex =
            hex.length === 3
                ? hex
                      .split("")
                      .map((part) => `${part}${part}`)
                      .join("")
                : hex;

        if (normalizedHex.length === 6) {
            const red = parseInt(normalizedHex.slice(0, 2), 16);
            const green = parseInt(normalizedHex.slice(2, 4), 16);
            const blue = parseInt(normalizedHex.slice(4, 6), 16);
            return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        }
    }

    if (color.startsWith("rgba(")) {
        return color.replace(/rgba\(([^)]+),\s*[^,]+\)$/, `rgba($1, ${alpha})`);
    }

    if (color.startsWith("rgb(")) {
        return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
    }

    return color;
};

interface WorkflowPreviewProps {
    height?: string | number | { base: string | number; lg: string | number };
    nodes?: AppNode[];
    edges?: Edge[];
    zoom?: number;
    padding?: number;
    border?: boolean;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({
    height = "200px",
    zoom = 0.8,
    padding = 0.2,
    nodes: propNodes,
    edges: propEdges,
    border: _border = true,
}: WorkflowPreviewProps) => {
    const { colorMode } = useColorMode();
    const borderColor = useColorModeValue("grey.100", "grey.700");

    const [gridLineLight, gridLineDark] = useToken("colors", [
        "grey.50",
        "grey.950",
    ]);
    const lineColor = applyAlphaToColor(
        colorMode === "dark" ? gridLineDark : gridLineLight,
        colorMode === "dark" ? 0.6 : 1,
    );

    return (
        <Box
            position="relative"
            h={height}
            w="100%"
            borderRadius="4px"
            border={_border ? "1px solid" : undefined}
            borderColor={borderColor}
            overflow="hidden"
        >
            <WorkflowCanvas
                nodeComponent={NodeComponent as any}
                readonly
                layout={new HorizontalLayoutStrategy()}
                initialNodes={propNodes}
                initialEdges={propEdges}
                fitViewOptions={{ padding, minZoom: zoom, maxZoom: 1 }}
                colorMode={colorMode === "dark" ? "dark" : "light"}
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={50}
                    size={1}
                    color={lineColor}
                />
            </WorkflowCanvas>
        </Box>
    );
};
