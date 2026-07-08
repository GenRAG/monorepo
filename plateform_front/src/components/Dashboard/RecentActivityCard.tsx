import { Box, HStack, Icon, Skeleton, Text, VStack } from "@chakra-ui/react";
import { Activity, Clock, FileUp, MessageSquare, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import { WorkspaceStatsActivity } from "types/workspace";
import RowContainer from "components/ui/RowContainer";
import BoxIcon from "components/ui/BoxIcon";

const ICON_MAP: Record<string, LucideIcon> = {
    conversation: MessageSquare,
    document_upload: FileUp,
    deployment: ArrowUpRight,
};

const formatRelativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days} j`;
};

export const RecentActivityItem = ({ item }: { item: WorkspaceStatsActivity }) => {
    const IconComponent = ICON_MAP[item.type] ?? MessageSquare;

    return (
        <RowContainer p="10.75px" overflow="hidden" minW={0} w="100%">
            <BoxIcon size="sm" icon={IconComponent} />
            <VStack align="start" spacing={0} flex={1} minW={0} overflow="hidden">
                <Text variant="body-sm" isTruncated w="100%">
                    {item.title}
                </Text>
                <Text variant="caption-xs" color="textLabel" isTruncated w="100%">
                    {item.subtitle}
                </Text>
            </VStack>
            <Text variant="body-xs" color="textLabel" flexShrink={0} whiteSpace="nowrap">
                {formatRelativeTime(item.createdAt)}
            </Text>
        </RowContainer>
    );
};

interface RecentActivityCardProps {
    items?: WorkspaceStatsActivity[];
    isEmpty?: boolean;
    isLoading?: boolean;
}

export const RecentActivityCard = ({ items = [], isEmpty = false, isLoading = false }: RecentActivityCardProps) => {
    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };

    if (isLoading) {
        return (
            <Box
                bg="surfaceCard"
                border="1px solid"
                borderColor="borderDefault"
                borderRadius="12px"
                display="flex"
                flexDirection="column"
            >
                <HStack justify="space-between" p={4} borderBottom="1px solid" borderColor="borderDefault">
                    <HStack spacing={2}>
                        <Skeleton {...skeletonProps} h="14px" w="14px" borderRadius="3px" />
                        <Skeleton {...skeletonProps} h="14px" w="110px" borderRadius="4px" />
                    </HStack>
                </HStack>
                <VStack spacing={0} align="stretch">
                    {[...Array(3)].map((_, i) => (
                        <RowContainer key={i}>
                            <Skeleton {...skeletonProps} w="32px" h="32px" borderRadius="8px" flexShrink={0} />
                            <VStack align="start" spacing={1} flex={1} minW={0}>
                                <Skeleton {...skeletonProps} h="14px" w="160px" borderRadius="4px" />
                                <Skeleton {...skeletonProps} h="12px" w="100px" borderRadius="4px" />
                            </VStack>
                            <Skeleton {...skeletonProps} h="12px" w="40px" borderRadius="4px" flexShrink={0} />
                        </RowContainer>
                    ))}
                </VStack>
            </Box>
        );
    }

    return (
        <Box
            bg="surfaceCard"
            border="1px solid"
            borderColor="borderDefault"
            borderRadius="12px"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            h="100%"
        >
            <HStack justify="space-between" p={4} borderBottom="1px solid" borderColor="borderDefault">
                <HStack spacing={2}>
                    <Icon as={Activity} boxSize={3.5} color="textLabel" />
                    <Text fontSize="sm" fontWeight="600" color="textPrimary">
                        Activité récente
                    </Text>
                </HStack>
            </HStack>
            {isEmpty ? (
                <CardEmptyState
                    icon={Clock}
                    title="Aucune activité récente"
                    description="Les événements de votre workspace apparaîtront ici."
                />
            ) : (
                <VStack spacing={0} align="stretch">
                    {items.map((item, i) => (
                        <RecentActivityItem key={i} item={item} />
                    ))}
                </VStack>
            )}
        </Box>
    );
};
