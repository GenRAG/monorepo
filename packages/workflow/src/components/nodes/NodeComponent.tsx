import { Handle, Position } from "@xyflow/react";
import { memo } from "react";
import type { AppNodeData, WorkflowNodeProps } from "../../types/app-node";
import { getTaskDef } from "../../graph/task-utils";
import { Task, TaskParam } from "../../types/task";
import {
    Box,
    Text,
    Flex,
    HStack,
    Badge,
    useColorModeValue,
    Button,
} from "@chakra-ui/react";
import { NodeShape } from "./NodeShape";
import { useAppResponsive } from "../../hooks/useAppResponsive";
import { TrashIcon } from "lucide-react";

const NodeComponent = memo((props: WorkflowNodeProps) => {
    const nodeData = props.data as AppNodeData;
    const task = getTaskDef(nodeData.type) as Task | undefined;
    const isMobile = useAppResponsive({ base: true, lg: false });

    const borderColor = useColorModeValue("green.200", "grey.700");
    const activeBorder = useColorModeValue("green.400", "green.500");
    const headerBg = useColorModeValue("green.50", "grey.900");
    const cardBg = useColorModeValue("white", "grey.800");
    const dividerColor = useColorModeValue("green.100", "grey.700");
    const textColor = useColorModeValue("grey.700", "grey.200");
    const labelColor = useColorModeValue("grey.500", "grey.400");
    const rowHoverBg = useColorModeValue("grey.50", "grey.750");
    const badgeBg = useColorModeValue("green.400", "grey.700");
    const badgeColor = useColorModeValue("white", "green.300");
    const badgeBorder = useColorModeValue("green.200", "grey.600");

    const configInputs = (task?.inputs ?? []).filter(
        (input: TaskParam) => !input.hideHandle,
    );

    if (task?.component) {
        const C = task.component;
        return <C {...props} />;
    }

    if (!task) return null;

    return (
        <Box position="relative" className="drag-handle">
            <Box
                onClick={() => props.onNodeClick?.(props.id)}
                cursor="pointer"
                w={isMobile ? "140px" : "220px"}
                border="1px solid"
                borderColor={props.selected ? activeBorder : borderColor}
                borderRadius="12px"
                boxShadow={
                    props.selected
                        ? "0 0 0 2px var(--chakra-colors-green-400), 0 4px 20px rgba(52,211,169,0.18)"
                        : "0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)"
                }
                overflow="hidden"
                transition="all 0.18s ease"
                _hover={{
                    borderColor: props.selected ? activeBorder : "green.400",
                    transform: "translateY(-1px)",
                }}
                _active={{ transform: "translateY(0px)" }}
                bg={cardBg}
            >
                <Box
                    bg={headerBg}
                    px={isMobile ? 2 : 3}
                    py={isMobile ? 1.5 : 2}
                    borderBottom="1px solid"
                    borderColor={dividerColor}
                >
                    <HStack spacing={2} justify="space-between">
                        <HStack spacing={2} minW={0} flex={1}>
                            <NodeShape
                                shape={task.shape}
                                icon={task.icon}
                                isSelected={!!props.selected}
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

                        {task.isDeletable && props.onRemoveNode && (
                            <Button
                                variant="ghost"
                                minW="auto"
                                h="24px"
                                px="6px"
                                onClick={async (event) => {
                                    event.stopPropagation();
                                    await props.onRemoveNode!(props.id ?? "");
                                }}
                            >
                                <TrashIcon size={12} />
                            </Button>
                        )}
                    </HStack>
                </Box>

                <Flex direction="column" gap={0}>
                    {!task.isEntryPoint && (
                        <Box>
                            <HStack
                                justify="start"
                                align="center"
                                borderRadius="6px"
                                position="relative"
                                _hover={{ bg: rowHoverBg }}
                                transition="background 0.1s"
                                ml="-3px"
                                h="full"
                            >
                                <Box
                                    position="relative"
                                    w="8px"
                                    h="full"
                                    flexShrink={0}
                                >
                                    <Handle
                                        id="main-target"
                                        type="target"
                                        position={Position.Left}
                                        style={{
                                            position: "relative",
                                            top: "auto",
                                            right: "auto",
                                            transform: "none",
                                            backgroundColor: "#34D3A9",
                                            borderRadius: "0px",
                                            borderRight: props.selected
                                                ? "1px solid #34D3A9"
                                                : "1px solid #E7E7E7",
                                            borderColor: "transparent",
                                            borderRightColor: props.selected
                                                ? "#34D3A9"
                                                : "#E7E7E7",
                                            width: "8px",
                                            height: "26px",
                                            display: "block",
                                        }}
                                    />
                                </Box>
                                <Text
                                    fontSize={isMobile ? "9px" : "11px"}
                                    fontWeight={500}
                                    color={labelColor}
                                    letterSpacing="0.02em"
                                    noOfLines={1}
                                >
                                    Input
                                </Text>
                            </HStack>
                        </Box>
                    )}

                    <Box borderTop="1px solid" borderColor={dividerColor} />

                    {configInputs.map((input: TaskParam, index: number) => (
                        <Box key={input.name}>
                            {index > 0 && (
                                <Box
                                    borderTop="1px solid"
                                    borderColor={dividerColor}
                                />
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
                                            border: props.selected
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

                    {!task.isEndPoint && (
                        <>
                            <Box
                                borderTop="1px solid"
                                borderColor={dividerColor}
                            />
                            <Box>
                                <HStack
                                    justify="end"
                                    align="center"
                                    borderRadius="6px"
                                    position="relative"
                                    _hover={{ bg: rowHoverBg }}
                                    transition="background 0.1s"
                                    mr="-3px"
                                >
                                    <Text
                                        fontSize={isMobile ? "9px" : "11px"}
                                        fontWeight={500}
                                        color={labelColor}
                                        letterSpacing="0.02em"
                                        noOfLines={1}
                                    >
                                        Output
                                    </Text>
                                    <Box
                                        position="relative"
                                        w="8px"
                                        flexShrink={0}
                                    >
                                        <Handle
                                            id="main-source"
                                            type="source"
                                            position={Position.Right}
                                            style={{
                                                position: "relative",
                                                top: "auto",
                                                right: "auto",
                                                transform: "none",
                                                backgroundColor: "#34D3A9",
                                                borderRadius: "0px",
                                                borderLeft: props.selected
                                                    ? "1px solid #34D3A9"
                                                    : "1px solid #E7E7E7",
                                                borderColor: "transparent",
                                                borderLeftColor: props.selected
                                                    ? "#34D3A9"
                                                    : "#E7E7E7",
                                                width: "8px",
                                                height: "26px",
                                                display: "block",
                                            }}
                                        />
                                    </Box>
                                </HStack>
                            </Box>
                        </>
                    )}
                </Flex>
            </Box>
        </Box>
    );
},
);

NodeComponent.displayName = "NodeComponent";
export default NodeComponent;
