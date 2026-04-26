import { useMemo } from "react";
import GenEdge from "../components/edges/GenEdge";
import SettingsEdge from "../components/edges/SettingsEdge";
import { EdgeType } from "../types/edge";

interface UseFlowTypesParams {
    onEdgeClick?: () => void;
}

export const useFlowTypes = ({ onEdgeClick }: UseFlowTypesParams = {}) => {
    const edgeTypes = useMemo(
        () => ({
            [EdgeType.Main]: (props: any) => (
                <GenEdge {...props} onToggle={onEdgeClick} />
            ),
            [EdgeType.Settings]: (props: any) => <SettingsEdge {...props} />,
        }),
        [onEdgeClick],
    );

    return { edgeTypes };
};
