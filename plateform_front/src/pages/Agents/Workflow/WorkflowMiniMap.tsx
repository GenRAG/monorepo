import { MiniMap } from "@xyflow/react";
import { TaskType, type AppNode } from "@genrag/workflow";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

const SETTING_COLOR = "#8b5cf6";
const PRIMARY = currentDarkTheme.hex.primary;

const SETTING_TYPES: TaskType[] = [TaskType.INSTRUCTION, TaskType.MODEL, TaskType.DATASET];

const nodeColor = (node: AppNode) => {
    if (node.data.isPlaceholder) return "transparent";
    return SETTING_TYPES.includes(node.data.type) ? SETTING_COLOR : PRIMARY;
};

const nodeStrokeColor = (node: AppNode) => {
    if (node.data.isPlaceholder) return "transparent";
    return SETTING_TYPES.includes(node.data.type) ? SETTING_COLOR : PRIMARY;
};

export const WorkflowMiniMap = ({ isDark }: { isDark: boolean }) => (
    <MiniMap<AppNode>
        position="bottom-left"
        nodeBorderRadius={12}
        nodeStrokeWidth={6}
        nodeColor={nodeColor}
        nodeStrokeColor={nodeStrokeColor}
        maskColor={isDark ? "rgba(74, 74, 75, 0)" : "rgba(240, 253, 250, 0)"}
        style={{
            background: isDark ? "rgba(74, 74, 75, 0)" : "#f0fdf450",
            border: `1px solid ${isDark ? "#353535" : PRIMARY}`,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
    />
);
