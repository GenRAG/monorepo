import { useMemo } from "react";
import GenEdge from "components/Molecules/Edges/eges";
import SettingsEdge from "components/Molecules/Edges/settings-edge";
import NodeComponent from "components/Molecules/Nodes/NodeComponent";

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
}: UseFlowTypesParams) => {
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
                <NodeComponent
                    {...props}
                    isVertical={isVertical}
                    onNodeClick={onNodeClick}
                />
            ),
        }),
        [onNodeClick, isVertical],
    );

    return { edgeTypes, nodeTypes };
};
