import { Flex, HStack, IconButton, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { useReactFlow } from "@xyflow/react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import DatabaseNodeModal from "components/Agents/Workflow/NodeModalContent/Document/DocumentNodeContent";
import RerankerNodeModal from "components/Agents/Workflow/NodeModalContent/ReRanker/ReRankerNodeContent";
import RewriterNodeModal from "components/Agents/Workflow/NodeModalContent/Rewriter/RewriterNodeContent";
import QueryNodeModal from "components/Agents/Workflow/NodeModalContent/Query/QueryNodeContent";
import { ModelSelectorContent } from "components/Agents/Workflow/NodeModalContent/ModelSelector/ModelSelectorContent";
import { Task, TaskType, type AppNodeData } from "@genrag/workflow";
import ResponseNodeModal from "components/Agents/Workflow/NodeModalContent/Response/ResponseNodeContent";
import useThemedToast from "hooks/useThemedToast";
import { useGetModelsGenerationQuery, useGetModelsRerankQuery } from "services/models/models";

interface NodeModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    nodeData?: AppNodeData;
    selectedNodeId?: string | null;
    onSettingSelect?: (nodeId: string, item: string) => void;
}

export const NodeModal = ({ task, isOpen, onClose, nodeData, selectedNodeId, onSettingSelect }: NodeModalProps) => {
    const { fitView, getNode } = useReactFlow();
    const [contentReady, setContentReady] = useState(false);
    const toast = useThemedToast();

    const bgColor = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.100", "grey.700");
    const sectionBg = useColorModeValue("grey.25", "grey.900");
    const labelColor = useColorModeValue("grey.600", "grey.400");

    const parentNode = nodeData?.parentNodeId ? getNode(nodeData.parentNodeId) : undefined;
    const callbackFetchModels =
        parentNode?.data?.type === TaskType.RERANKER ? useGetModelsRerankQuery : useGetModelsGenerationQuery;

    const modalWidth = task?.type === TaskType.MODEL ? "680px" : "420px";

    const handleClose = () => {
        setContentReady(false);
        onClose();
        setTimeout(async () => {
            await fitView({ duration: 500, minZoom: 1, maxZoom: 1 });
        }, 500);
    };

    const handleModelSelect = useCallback(
        (item: string) => {
            onSettingSelect?.(selectedNodeId ?? "", item);
            toast({ title: `Modèle sélectionné: ${item}`, status: "success" });
            onClose();
        },
        [onSettingSelect, selectedNodeId, toast, onClose],
    );

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
                        <Flex
                            direction="column"
                            w={modalWidth}
                            h="100%"
                            bg={bgColor}
                            borderLeft="1px solid"
                            borderColor={borderColor}
                        >
                            <Flex
                                p={4}
                                borderBottom="1px solid"
                                borderColor={borderColor}
                                align="center"
                                justify="space-between"
                                bg={sectionBg}
                            >
                                <HStack spacing={6}>
                                    <VStack alignItems="start" spacing={0}>
                                        <Text fontWeight="semibold" fontSize="md">
                                            {task.label || task.type}
                                        </Text>
                                        <Text fontSize="xs" color={labelColor}>
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
                            {task.type === TaskType.RETRIEVER && <DatabaseNodeModal />}
                            {task.type === TaskType.RERANKER && (
                                <RerankerNodeModal
                                    task={task}
                                    nodeData={nodeData!}
                                    mainNodeId={selectedNodeId ?? ""}
                                    onSettingSelect={onSettingSelect ?? (() => {})}
                                />
                            )}
                            {task.type === TaskType.REWRITER && (
                                <RewriterNodeModal
                                    task={task}
                                    nodeData={nodeData!}
                                    mainNodeId={selectedNodeId ?? ""}
                                    onSettingSelect={onSettingSelect ?? (() => {})}
                                />
                            )}
                            {task.type === TaskType.QUERY && <QueryNodeModal />}
                            {task.type === TaskType.RESPONSE && (
                                <ResponseNodeModal
                                    task={task}
                                    nodeData={nodeData!}
                                    mainNodeId={selectedNodeId ?? ""}
                                    onSettingSelect={onSettingSelect ?? (() => {})}
                                />
                            )}
                            {task.type === TaskType.MODEL && contentReady && (
                                <ModelSelectorContent
                                    onSelect={handleModelSelect}
                                    fetchModels={() => callbackFetchModels()}
                                />
                            )}
                        </Flex>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
