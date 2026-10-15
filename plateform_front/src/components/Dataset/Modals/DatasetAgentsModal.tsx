import { useEffect, useMemo, useState } from "react";
import {
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
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
import { Search } from "lucide-react";
import Button from "components/ui/Button";
import useApiErrorToast from "hooks/useApiErrorToast";
import useThemedToast from "hooks/useThemedToast";
import { useGetWorkspaceAgentsQuery } from "services/agent/agent";
import { useSetDatasetAgentsMutation } from "services/dataset/dataset";
import { DatasetEntity } from "types/dataset/dataset";
import { AgentUsageRow } from "./AgentUsageRow";

/** Below this many agents, the whole list fits on screen and a search field would only add noise. */
const SEARCH_THRESHOLD = 8;

interface DatasetAgentsModalProps {
    dataset: DatasetEntity | null;
    workspaceId: string;
    onClose: () => void;
}

/** Picks every agent allowed to search a dataset, saved in one request. */
export const DatasetAgentsModal = ({ dataset, workspaceId, onClose }: DatasetAgentsModalProps) => {
    const toast = useThemedToast();
    const notifyError = useApiErrorToast();
    const { data: agents = [], isLoading } = useGetWorkspaceAgentsQuery(workspaceId, { skip: !dataset });
    const [setDatasetAgents, { isLoading: isSaving }] = useSetDatasetAgentsMutation();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");
    const overlayBg = useColorModeValue("whiteAlpha.600", "blackAlpha.400");

    useEffect(() => {
        setSelected(new Set(dataset?.agents.map((agent) => agent.id) ?? []));
        setSearch("");
    }, [dataset]);

    const sortedAgents = useMemo(() => [...agents].sort((a, b) => a.name.localeCompare(b.name)), [agents]);
    const query = search.trim().toLowerCase();
    const visibleAgents = query
        ? sortedAgents.filter((agent) => agent.name.toLowerCase().includes(query))
        : sortedAgents;

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
            notifyError("Enregistrement impossible", error);
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
                {sortedAgents.length > SEARCH_THRESHOLD && (
                    <InputGroup size="sm" px={6} pb={3}>
                        <InputLeftElement pointerEvents="none" left={6}>
                            <Icon as={Search} boxSize={4} color="textLabel" />
                        </InputLeftElement>
                        <Input
                            variant="glass"
                            placeholder="Rechercher un agent..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputGroup>
                )}
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
                    ) : visibleAgents.length === 0 ? (
                        <Text variant="body-sm-muted" px={3} py={4}>
                            Aucun agent ne correspond à « {search.trim()} ».
                        </Text>
                    ) : (
                        <Stack spacing={2}>
                            {visibleAgents.map((agent) => (
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
                    <Text variant="body-xs-muted" mr="auto">
                        {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
                    </Text>
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
