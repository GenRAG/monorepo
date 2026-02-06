import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

const useFixNodePosition = (nodeId: string) => {
    const { setCenter, getNode } = useReactFlow();

    const fixPosition = useCallback(() => {
        const node = getNode(nodeId);
        if (!node) return;

        const { position, measured } = node;
        if (!position || !measured) return;

        const { width, height } = measured;
        const x = position.x + (width || 420) / 2;
        const y = position.y + (height || 200) / 2;

        if (x !== undefined && y !== undefined) {
            setCenter(x, y, {
                zoom: 1,
                duration: 500,
            });
        }
    }, [nodeId, getNode, setCenter]);

    return fixPosition;
};

export default useFixNodePosition;