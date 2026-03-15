"use client";

import { TaskParam } from "lib/type/task";
import { Handle, Position } from "@xyflow/react";
import { VStack } from "@chakra-ui/react";

export function NodeOutputs({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col divide-y gap-1">{children}</div>;
}

export function NodeOutput({
    output,
    isSelected,
}: {
    output: TaskParam;
    isSelected?: boolean;
}) {
    return (
        <VStack>
            {!output.hideHandle && (
                <Handle
                    id={output.name}
                    type="source"
                    position={Position.Bottom}
                    style={{
                        border: isSelected
                            ? "2px solid #34D3A9"
                            : "2px solid #E7E7E7",
                        bottom: "-8px",
                        width: "8px",
                        height: "8px",
                    }}
                />
            )}
        </VStack>
    );
}
