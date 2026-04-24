import { useMemo } from "react";
import GenEdge from "../components/edges/GenEdge";
import SettingsEdge from "../components/edges/SettingsEdge";
import NodeComponent from "../components/nodes/NodeComponent";
import { type WorkflowRegistry, DEFAULT_TASK_REGISTRY } from "../graph/registry";

interface UseFlowTypesParams {
    registry?: WorkflowRegistry;
    isMenuOpen?: boolean;
    onMenuOpen?: () => void;
    onMenuClose?: () => void;
    onNodeClick?: (nodeId: string) => void;
    isVertical?: boolean;
}

export const useFlowTypes = ({
    registry = DEFAULT_TASK_REGISTRY as WorkflowRegistry,
    isMenuOpen,
    onMenuOpen,
    onMenuClose,
    onNodeClick,
    isVertical = true,
}: UseFlowTypesParams = {}) => {
    const edgeTypes = useMemo(
        () => ({
            default: (props: any) => (
                <GenEdge
                    {...props}
                    onToggle={isMenuOpen ? onMenuClose : onMenuOpen}
                />
            ),
            settings: (props: any) => <SettingsEdge {...props} />,
        }),
        [isMenuOpen, onMenuClose, onMenuOpen],
    );

    const nodeTypes = useMemo(() => {
        const types: Record<string, React.ComponentType<any>> = {}
        registry.forEach((definition, type) => {
            types[type] = definition.component ?? ((props: any) => (
                <NodeComponent {...props} isVertical={isVertical} onNodeClick={onNodeClick} />
            ))
        })
        types.GenNode = (props: any) => (
            <NodeComponent {...props} isVertical={isVertical} onNodeClick={onNodeClick} />
        )
        return types
    }, [registry, isVertical, onNodeClick])

    return { edgeTypes, nodeTypes };
};
