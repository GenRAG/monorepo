import { useReactFlow } from "@xyflow/react";

const useCenterNodePosition = (nodeId: string) => {
    const { getNode } = useReactFlow();

    const node = getNode(nodeId);

    if (!node) return;

    const { position, measured } = node;

    if (!position || !measured) return;

    const { width, height } = measured;
    const x = position.x + width! / 2;
    const y = position.y + height! / 2;

    if (x === undefined || y === undefined) return;

    return { x, y };
};

export default useCenterNodePosition;
