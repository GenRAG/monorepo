import { HStack, Text, VStack } from "@chakra-ui/react";
import { ExternalLink, Library } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";
import { DatasetHealthBadge } from "components/Dataset/DatasetHealthBadge";
import { DatasetEntity } from "types/dataset/dataset";
import { formatFileSize } from "utils/documentFormatters";
import { pluralize } from "utils/dataset/datasetStatus";

interface AgentDatasetRowProps {
    dataset: DatasetEntity;
    workspaceId: string;
    action: {
        label: string;
        onClick: () => void;
        isLoading?: boolean;
        variant: "ghost" | "secondary";
    };
    isExcluded?: boolean;
}

export const AgentDatasetRow = ({ dataset, workspaceId, action, isExcluded }: AgentDatasetRowProps) => {
    const navigate = useNavigate();

    return (
        <HStack
            px={4}
            py={3}
            bg="surfaceCard"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="borderDefault"
            borderRadius="12px"
            spacing={3}
        >
            <BoxIcon icon={Library} size="sm" />
            <VStack align="start" spacing={0} flex={1} minW={0}>
                <HStack spacing={2}>
                    <Text variant="body-sm-semibold" noOfLines={1}>
                        {dataset.name}
                    </Text>
                    <DatasetHealthBadge dataset={dataset} />
                </HStack>
                <Text variant="caption-xs-muted">
                    {pluralize(dataset.documentsCount, "document")} · {formatFileSize(dataset.totalSize)}
                    {isExcluded && " · non utilisée par le workflow actuel"}
                </Text>
            </VStack>
            <Button
                onClick={() => void navigate(`/workspaces/${workspaceId}/datasets/${dataset.id}`)}
                size="xs"
                variant="ghost"
                rightIcon={ExternalLink}
            >
                Gérer dans Bases
            </Button>
            <Button size="xs" variant={action.variant} onClick={action.onClick} isLoading={action.isLoading}>
                {action.label}
            </Button>
        </HStack>
    );
};
