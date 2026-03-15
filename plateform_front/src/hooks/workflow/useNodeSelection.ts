import { useState, useCallback, useEffect } from "react";
import { useDisclosure } from "@chakra-ui/react";
import useNodeInformation from "hooks/workflow/useNodeInformation";
import useFixNodePosition from "hooks/workflow/useFixNodePosition";

export const useNodeSelection = () => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
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
