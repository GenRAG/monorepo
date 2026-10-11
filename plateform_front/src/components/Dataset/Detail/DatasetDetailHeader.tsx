import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { ArrowLeft, Library } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import BoxIcon from "components/ui/BoxIcon";
import { DatasetEntity } from "types/dataset/dataset";
import { formatRelativeDate } from "utils/date";
import { formatFileSize } from "utils/documentFormatters";
import { pluralize } from "utils/dataset/datasetStatus";
import { DatasetActionsMenu, DatasetAction } from "../DatasetActionsMenu";
import { DatasetHealthBadge } from "../DatasetHealthBadge";

interface DatasetDetailHeaderProps {
    dataset: DatasetEntity;
    workspaceId: string;
    onAction: (action: DatasetAction, dataset: DatasetEntity) => void;
}

const Stat = ({ label, value }: { label: string; value: string }) => (
    <VStack align="start" spacing={0}>
        <Text variant="caption-xs-muted">{label}</Text>
        <Text variant="body-sm-semibold">{value}</Text>
    </VStack>
);

export const DatasetDetailHeader = ({ dataset, workspaceId, onAction }: DatasetDetailHeaderProps) => (
    <VStack align="stretch" spacing={4}>
        <HStack
            as={RouterLink}
            to={`/workspaces/${workspaceId}/datasets`}
            spacing={1}
            color="textLabel"
            w="fit-content"
        >
            <Icon as={ArrowLeft} boxSize={3.5} />
            <Text variant="body-xs-muted">Toutes les bases</Text>
        </HStack>

        <HStack align="start" spacing={4}>
            <BoxIcon icon={Library} size="lg" />
            <VStack
                align="start"
                spacing={0.5}
                flex={1}
                minW={0}
                cursor="pointer"
                onClick={() => onAction("rename", dataset)}
                title="Modifier le nom et la description"
            >
                <HStack spacing={3}>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="textStrong" noOfLines={1}>
                        {dataset.name}
                    </Text>
                    <DatasetHealthBadge dataset={dataset} />
                </HStack>
                <Text
                    fontSize="sm"
                    color="textLabel"
                    noOfLines={1}
                    w="100%"
                    wordBreak="break-all"
                    title={dataset.description ?? undefined}
                >
                    {dataset.description || "Ajoutez une description pour aider votre équipe à s'y retrouver."}
                </Text>
            </VStack>
            <Box>
                <DatasetActionsMenu dataset={dataset} onAction={onAction} hideOpen />
            </Box>
        </HStack>

        <HStack spacing={8}>
            <Stat label="Documents" value={pluralize(dataset.documentsCount, "document")} />
            <Stat label="Taille" value={formatFileSize(dataset.totalSize)} />
            <Stat label="Agents" value={pluralize(dataset.agentsCount, "agent")} />
            <Stat label="Changements" value={formatRelativeDate(dataset.updatedAt)} />
        </HStack>
    </VStack>
);
