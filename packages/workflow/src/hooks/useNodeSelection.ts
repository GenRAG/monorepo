import { useState, useCallback, useEffect } from "react";
import useNodeInformation from "./useNodeInformation";
import useFixNodePosition from "./useFixNodePosition";

export const useNodeSelection = () => {

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const onOpen = useCallback(() => setIsOpen(true), []);
    const onClose = useCallback(() => setIsOpen(false), []);
    const { task, nodeData } = useNodeInformation(selectedNodeId);
    const fixPosition = useFixNodePosition(selectedNodeId ?? "");

    useEffect(() => {
        if (selectedNodeId) {
            fixPosition().catch(console.error);
        }
    }, [selectedNodeId, fixPosition]);

    const handleNodeClick = useCallback(
        (nodeId: string) => {
            setSelectedNodeId(nodeId);
            onOpen();
        },
        [onOpen],
    );

    const handleModalClose = useCallback(() => {
        onClose();
    }, [onClose]);

    return {
        selectedNodeId,
        task,
        nodeData,
        isModalOpen: isOpen,
        handleNodeClick,
        handleModalClose,
    };
};
