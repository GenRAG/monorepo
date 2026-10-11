import { useMemo, useState } from "react";
import { Box, HStack, Icon, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { ArrowDown, ArrowUp, Library } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";
import { grayScrollbar } from "themeNew/scrollbar";
import { DatasetEntity } from "types/dataset/dataset";
import { formatRelativeDate } from "utils/date";
import { formatFileSize } from "utils/documentFormatters";
import { pluralize } from "utils/dataset/datasetStatus";
import { AgentAvatarStack } from "../AgentAvatarStack";
import { DatasetActionsMenu, DatasetAction } from "../DatasetActionsMenu";
import { DatasetHealthBadge } from "../DatasetHealthBadge";
import { DatasetSort, DatasetSortKey, sortDatasets } from "./datasetSort";
import { DatasetActivitySparkline } from "./DatasetActivitySparkline";

const COLUMNS: { key: DatasetSortKey; label: string }[] = [
    { key: "name", label: "Nom" },
    { key: "description", label: "Description" },
    { key: "documents", label: "Documents" },
    { key: "activity", label: "Activité" },
    { key: "agents", label: "Agents" },
    { key: "updatedAt", label: "Changements" },
    { key: "status", label: "Statut" },
];

interface DatasetTableProps {
    datasets: DatasetEntity[];
    onAction: (action: DatasetAction, dataset: DatasetEntity) => void;
}

export const DatasetTable = ({ datasets, onAction }: DatasetTableProps) => {
    const [sort, setSort] = useState<DatasetSort>({
        key: "updatedAt",
        direction: "desc",
    });
    const sorted = useMemo(() => sortDatasets(datasets, sort), [datasets, sort]);

    const toggleSort = (key: DatasetSortKey) =>
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));

    return (
        <Box
            borderWidth="1px"
            borderStyle="solid"
            borderColor="borderDefault"
            borderRadius="12px"
            overflow="auto"
            sx={grayScrollbar}
        >
            <Table variant="simple" size="sm" minW="760px">
                <Thead bg="surfacePrimary">
                    <Tr>
                        {COLUMNS.map((column) => (
                            <Th
                                key={column.key}
                                cursor="pointer"
                                userSelect="none"
                                onClick={() => toggleSort(column.key)}
                            >
                                <HStack spacing={1}>
                                    <span>{column.label}</span>
                                    {sort.key === column.key && (
                                        <Icon as={sort.direction === "asc" ? ArrowUp : ArrowDown} boxSize={3} />
                                    )}
                                </HStack>
                            </Th>
                        ))}
                        <Th w="1px" />
                    </Tr>
                </Thead>
                <Tbody bg="tableBg">
                    {sorted.map((dataset) => (
                        <Tr
                            key={dataset.id}
                            cursor="pointer"
                            _hover={{ bg: "surfaceSubtle" }}
                            onClick={() => onAction("open", dataset)}
                        >
                            <Td minW="200px" maxW="280px">
                                <HStack spacing={3}>
                                    <BoxIcon icon={Library} size="sm" />
                                    <Text variant="body-sm-semibold" color="textStrong" noOfLines={1}>
                                        {dataset.name}
                                    </Text>
                                </HStack>
                            </Td>
                            <Td>
                                <Text
                                    variant="body-xs-muted"
                                    w="200px"
                                    noOfLines={1}
                                    wordBreak="break-all"
                                    title={dataset.description ?? undefined}
                                >
                                    {dataset.description || "—"}
                                </Text>
                            </Td>
                            <Td>
                                <VStack align="start" spacing={0}>
                                    <Text variant="body-xs">{pluralize(dataset.documentsCount, "doc")}</Text>
                                    <Text variant="caption-xs-muted">{formatFileSize(dataset.totalSize)}</Text>
                                </VStack>
                            </Td>
                            <Td>
                                {dataset.activity ? (
                                    <DatasetActivitySparkline activity={dataset.activity} />
                                ) : (
                                    <Text variant="body-xs-muted">—</Text>
                                )}
                            </Td>
                            <Td>
                                <AgentAvatarStack agents={dataset.agents} />
                            </Td>
                            <Td>
                                <Text variant="body-xs-muted">{formatRelativeDate(dataset.updatedAt)}</Text>
                            </Td>
                            <Td>
                                <DatasetHealthBadge dataset={dataset} />
                            </Td>
                            <Td onClick={(e) => e.stopPropagation()}>
                                <DatasetActionsMenu dataset={dataset} onAction={onAction} />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};
