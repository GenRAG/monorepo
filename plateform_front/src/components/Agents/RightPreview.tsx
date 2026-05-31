import React, { FC } from "react";
import { Box } from "@chakra-ui/react";
import { WorkflowPreview } from "components/System/Molecules/WorkflowPreview/WorkflowPreview";
import type { AppNode } from "@genrag/workflow";
import type { Edge } from "@xyflow/react";

interface Props {
    nodes: AppNode[];
    edges: Edge[];
    selectedTemplateId?: string | null;
}

export const RightPreview: FC<Props> = ({ nodes, edges, selectedTemplateId }) => {
    return (
        <Box flex={1} position="relative" overflow="hidden">
            <Box position="absolute" inset={0}>
                <WorkflowPreview
                    key={selectedTemplateId ?? "blank"}
                    height="100%"
                    nodes={nodes}
                    edges={edges}
                    zoom={0.65}
                    padding={0.3}
                    border={false}
                />
            </Box>
        </Box>
    );
};

export default RightPreview;
