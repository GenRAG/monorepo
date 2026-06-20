import { useState } from "react";
import { Box, HStack, useColorModeValue } from "@chakra-ui/react";
import { Download } from "lucide-react";
import { ExportCard } from "components/Deployment/ExportCard";
import SectionHeader from "components/Deployment/SectionHeader";
import { useParams } from "react-router-dom";

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
    const [isExportingConversations, setIsExportingConversations] = useState(false);
    const [isExportingLogs, setIsExportingLogs] = useState(false);

    const borderColor = useColorModeValue("grey.100", "grey.800");
    const bgColor = useColorModeValue("white", "grey.950");

    const baseUrl = process.env.REACT_APP_BACKEND_URL ?? "";

    const handleExportConversations = async () => {
        if (!workspaceId || !agentId) return;
        setIsExportingConversations(true);
        try {
            const res = await fetch(`${baseUrl}/workspaces/${workspaceId}/agents/${agentId}/export/conversations`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            downloadBlob(blob, `conversations-${agentId}.json`);
        } finally {
            setIsExportingConversations(false);
        }
    };

    const handleExportApiLogs = async () => {
        if (!workspaceId || !agentId) return;
        setIsExportingLogs(true);
        try {
            const res = await fetch(`${baseUrl}/workspaces/${workspaceId}/agents/${agentId}/export/api-logs`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            downloadBlob(blob, `api-logs-${agentId}.csv`);
        } finally {
            setIsExportingLogs(false);
        }
    };

    return (
        <Box borderRadius="12px" border="1px solid" borderColor={borderColor} bg={bgColor}>
            <SectionHeader
                title="Droits d'exportation"
                subtitle="Gérez les droits d'exportation des données de votre application"
            />
            <HStack spacing={3} align="stretch" p={5}>
                <ExportCard
                    icon={<Download size={15} />}
                    title="Export des conversations"
                    subtitle="Format JSON · 1 client par fichier"
                    onClick={handleExportConversations}
                    isLoading={isExportingConversations}
                />
                <ExportCard
                    icon={<Download size={15} />}
                    title="Export des logs API"
                    subtitle="Format CSV · 90 derniers jours"
                    onClick={handleExportApiLogs}
                    isLoading={isExportingLogs}
                />
            </HStack>
        </Box>
    );
};
