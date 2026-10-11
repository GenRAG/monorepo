import React from "react";
import { Box } from "@chakra-ui/react";
import RightPreview from "components/Agents/RightPreview";
import AgentPreviewHeader from "components/Agents/AgentPreviewHeader";
import { BLANK_WORKFLOW } from "constants/agent/blankWorkflow";
import type { Template } from "components/Agents/AgentFormPanel";

interface AgentPreviewPanelProps {
    selectedTemplate: Template | null;
}

export const AgentPreviewPanel: React.FC<AgentPreviewPanelProps> = ({ selectedTemplate }) => {
    const nodes = selectedTemplate?.nodes ?? BLANK_WORKFLOW.nodes;
    const edges = selectedTemplate?.edges ?? BLANK_WORKFLOW.edges;
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
