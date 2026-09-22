import { Badge, Box, Card, HStack, Skeleton, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, Clock, FileUp, MessageSquare, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import { WorkspaceStatsActivity } from "types/workspace";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";

type BadgeColorScheme = "blue" | "orange" | "green" | "grey";

interface ActivityAccent {
    icon: LucideIcon;
    label: string;
    badgeScheme: BadgeColorScheme;
    bar: string;
    hex: string;
}

const ACTIVITY_ACCENTS: Record<string, ActivityAccent> = {
    conversation: { icon: MessageSquare, label: "Conversation", badgeScheme: "blue", bar: "blue.400", hex: "#4A9FD8" },
    document_upload: { icon: FileUp, label: "Document", badgeScheme: "orange", bar: "orange.400", hex: "#FF9460" },
    deployment: { icon: ArrowUpRight, label: "Déploiement", badgeScheme: "green", bar: "green.400", hex: "#12B98C" },
};

const DEFAULT_ACCENT: ActivityAccent = {
    icon: MessageSquare,
    label: "Activité",
    badgeScheme: "grey",
    bar: "grey.400",
    hex: "#6D747E",
};

const hexToRgba = (hex: string, alpha: number) => {
    const value = hex.replace("#", "");
    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
    const accent = ACTIVITY_ACCENTS[item.type] ?? DEFAULT_ACCENT;
    const tintOpacity = useColorModeValue(0.05, 0.12);
    const tint = hexToRgba(accent.hex, tintOpacity);
    const iconColor = useColorModeValue("black", "white");

    return (
        <Box
            position="relative"
            borderRadius="10px"
            overflow="hidden"
            bg="surfaceHover"
            _hover={{ bg: "surfaceSubtle" }}
            transition="background 0.15s"
            minW={0}
        >
            <Box position="absolute" inset={0} bgGradient={`linear(to-r, ${tint}, transparent 65%)`} />
            <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={accent.bar} />
            <VStack align="stretch" spacing={0.5} position="relative" pl={3} pr={2.5} py={2}>
                <HStack spacing={2} justify="space-between" align="center" minW={0}>
                    <HStack spacing={1.5} minW={0} flex={1} justify="start" align="center">
                        <BoxIcon size="sm" icon={accent.icon} bg="transparent" color={iconColor} />
                        <Text variant="body-sm-semibold" isTruncated minW={0}>
                            {item.title}
                        </Text>
                        <Badge size="2xs" colorScheme={accent.badgeScheme} flexShrink={0}>
                            {accent.label}
                        </Badge>
                    </HStack>
                    <Text variant="caption-xs-muted" flexShrink={0} whiteSpace="nowrap">
                        {formatRelativeTime(item.createdAt)}
                    </Text>
                </HStack>
                <Text variant="body-xs-muted" isTruncated>
                    {item.subtitle}
                </Text>
            </VStack>
        </Box>
    );
};

const PAGE_SIZE = 5;

interface RecentActivityCardProps {
    items?: WorkspaceStatsActivity[];
    isEmpty?: boolean;
    isLoading?: boolean;
}

export const RecentActivityCard = ({ items = [], isEmpty = false, isLoading = false }: RecentActivityCardProps) => {
    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const page = Math.min(currentPage, totalPages);
    const paginatedItems = useMemo(() => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [items, page]);

    if (isLoading) {
        return (
            <Card size="none" display="flex" flexDirection="column" h="100%">
                <VStack spacing={2} align="stretch" h="100%" p={3}>
                    {[...Array(3)].map((_, i) => (
                        <HStack key={i} spacing={3} p={2} borderRadius="10px" bg="surfaceHover">
                            <Skeleton {...skeletonProps} w="28px" h="28px" borderRadius="8px" flexShrink={0} />
                            <VStack align="start" spacing={1} flex={1} minW={0}>
                                <Skeleton {...skeletonProps} h="14px" w="160px" borderRadius="4px" />
                                <Skeleton {...skeletonProps} h="12px" w="100px" borderRadius="4px" />
                            </VStack>
                            <Skeleton {...skeletonProps} h="12px" w="40px" borderRadius="4px" flexShrink={0} />
                        </HStack>
                    ))}
                </VStack>
            </Card>
        );
    }

    return (
        <Card
            size="none"
            bg="transparent"
            border="none"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            h="100%"
        >
            {isEmpty ? (
                <CardEmptyState
                    icon={Clock}
                    title="Aucune activité récente"
                    description="Les événements de votre workspace apparaîtront ici."
                />
            ) : (
                <>
                    <VStack spacing={1} align="stretch" flex={1} minH={0} overflowY="auto">
                        {paginatedItems.map((item, i) => (
                            <RecentActivityItem key={i} item={item} />
                        ))}
                    </VStack>
                    {totalPages > 1 && (
                        <HStack justify="end" spacing={2} py={2} flexShrink={0}>
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setCurrentPage((p) => p - 1)}
                                isDisabled={page === 1}
                            >
                                <ChevronLeft size={14} />
                            </Button>
                            <Text variant="caption-xs-muted">
                                {page} / {totalPages}
                            </Text>
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setCurrentPage((p) => p + 1)}
                                isDisabled={page === totalPages}
                            >
                                <ChevronRight size={14} />
                            </Button>
                        </HStack>
                    )}
                </>
            )}
        </Card>
    );
};
