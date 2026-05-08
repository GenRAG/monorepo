import {
    Box,
    HStack,
    Icon,
    Skeleton,
    Text,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    Activity,
    ArrowUpRight,
    Clock,
    FileUp,
    MessageSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RECENT_ACTIVITY, type ActivityEntry } from "pages/Dashboard/data";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";

const ICON_MAP: Record<ActivityEntry["iconName"], LucideIcon> = {
    message: MessageSquare,
    upload: FileUp,
    arrow: ArrowUpRight,
};
export const RecentActivityItem = ({ item }: { item: ActivityEntry }) => {
    const border = useColorModeValue("grey.100", "grey.800");
    const iconBg = useColorModeValue("grey.50", "grey.800");
    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");

    return (
        <HStack
            p={3}
            spacing={3}
            borderBottom="1px solid"
            borderColor={border}
            _last={{ borderBottom: "none" }}
        >
            <Box
                w="32px"
                h="32px"
                borderRadius="8px"
                bg={iconBg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
            >
                <Icon
                    as={ICON_MAP[item.iconName]}
                    boxSize={3.5}
                    color={textSecondary}
                />
            </Box>
            <VStack align="start" spacing={0} flex={1} minW={0}>
                <Text
                    fontSize="sm"
                    fontWeight="500"
                    color={textPrimary}
                    noOfLines={1}
                >
                    {item.title}
                </Text>
                <Text fontSize="xs" color={textSecondary}>
                    {item.subtitle}
                </Text>
            </VStack>
            <Text fontSize="xs" color={textSecondary} flexShrink={0}>
                {item.time}
            </Text>
        </HStack>
    );
};

interface RecentActivityCardProps {
    isEmpty?: boolean;
    isLoading?: boolean;
}

export const RecentActivityCard = ({
    isEmpty = false,
    isLoading = false,
}: RecentActivityCardProps) => {
    const cardBg = useColorModeValue("white", "grey.850");
    const border = useColorModeValue("grey.100", "grey.800");
    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");
    const skeletonStart = useColorModeValue("grey.100", "grey.800");
    const skeletonEnd = useColorModeValue("grey.200", "grey.700");
    const skeletonProps = { startColor: skeletonStart, endColor: skeletonEnd };

    if (isLoading) {
        return (
            <Box
                bg={cardBg}
                border="1px solid"
                borderColor={border}
                borderRadius="12px"
                display="flex"
                flexDirection="column"
            >
                <HStack
                    justify="space-between"
                    p={4}
                    borderBottom="1px solid"
                    borderColor={border}
                >
                    <HStack spacing={2}>
                        <Skeleton
                            {...skeletonProps}
                            h="14px"
                            w="14px"
                            borderRadius="3px"
                        />
                        <Skeleton
                            {...skeletonProps}
                            h="14px"
                            w="110px"
                            borderRadius="4px"
                        />
                    </HStack>
                </HStack>
                <VStack spacing={0} align="stretch">
                    {[...Array(3)].map((_, i) => (
                        <HStack
                            key={i}
                            p={3}
                            spacing={3}
                            borderBottom="1px solid"
                            borderColor={border}
                            _last={{ borderBottom: "none" }}
                        >
                            <Skeleton
                                {...skeletonProps}
                                w="32px"
                                h="32px"
                                borderRadius="8px"
                                flexShrink={0}
                            />
                            <VStack align="start" spacing={1} flex={1} minW={0}>
                                <Skeleton
                                    {...skeletonProps}
                                    h="14px"
                                    w="160px"
                                    borderRadius="4px"
                                />
                                <Skeleton
                                    {...skeletonProps}
                                    h="12px"
                                    w="100px"
                                    borderRadius="4px"
                                />
                            </VStack>
                            <Skeleton
                                {...skeletonProps}
                                h="12px"
                                w="40px"
                                borderRadius="4px"
                                flexShrink={0}
                            />
                        </HStack>
                    ))}
                </VStack>
            </Box>
        );
    }

    return (
        <Box
            bg={cardBg}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            display="flex"
            flexDirection="column"
        >
            <HStack
                justify="space-between"
                p={4}
                borderBottom="1px solid"
                borderColor={border}
            >
                <HStack spacing={2}>
                    <Icon as={Activity} boxSize={3.5} color={textSecondary} />
                    <Text fontSize="sm" fontWeight="600" color={textPrimary}>
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
                    {RECENT_ACTIVITY.map((item, i) => (
                        <RecentActivityItem key={i} item={item} />
                    ))}
                </VStack>
            )}
        </Box>
    );
};
