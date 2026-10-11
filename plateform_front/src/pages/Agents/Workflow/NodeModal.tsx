import { Flex, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { useReactFlow } from "@xyflow/react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PANELS } from "components/Agents/Workflow/NodeModalContent/panels";
import { Task, TaskType, type AppNodeData } from "@genrag/workflow";

interface NodeModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    nodeData?: AppNodeData;
    selectedNodeId?: string | null;
    onSettingSelect: (nodeId: string, item: string) => void;
    onAddSettingNode: (parentId: string, inputName: string, value: string) => void;
    onRemoveSettingNode: (nodeId: string) => void;
    workspaceId: string;
    agentId: string;
}

export const NodeModal = ({
    task,
    isOpen,
    onClose,
    nodeData,
    selectedNodeId,
    onSettingSelect,
    onAddSettingNode,
    onRemoveSettingNode,
    workspaceId,
    agentId,
}: NodeModalProps) => {
    const { fitView, getNode } = useReactFlow();
    const [contentReady, setContentReady] = useState(false);

    const parentNode = nodeData?.parentNodeId ? getNode(nodeData.parentNodeId) : undefined;
    const Panel = task ? PANELS[task.type] : null;

    const modalWidth = task?.type === TaskType.MODEL ? "550px" : "420px";

    const handleClose = () => {
        setContentReady(false);
        onClose();
        setTimeout(async () => {
            await fitView({ duration: 500, minZoom: 1, maxZoom: 1 });
        }, 500);
    };

    return (
        <motion.div
            animate={{ width: isOpen && task ? modalWidth : "0px" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
                height: "100%",
                overflow: "hidden",
                backgroundColor: "transparent",
            }}
        >
            <AnimatePresence>
                {isOpen && task && (
                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onAnimationComplete={() => setContentReady(true)}
                        style={{
                            height: "100%",
                            width: modalWidth,
                        }}
                    >
                        <Flex direction="column" w={modalWidth} h="100%" bg="surfacePrimary">
                            <Flex
                                p={4}
                                borderBottom="1px solid"
                                borderColor="borderSubtle"
                                align="center"
                                justify="space-between"
                                bg="surfacePrimary"
                            >
                                <HStack spacing={6}>
                                    <VStack alignItems="start" spacing={0}>
                                        <Text fontWeight="semibold" fontSize="md">
                                            {task.label || task.type}
                                        </Text>
                                        <Text fontSize="xs" color="textDescription">
                                            {task.description}
                                        </Text>
                                    </VStack>
                                </HStack>
                                <HStack spacing={2}>
                                    <IconButton
                                        aria-label="Close"
                                        icon={<X size={18} />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleClose}
                                    />
                                </HStack>
                            </Flex>
                            {Panel && selectedNodeId && nodeData && (task.type !== TaskType.MODEL || contentReady) && (
                                <Panel
                                    nodeId={selectedNodeId}
                                    nodeData={nodeData}
                                    workspaceId={workspaceId}
                                    agentId={agentId}
                                    ownerType={parentNode?.data?.type as TaskType | undefined}
                                    onSettingSelect={onSettingSelect}
                                    onAddSettingNode={onAddSettingNode}
                                    onRemoveSettingNode={onRemoveSettingNode}
                                    onClose={onClose}
                                />
                            )}
                        </Flex>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
