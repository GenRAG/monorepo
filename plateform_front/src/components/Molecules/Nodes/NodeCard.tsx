"use client";

import { ReactNode } from "react";
import { VStack } from "@chakra-ui/react";
import useFixNodePosition from "hooks/useFixNodePosition";

const NodeCard = ({
    children,
    nodeId,
    isSelected,
    onNodeClick,
}: {
    nodeId: string;
    children: ReactNode;
    isSelected: boolean;
    onNodeClick?: (nodeId: string) => void;
}) => {

    const fixPosition = useFixNodePosition(nodeId);

    const handleClick = () => {
        onNodeClick?.(nodeId);
        setTimeout(() => {
            fixPosition();
        }, 500);
    };

    return (
        <VStack
            onClick={handleClick}
            className={[
                "rounded-md cursor-pointer bg-background border-2 border-separate w-[420px] text-sm gap-1 flex flex-col",
                isSelected ? "border-green-500" : "",
            ].join(" ")}
        >
            {children}
        </VStack>
    );
}


export default NodeCard;