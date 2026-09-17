import { useReactFlow } from "@xyflow/react";
import { getTaskDef, TaskType, type AppNode } from "@genrag/workflow";
import useThemedToast from "hooks/useThemedToast";

/** Highlights any placeholder (unconfigured) node and warns the user before a workflow save. */
export const useIncompleteNodesGuard = () => {
    const { updateNodeData } = useReactFlow();
    const toast = useThemedToast();

    const checkIncompleteNodes = (nodes: AppNode[]): boolean => {
        const incompleteNodes = nodes.filter((n) => n.data.isPlaceholder);
        if (incompleteNodes.length === 0) return true;

        const names = incompleteNodes.map((n) => {
            const parent = nodes.find((p) => p.id === n.data.parentNodeId);
            const parentLabel = parent ? (getTaskDef(parent.data.type)?.label ?? parent.data.type) : null;
            const settingLabel = n.data.settingLabel ?? (n.data.type === TaskType.MODEL ? "Modèle IA" : "Instructions");
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

        return false;
    };

    return { checkIncompleteNodes };
};
