import React, { useCallback, useState } from "react";
import { Grid, Modal, ModalContent, ModalOverlay, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AgentFormPanel, type Template } from "components/Agents/AgentFormPanel";
import { AgentPreviewPanel } from "components/Agents/AgentPreviewPanel";
import { useCreateAgentMutation } from "services/agent/agent";
import useThemedToast from "hooks/useThemedToast";
import { makeFlowNode, linkNodes, withAutoSettings, serializeWorkflow, TaskType } from "@genrag/workflow";
import mixpanel from "lib/mixpanel";

const { nodes: _faqNodes, edges: _faqEdges } = withAutoSettings(
    [
        makeFlowNode("q", TaskType.QUERY, 0, 0),
        makeFlowNode("w", TaskType.REWRITER, 0, 180),
        makeFlowNode("r", TaskType.RETRIEVER, 400, 280),
        makeFlowNode("k", TaskType.RERANKER, 0, 450),
        makeFlowNode("s", TaskType.RESPONSE, 360, 550),
    ],
    [linkNodes("q", "w"), linkNodes("w", "r"), linkNodes("r", "k"), linkNodes("k", "s")],
);

const { nodes: BLANK_NODES, edges: BLANK_EDGES } = withAutoSettings(
    [
        makeFlowNode("q", TaskType.QUERY, 0, -50),
        makeFlowNode("r", TaskType.RETRIEVER, 50, 180),
        makeFlowNode("s", TaskType.RESPONSE, 520, 240),
    ],
    [linkNodes("q", "r"), linkNodes("r", "s")],
);

const TEMPLATES: Template[] = [
    {
        id: "basic",
        name: "Agent Conversationnel Avancé",
        description: "Répond a vos questions de manière précis et efficace.",
        nodes: _faqNodes,
        edges: _faqEdges,
    },
];

interface CreateAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, workspaceId }) => {
    const navigate = useNavigate();
    const toast = useThemedToast();
    const [createAgent, { isLoading }] = useCreateAgentMutation();
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const modalBg = useColorModeValue("white", "grey.950");

    const handleCreate = useCallback(
        async (name: string, description: string) => {
            try {
                const nodes = selectedTemplate?.nodes ?? BLANK_NODES;
                const edges = selectedTemplate?.edges ?? BLANK_EDGES;

                const agent = await createAgent({
                    workspaceId,
                    name: name.trim(),
                    description: description.trim() || undefined,
                    workflow: {
                        name: selectedTemplate?.name ?? "Workflow initial",
                        definition: serializeWorkflow(nodes, edges) as unknown as {
                            [key: string]: unknown;
                        },
                    },
                }).unwrap();

                mixpanel.track("agent_created", {
                    agent_id: agent.id,
                    template_used: selectedTemplate?.id ?? "blank",
                });
                onClose();
                void navigate(`/workspaces/${workspaceId}/agents/${agent.id}/workflow`);
            } catch {
                toast({
                    title: "Erreur lors de la création",
                    description: "Veuillez réessayer.",
                    status: "error",
                    duration: 3000,
                });
            }
        },
        [selectedTemplate, workspaceId, createAgent, navigate, onClose, toast],
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="slideInBottom">
            <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(4px)" />
            <ModalContent bg={modalBg} borderRadius={0} overflow="hidden" m={0} maxW="100vw" maxH="100vh" h="100vh">
                <Grid templateColumns="1fr 1fr" h="100%">
                    <AgentFormPanel
                        isOpen={isOpen}
                        templates={TEMPLATES}
                        selectedTemplate={selectedTemplate}
                        onTemplateSelect={setSelectedTemplate}
                        isLoading={isLoading}
                        onClose={onClose}
                        onCreate={handleCreate}
                    />
                    <AgentPreviewPanel selectedTemplate={selectedTemplate} />
                </Grid>
            </ModalContent>
        </Modal>
    );
};
