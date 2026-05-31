import React from "react";
import { Box } from "@chakra-ui/react";
import RightPreview from "components/Agents/RightPreview";
import AgentPreviewHeader from "components/Agents/AgentPreviewHeader";
import { makeFlowNode, linkNodes, withAutoSettings, TaskType } from "@genrag/workflow";
import type { Template } from "components/Agents/AgentFormPanel";

const { nodes: BLANK_NODES, edges: BLANK_EDGES } = withAutoSettings(
    [
        makeFlowNode("q", TaskType.QUERY, 0, -50),
        makeFlowNode("r", TaskType.RETRIEVER, 50, 180),
        makeFlowNode("s", TaskType.RESPONSE, 520, 0),
    ],
    [linkNodes("q", "r"), linkNodes("r", "s")],
);

interface AgentPreviewPanelProps {
    selectedTemplate: Template | null;
}

export const AgentPreviewPanel: React.FC<AgentPreviewPanelProps> = ({ selectedTemplate }) => {
    const nodes = selectedTemplate?.nodes ?? BLANK_NODES;
    const edges = selectedTemplate?.edges ?? BLANK_EDGES;
    const title = selectedTemplate?.name ?? "Agent de Conversation";
    const description =
        selectedTemplate?.description ??
        "Contruisez le flux de votre agent avec une interface visuelle simple et intuitive.";

    return (
        <Box bg="secondBackgroundDefault" position="relative" display="flex" flexDirection="column" overflow="hidden">
            <AgentPreviewHeader title={title} description={description} />

            <RightPreview nodes={nodes} edges={edges} selectedTemplateId={selectedTemplate?.id} />
        </Box>
    );
};
