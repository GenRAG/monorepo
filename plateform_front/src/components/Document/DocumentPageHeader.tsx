import React from "react";
import { Grid } from "@chakra-ui/react";
import { DocumentRouteParams } from "types/document/document";
import { useGetAgentDocumentStatsQuery } from "services/document/document";
import { StorageOverviewPanel } from "./StorageOverviewPanel";

type DocumentPageHeaderProps = DocumentRouteParams;

export const DocumentPageHeader: React.FC<DocumentPageHeaderProps> = ({
    workspaceId,
    agentId,
}) => {
    const { data: stats } = useGetAgentDocumentStatsQuery({
        workspaceId,
        agentId,
    });
    return (
        <Grid gap={3} w="100%">
            <StorageOverviewPanel stats={stats ?? null} />
        </Grid>
    );
};
