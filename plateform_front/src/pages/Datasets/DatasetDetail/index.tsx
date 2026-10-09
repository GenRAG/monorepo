import { useEffect, useState } from "react";
import { Center, Skeleton, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { BarChart3, Bot, FileText, Plug } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DatasetAgentsTab } from "components/Dataset/Detail/DatasetAgentsTab";
import { DatasetAnalyticsTab } from "components/Dataset/Analytics/DatasetAnalyticsTab";
import { DatasetDetailHeader } from "components/Dataset/Detail/DatasetDetailHeader";
import { DatasetDocumentsTab } from "components/Dataset/Detail/DatasetDocumentsTab";
import { DatasetSourcesTab } from "components/Dataset/Detail/DatasetSourcesTab";
import Button from "components/ui/Button";
import { MainLayoutContainer } from "components/ui/MainLayoutContainer";
import { GlassTabBar } from "components/ui/GlassTabBar";
import { useDatasetActions } from "hooks/dataset/useDatasetActions";
import { useGetDatasetByIdQuery } from "services/dataset/dataset";
import { getDatasetHealth } from "utils/dataset/datasetStatus";

type DetailTab = "documents" | "sources" | "agents" | "analytics";

const TABS = [
    { value: "documents" as const, label: "Documents", icon: FileText },
    { value: "sources" as const, label: "Sources", icon: Plug },
    { value: "agents" as const, label: "Agents", icon: Bot },
    { value: "analytics" as const, label: "Analytics", icon: BarChart3 },
];

export const DatasetDetail = () => {
    const { workspaceId = "", datasetId = "" } = useParams<{
        workspaceId: string;
        datasetId: string;
    }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<DetailTab>("documents");
    const uploadModal = useDisclosure();
    const [pollingInterval, setPollingInterval] = useState(0);

    const {
        data: dataset,
        isLoading,
        isError,
        refetch,
    } = useGetDatasetByIdQuery({ workspaceId, id: datasetId }, { pollingInterval });
    const isIndexing = dataset ? getDatasetHealth(dataset) === "indexing" : false;

    // Refresh the counters while documents are being indexed.
    useEffect(() => setPollingInterval(isIndexing ? 5000 : 0), [isIndexing]);

    const { handleAction, openAgentsModal, modals } = useDatasetActions(workspaceId, {
        onDeleted: () => void navigate(`/workspaces/${workspaceId}/datasets`),
    });

    if (isLoading) {
        return (
            <MainLayoutContainer
                body={
                    <Stack spacing={4}>
                        <Skeleton h="90px" borderRadius="12px" />
                        <Skeleton h="320px" borderRadius="12px" />
                    </Stack>
                }
            />
        );
    }

    if (isError || !dataset) {
        return (
            <Center h="100vh" flexDirection="column" gap={3}>
                <Text color="textError">
                    Cette base de connaissances est introuvable ou n&apos;a pas pu être chargée.
                </Text>
                <Button size="sm" variant="secondary" onClick={() => void refetch()}>
                    Réessayer
                </Button>
            </Center>
        );
    }

    const handleImport = () => {
        setActiveTab("documents");
        uploadModal.onOpen();
    };

    return (
        <MainLayoutContainer
            header={<DatasetDetailHeader dataset={dataset} workspaceId={workspaceId} onAction={handleAction} />}
            body={
                <>
                    <GlassTabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} inline />
                    {activeTab === "documents" && (
                        <DatasetDocumentsTab
                            workspaceId={workspaceId}
                            datasetId={datasetId}
                            uploadModal={uploadModal}
                        />
                    )}
                    {activeTab === "sources" && <DatasetSourcesTab onImport={handleImport} />}
                    {activeTab === "agents" && (
                        <DatasetAgentsTab
                            dataset={dataset}
                            workspaceId={workspaceId}
                            onAddAgents={() => openAgentsModal(dataset)}
                        />
                    )}
                    {activeTab === "analytics" && (
                        <DatasetAnalyticsTab workspaceId={workspaceId} datasetId={datasetId} />
                    )}
                    {modals}
                </>
            }
        />
    );
};
