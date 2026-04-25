import { useMemo } from "react";
import GenEdge from "../components/edges/GenEdge";
import SettingsEdge from "../components/edges/SettingsEdge";

interface UseFlowTypesParams {
    onEdgeClick?: () => void;
}

export const useFlowTypes = ({ onEdgeClick }: UseFlowTypesParams = {}) => {
    const edgeTypes = useMemo(
        () => ({
            default: (props: any) => (
                <GenEdge {...props} onToggle={onEdgeClick} />
            ),
            settings: (props: any) => <SettingsEdge {...props} />,
        }),
        [onEdgeClick],
    );

    return { edgeTypes };
};
