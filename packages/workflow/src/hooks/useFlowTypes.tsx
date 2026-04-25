import { useMemo } from "react";
import GenEdge from "../components/edges/GenEdge";
import SettingsEdge from "../components/edges/SettingsEdge";
import NodeComponent from "../components/nodes/NodeComponent";

interface UseFlowTypesParams {
    isMenuOpen?: boolean;
    onMenuOpen?: () => void;
    onMenuClose?: () => void;
    onNodeClick?: (nodeId: string) => void;
    isVertical?: boolean;
}

export const useFlowTypes = ({
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

    const nodeTypes = useMemo(
        () => ({
            GenNode: (props: any) => (
                <NodeComponent {...props} isVertical={isVertical} onNodeClick={onNodeClick} />
            ),
        }),
        [isVertical, onNodeClick],
    );

    return { edgeTypes, nodeTypes };
};
