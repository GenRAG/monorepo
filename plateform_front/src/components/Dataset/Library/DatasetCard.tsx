import { Box, Card, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { Clock, FileText, Library, Upload } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";
import { DatasetEntity } from "types/dataset/dataset";
import { formatRelativeDate } from "utils/date";
import { pluralize } from "utils/dataset/datasetStatus";
import { AgentAvatarStack } from "../AgentAvatarStack";
import { DatasetActionsMenu, DatasetAction } from "../DatasetActionsMenu";
import { DatasetHealthBadge } from "../DatasetHealthBadge";

interface DatasetCardProps {
    dataset: DatasetEntity;
    onAction: (action: DatasetAction, dataset: DatasetEntity) => void;
}

export const DatasetCard = ({ dataset, onAction }: DatasetCardProps) => (
    <Card
        size="none"
        bg="surfaceCard"
        p={4}
        cursor="pointer"
        onClick={() => onAction("open", dataset)}
        _hover={{ bg: "surfaceHover" }}
        transition="background 0.15s"
        h="100%"
    >
        <VStack align="stretch" spacing={3} h="100%">
            <HStack align="start" spacing={3}>
                <BoxIcon icon={Library} />
                <VStack align="start" spacing={0.5} flex={1} minW={0}>
                    <Text variant="body-sm-semibold" color="textStrong" noOfLines={1}>
                        {dataset.name}
                    </Text>
                    <Text
                        variant="body-xs-muted"
                        noOfLines={1}
                        w="100%"
                        wordBreak="break-all"
                        title={dataset.description ?? undefined}
                    >
                        {dataset.description || "Aucune description."}
                    </Text>
                </VStack>
                <Box onClick={(e) => e.stopPropagation()}>
                    <DatasetActionsMenu dataset={dataset} onAction={onAction} />
                </Box>
            </HStack>

            <HStack>
                <HStack
                    spacing={1}
                    px={2}
                    py={0.5}
                    borderRadius="6px"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor="borderDefault"
                >
                    <Icon as={Upload} boxSize={3} color="textLabel" />
                    <Text variant="caption-xs-muted">Import manuel · {dataset.documentsCount}</Text>
                </HStack>
            </HStack>

            <Box flex={1} />

            <HStack justify="space-between">
                <HStack spacing={3}>
                    <DatasetHealthBadge dataset={dataset} />
                    <HStack spacing={1}>
                        <Icon as={FileText} boxSize={3} color="textLabel" />
                        <Text variant="caption-xs-muted">{pluralize(dataset.documentsCount, "doc")}</Text>
                    </HStack>
                    <HStack spacing={1}>
                        <Icon as={Clock} boxSize={3} color="textLabel" />
                        <Text variant="caption-xs-muted">{formatRelativeDate(dataset.updatedAt)}</Text>
                    </HStack>
                </HStack>
                <AgentAvatarStack agents={dataset.agents} />
            </HStack>
        </VStack>
    </Card>
);
