import { useEffect, useMemo, useState } from "react";
import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Skeleton,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import Button from "components/ui/Button";
import useThemedToast from "hooks/useThemedToast";
import { useGetWorkspaceAgentsQuery } from "services/agent/agent";
import { useSetDatasetAgentsMutation } from "services/dataset/dataset";
import { DatasetEntity } from "types/dataset/dataset";
import { getApiErrorMessage } from "utils/apiError";
import { AgentUsageRow } from "./AgentUsageRow";

interface DatasetAgentsModalProps {
    dataset: DatasetEntity | null;
    workspaceId: string;
    onClose: () => void;
}

/** Picks every agent allowed to search a dataset, saved in one request. */
export const DatasetAgentsModal = ({ dataset, workspaceId, onClose }: DatasetAgentsModalProps) => {
    const toast = useThemedToast();
    const { data: agents = [], isLoading } = useGetWorkspaceAgentsQuery(workspaceId, { skip: !dataset });
    const [setDatasetAgents, { isLoading: isSaving }] = useSetDatasetAgentsMutation();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const overlayBg = useColorModeValue("whiteAlpha.600", "blackAlpha.400");

    useEffect(() => {
        setSelected(new Set(dataset?.agents.map((agent) => agent.id) ?? []));
    }, [dataset]);

    const sortedAgents = useMemo(() => [...agents].sort((a, b) => a.name.localeCompare(b.name)), [agents]);

    const toggle = (agentId: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(agentId)) next.delete(agentId);
            else next.add(agentId);
            return next;
        });

    const handleSave = async () => {
        if (!dataset) return;
        try {
            await setDatasetAgents({
                workspaceId,
                id: dataset.id,
                agentIds: [...selected],
            }).unwrap();
            toast({ title: "Agents mis à jour", status: "success", duration: 2000 });
            onClose();
        } catch (error) {
            toast({
                title: "Enregistrement impossible",
                description: getApiErrorMessage(error) || "Veuillez réessayer.",
                status: "error",
                duration: 5000,
            });
        }
    };

    return (
        <Modal isOpen={!!dataset} onClose={onClose} isCentered size="md" scrollBehavior="inside">
            <ModalOverlay bg={overlayBg} />
            <ModalContent bg="transparent" backdropFilter="blur(20px)" borderRadius="16px">
                <ModalHeader pb={1}>Utiliser dans des agents</ModalHeader>
                <Text variant="body-xs-muted" px={6} pb={3}>
                    Les agents cochés pourront répondre à partir de « {dataset?.name} ».
                </Text>
                <ModalCloseButton />
                <ModalBody px={3}>
                    {isLoading ? (
                        <Stack spacing={2} px={3}>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} h="44px" borderRadius="10px" />
                            ))}
                        </Stack>
                    ) : sortedAgents.length === 0 ? (
                        <Text variant="body-sm-muted" px={3} py={4}>
                            Vous n&apos;avez pas encore d&apos;agent.
                        </Text>
                    ) : (
                        <Stack spacing={0.5}>
                            {sortedAgents.map((agent) => (
                                <AgentUsageRow
                                    key={agent.id}
                                    agent={agent}
                                    workspaceId={workspaceId}
                                    datasetId={dataset?.id ?? ""}
                                    isChecked={selected.has(agent.id)}
                                    onToggle={() => toggle(agent.id)}
                                />
                            ))}
                        </Stack>
                    )}
                </ModalBody>
                <ModalFooter gap={2}>
                    <Button size="sm" variant="ghost" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button size="sm" variant="superPrimary" onClick={handleSave} isLoading={isSaving}>
                        Enregistrer
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
