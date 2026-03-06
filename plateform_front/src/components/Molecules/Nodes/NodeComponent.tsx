import { Handle, NodeProps, Position } from "@xyflow/react";
import { memo, useRef } from "react";
import NodeCard from "components/Molecules/Nodes/NodeCard";
import { AppNodeData } from "lib/type/app-node";
import { TaskRegistry } from "lib/workflow/task/registry";
import { Task, TaskParam, TaskType } from "lib/type/task";
import {
    Box,
    Text,
    Flex,
    HStack,
    Badge,
    useColorModeValue,
} from "@chakra-ui/react";
import { NodeShape } from "components/Molecules/Nodes/NodeShape";
import InstructionNode from "components/Molecules/Nodes/SettingNodes/InstructionNode";
import ModelNode from "components/Molecules/Nodes/SettingNodes/ModelNode";
import { useAppResponsive } from "hooks/useAppResponsive";

const NodeHeader = ({
    task,
    isSelected,
    isMobile,
}: {
    task: Task;
    isSelected: boolean;
    isMobile: boolean;
}) => {
    const textColor = useColorModeValue("grey.700", "grey.200");
    const badgeBg = useColorModeValue("green.400", "grey.700");
    const badgeColor = useColorModeValue("white", "green.300");
    const badgeBorder = useColorModeValue("green.200", "grey.600");

    return (
        <HStack spacing={2} justify="space-between">
            <HStack spacing={2} minW={0} flex={1}>
                <NodeShape
                    shape={task.shape}
                    icon={task.icon}
                    isSelected={isSelected}
                    size={isMobile ? 20 : 24}
                    iconSize={isMobile ? 11 : 13}
                    canHover={false}
                />
                <Text
                    fontSize={isMobile ? "10px" : "xs"}
                    fontWeight={700}
                    color={textColor}
                    letterSpacing="0.03em"
                    textTransform="uppercase"
                    noOfLines={1}
                >
                    {task.label}
                </Text>
            </HStack>

            {!isMobile && (task.isEntryPoint || task.isEndPoint) && (
                <Badge
                    fontSize="8px"
                    fontWeight={700}
                    letterSpacing="0.06em"
                    bg={badgeBg}
                    color={badgeColor}
                    border="1px solid"
                    borderColor={badgeBorder}
                    borderRadius="4px"
                    px="5px"
                    textTransform="uppercase"
                    flexShrink={0}
                >
                    {task.isEntryPoint ? "input" : "output"}
                </Badge>
            )}
        </HStack>
    );
};

const NodeBody = ({
    configInputs,
    isSelected,
    isMobile,
}: {
    configInputs: TaskParam[];
    isSelected: boolean;
    isMobile: boolean;
}) => {
    const labelColor = useColorModeValue("grey.500", "grey.400");
    const rowHoverBg = useColorModeValue("grey.50", "grey.750");
    const dividerColor = useColorModeValue("grey.100", "grey.700");

    if (configInputs.length === 0) return null;

    return (
        <Flex direction="column" gap={0}>
            {configInputs.map((input, i) => (
                <Box key={input.name}>
                    {i > 0 && (
                        <Box borderTop="1px solid" borderColor={dividerColor} />
                    )}
                    <HStack
                        justify="end"
                        align="center"
                        p={2}
                        borderRadius="6px"
                        position="relative"
                        _hover={{ bg: rowHoverBg }}
                        transition="background 0.1s"
                    >
                        <Text
                            fontSize={isMobile ? "9px" : "11px"}
                            fontWeight={500}
                            color={labelColor}
                            letterSpacing="0.02em"
                            noOfLines={1}
                        >
                            {input.name}
                        </Text>
                        <Box
                            position="relative"
                            w="8px"
                            h="8px"
                            flexShrink={0}
                            mr="-11px"
                        >
                            <Handle
                                id={`setting-source-${input.name}`}
                                type="source"
                                position={Position.Right}
                                style={{
                                    position: "relative",
                                    top: "auto",
                                    right: "auto",
                                    transform: "none",
                                    backgroundColor: "#6366f1",
                                    border: isSelected
                                        ? "2px solid #34D3A9"
                                        : "2px solid #E7E7E7",
                                    width: "8px",
                                    height: "8px",
                                    display: "block",
                                }}
                            />
                        </Box>
                    </HStack>
                </Box>
            ))}
        </Flex>
    );
};

const NodeComponent = memo(
    (
        props: NodeProps & {
            onNodeClick?: (nodeId: string) => void;
            isVertical: boolean;
        },
    ) => {
        const nodeData = props.data as AppNodeData;
        const task = TaskRegistry[nodeData.type] as Task;
        const isMobile = useAppResponsive({ base: true, lg: false });

        if (nodeData.type === TaskType.INSTRUCTION) {
            return (
                <InstructionNode
                    id={props.id}
                    data={nodeData}
                    selected={!!props.selected}
                    onNodeClick={props.onNodeClick}
                />
            );
        }

        if (nodeData.type === TaskType.MODEL) {
            return (
                <ModelNode
                    id={props.id}
                    data={nodeData}
                    selected={!!props.selected}
                    onNodeClick={props.onNodeClick}
                />
            );
        }

        const configInputs = task.inputs.filter(
            (i: TaskParam) => !i.hideHandle,
        );
        const hasBody = configInputs.length > 0;

        return (
            <Box position="relative">
                {!task.isEntryPoint && (
                    <Handle
                        id="main-target"
                        type="target"
                        position={
                            props.isVertical ? Position.Top : Position.Left
                        }
                        style={{
                            backgroundColor: "#34D3A9",
                            border: props.selected
                                ? "2px solid #34D3A9"
                                : "2px solid #E7E7E7",
                            top: props.isVertical ? "-8px" : undefined,
                            left: props.isVertical ? undefined : "-8px",
                            width: "8px",
                            height: "8px",
                        }}
                    />
                )}

                <NodeCard
                    nodeId={props.id}
                    isSelected={!!props.selected}
                    onNodeClick={props.onNodeClick}
                    header={
                        <NodeHeader
                            task={task}
                            isSelected={!!props.selected}
                            isMobile={isMobile}
                        />
                    }
                    body={
                        hasBody ? (
                            <NodeBody
                                configInputs={configInputs}
                                isSelected={!!props.selected}
                                isMobile={isMobile}
                            />
                        ) : undefined
                    }
                />

                {/* Handle sortie principale */}
                {!task.isEndPoint && (
                    <Handle
                        id="main-source"
                        type="source"
                        position={
                            props.isVertical ? Position.Bottom : Position.Right
                        }
                        style={{
                            backgroundColor: "#34D3A9",
                            border: props.selected
                                ? "2px solid #34D3A9"
                                : "2px solid #E7E7E7",
                            bottom: props.isVertical ? "-8px" : undefined,
                            right: props.isVertical ? undefined : "-8px",
                            width: "8px",
                            height: "8px",
                        }}
                    />
                )}
            </Box>
        );
    },
);

export default NodeComponent;
NodeComponent.displayName = "NodeComponent";
