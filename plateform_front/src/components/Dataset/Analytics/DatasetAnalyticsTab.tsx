import { useState } from "react";
import { Grid, Text, VStack } from "@chakra-ui/react";
import colors from "themeNew/foundations/colors";
import { STATUS_COLORS } from "themeNew/foundations/themeConfig";
import { type Period, PERIOD_DAYS } from "components/Agents/Analytics/types";
import { useGetDatasetAnalyticsQuery } from "services/dataset/dataset";
import { DOCUMENT_SOURCE_LABELS, DOCUMENT_SOURCES } from "utils/dataset/documentSource";
import { DatasetAdditionsCard } from "./DatasetAdditionsCard";
import { DatasetPieCard } from "./DatasetPieCard";
import { DatasetStorageCard } from "./DatasetStorageCard";
import { useDatasetChartPalette } from "./datasetChartPalette";

interface DatasetAnalyticsTabProps {
    workspaceId: string;
    datasetId: string;
}

export const DatasetAnalyticsTab = ({ workspaceId, datasetId }: DatasetAnalyticsTabProps) => {
    const [period, setPeriod] = useState<Period>("30j");
    const palette = useDatasetChartPalette();
    const { data, isLoading, isFetching, isError } = useGetDatasetAnalyticsQuery({
        workspaceId,
        id: datasetId,
        days: PERIOD_DAYS[period],
    });

    if (isError) {
        return (
            <Text color="textError" pt={4}>
                Impossible de charger les statistiques de cette base.
            </Text>
        );
    }

    const sourceItems = DOCUMENT_SOURCES.map((source, index) => ({
        label: DOCUMENT_SOURCE_LABELS[source],
        value: data?.countBySource[source] ?? 0,
        color: palette[index],
    }));

    // Status colors are reserved for states, and always shown with their label.
    const statusItems = [
        { label: "Indexés", value: data?.statusCounts.INDEXED ?? 0, color: STATUS_COLORS.success },
        { label: "En cours", value: data?.statusCounts.PROCESSING ?? 0, color: STATUS_COLORS.warning },
        { label: "En attente", value: data?.statusCounts.UPLOADED ?? 0, color: colors.grey[400] },
        { label: "Échecs", value: data?.statusCounts.FAILED ?? 0, color: STATUS_COLORS.error },
    ];

    return (
        <VStack align="stretch" spacing={5} pt={4}>
            <Grid templateColumns={{ base: "1fr", xl: "3fr 2fr" }} gap={5} alignItems="stretch">
                <DatasetAdditionsCard
                    additions={data?.additions ?? []}
                    period={period}
                    onPeriodChange={setPeriod}
                    isFetching={isFetching}
                />
                <DatasetStorageCard analytics={data} isLoading={isLoading} />
            </Grid>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5} alignItems="stretch">
                <DatasetPieCard
                    title="Sources"
                    tooltip="Provenance des documents : import manuel ou outils connectés."
                    subtitle="D'où viennent les documents de la base"
                    centerLabel="Documents"
                    items={sourceItems}
                    isLoading={isLoading}
                />
                <DatasetPieCard
                    title="Statut d'indexation"
                    tooltip="Un document indexé peut être consulté par les agents. Les échecs peuvent être relancés depuis l'onglet Documents."
                    subtitle="Documents prêts à être consultés par vos agents"
                    centerLabel="Documents"
                    items={statusItems}
                    isLoading={isLoading}
                />
            </Grid>
        </VStack>
    );
};
