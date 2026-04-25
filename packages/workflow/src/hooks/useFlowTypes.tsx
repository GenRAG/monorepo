import { useMemo } from "react";
import GenEdge from "../components/edges/GenEdge";
import SettingsEdge from "../components/edges/SettingsEdge";

interface UseFlowTypesParams {
    isMenuOpen?: boolean;
    onMenuOpen?: () => void;
    onMenuClose?: () => void;
}

export const useFlowTypes = ({
    isMenuOpen,
    onMenuOpen,
    onMenuClose,
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

    return { edgeTypes };
};
