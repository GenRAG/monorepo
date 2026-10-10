import { Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { ExternalLink, Library } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";
import { GlassPanel } from "components/ui/GlassPanel";
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
        <GlassPanel
            px={4}
            py={3}
            transition="border-color 0.15s"
            _hover={{ borderColor: "borderStrong" }}
            opacity={isExcluded ? 0.75 : 1}
        >
            <Flex align="center" gap={3} wrap={{ base: "wrap", md: "nowrap" }}>
                <HStack spacing={3} flex="1 1 220px" minW={0}>
                    <BoxIcon icon={Library} size="md" />
                    <VStack align="start" spacing={0.5} minW={0} flex={1}>
                        <HStack spacing={2} minW={0}>
                            <Text variant="body-sm-semibold" noOfLines={1}>
                                {dataset.name}
                            </Text>
                            <DatasetHealthBadge dataset={dataset} />
                        </HStack>
                        <Text variant="caption-xs-muted" noOfLines={2}>
                            {pluralize(dataset.documentsCount, "document")} · {formatFileSize(dataset.totalSize)}
                            {isExcluded && " · non utilisée par le workflow actuel"}
                        </Text>
                    </VStack>
                </HStack>
                <HStack spacing={2} flexShrink={0} ml={{ base: "auto", md: 0 }}>
                    <Button
                        onClick={() => void navigate(`/workspaces/${workspaceId}/datasets/${dataset.id}`)}
                        size="xs"
                        variant="ghost"
                        rightIcon={ExternalLink}
                    >
                        Gérer
                    </Button>
                    <Button size="xs" variant={action.variant} onClick={action.onClick} isLoading={action.isLoading}>
                        {action.label}
                    </Button>
                </HStack>
            </Flex>
        </GlassPanel>
    );
};
