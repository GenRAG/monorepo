import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import NodeCard from "components/Molecules/Nodes/NodeCard";
import NodeHeader from "components/Molecules/Nodes/NodeHeader";
import { AppNodeData } from "lib/type/app-node";
import { TaskRegistry } from "lib/workflow/task/registry";
import { NodeInputs, NodeInput } from "components/Molecules/Nodes/NodeInputs";
import { NodeOutputs, NodeOutput } from "components/Molecules/Nodes/NodeOutputs";
import { Task, TaskNodeFormat, TaskParam, TaskType } from "lib/type/task";
import { Circle, Icon, VStack, Box, useColorModeValue, Text, useColorMode } from "@chakra-ui/react";
import { NodeShape } from "components/Molecules/Nodes/NodeShape";

const NodeComponent = memo((props: NodeProps & { onNodeClick?: (nodeId: string) => void }) => {
    const nodeData = props.data as AppNodeData;
    const task = TaskRegistry[nodeData.type] as Task;
    const { colorMode } = useColorMode();

    return (
        <Box position="relative">
            <Text
                variant="body-sm-semibold"
                position="absolute"
                top="-24px"
                left="50%"
                transform="translateX(-50%)"
                whiteSpace="nowrap"
                zIndex={1}
                color={colorMode === 'dark' ? 'grey.100' : 'grey.900'}
            >
                {task.label}
            </Text>
            <NodeCard nodeId={props.id} isSelected={!!props.selected} onNodeClick={props.onNodeClick}>
                <NodeShape shape={task.shape} icon={task.icon} isSelected={!!props.selected} />
                <NodeInputs>
                    {task.inputs.map((input: TaskParam) => (
                        <NodeInput key={input.name} input={input} nodeId={props.id} isSelected={!!props.selected} />
                    ))}
                </NodeInputs>
                {"outputs" in task && task.outputs && (
                    <NodeOutputs>
                        {task.outputs.map((output: TaskParam) => (
                            <NodeOutput key={output.name} output={output} isSelected={!!props.selected} />
                        ))}
                    </NodeOutputs>
                )}
            </NodeCard>
        </Box>
    );
});

export default NodeComponent;

NodeComponent.displayName = "NodeComponent";