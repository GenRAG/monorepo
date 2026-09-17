import { Box, HStack } from "@chakra-ui/react";
import { Download } from "lucide-react";
import { ExportCard } from "components/Deployment/ExportCard";
import SectionHeader from "components/Deployment/SectionHeader";
import { useParams } from "react-router-dom";
import { useLazyExportConversationsQuery, useLazyExportApiLogsQuery } from "services/deployment/deployment";
import useThemedToast from "hooks/useThemedToast";

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

export const UserRights = () => {
    const { workspaceId, agentId } = useParams<{ workspaceId: string; agentId: string }>();
    const toast = useThemedToast();
    const [exportConversations, { isFetching: isExportingConversations }] = useLazyExportConversationsQuery();
    const [exportApiLogs, { isFetching: isExportingLogs }] = useLazyExportApiLogsQuery();

    const handleExport = async (trigger: typeof exportConversations | typeof exportApiLogs, filename: string) => {
        if (!workspaceId || !agentId) return;
        try {
            const blob = await trigger({ workspaceId, agentId }).unwrap();
            downloadBlob(blob, filename);
        } catch {
            toast({
                title: "Erreur lors de l'export",
                description: "Une erreur est survenue lors de l'export. Veuillez réessayer.",
                status: "error",
                duration: 5000,
            });
        }
    };

    return (
        <Box borderRadius="12px" border="1px solid" borderColor="borderDefault" bg="surfaceCard">
            <SectionHeader
                title="Droits d'exportation"
                subtitle="Gérez les droits d'exportation des données de votre application"
            />
            <HStack spacing={3} align="stretch" p={5}>
                <ExportCard
                    icon={<Download size={15} />}
                    title="Export des conversations"
                    subtitle="Format JSON - 1 client par fichier"
                    onClick={() => handleExport(exportConversations, `conversations-${agentId}.json`)}
                    isLoading={isExportingConversations}
                />
                <ExportCard
                    icon={<Download size={15} />}
                    title="Export des logs API"
                    subtitle="Format CSV - 90 derniers jours"
                    onClick={() => handleExport(exportApiLogs, `api-logs-${agentId}.csv`)}
                    isLoading={isExportingLogs}
                />
            </HStack>
        </Box>
    );
};
