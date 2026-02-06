import { Handle, Position } from "@xyflow/react";
import React from "react";
import { TaskParam } from "lib/type/task";
import { ColorForHandle } from "components/Molecules/Nodes/Common";
import { VStack } from "@chakra-ui/react";

export function NodeInputs({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col divide-y gap-2">{children}</div>;
}

export function NodeInput({
  input,
  nodeId,
  isSelected,
}: {
  input: TaskParam;
  nodeId: string;
  isSelected?: boolean;
}) {
  return (
    <VStack>
      {!input.hideHandle && (
        <Handle
          id={input.name}
          type="target"
          position={Position.Left}
          style={{
            backgroundColor: ColorForHandle[input.type],
            border: isSelected ? "2px solid #34D3A9" : "2px solid #E7E7E7",
            left: "-8px",
            width: "8px",
            height: "8px",
          }}
        />
      )}
    </VStack>
  );
}