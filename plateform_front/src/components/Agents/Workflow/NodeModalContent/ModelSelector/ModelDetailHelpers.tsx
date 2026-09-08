import React from "react";
import {
    Badge,
    Box,
    Flex,
    HStack,
    Skeleton,
    SimpleGrid,
    Stack,
    Text,
    VStack,
    useColorModeValue,
    useToken,
} from "@chakra-ui/react";
import {
    AudioLines,
    FileText,
    Gauge,
    Image as ImageIcon,
    LucideIcon,
    Paperclip,
    Timer,
    Type,
    Video,
    Zap,
} from "lucide-react";
import { ChartInfoTooltip } from "components/Agents/Analytics/ChartInfoTooltip";
import { MODEL_BADGE_CONFIG } from "./modelUtils";

const MODALITY_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
    text: { label: "Texte", icon: Type },
    image: { label: "Image", icon: ImageIcon },
    video: { label: "Vidéo", icon: Video },
    file: { label: "Fichier", icon: Paperclip },
    audio: { label: "Audio", icon: AudioLines },
    document: { label: "Document", icon: FileText },
};

const LATENCY_CONFIG: Record<string, { label: string; icon: LucideIcon; hue: string; tier: 1 | 2 | 3 }> = {
    Low: { label: "Rapide", icon: Zap, hue: "green", tier: 1 },
    Fast: { label: "Rapide", icon: Zap, hue: "green", tier: 1 },
    Medium: { label: "Moyenne", icon: Gauge, hue: "gold", tier: 2 },
    High: { label: "Lente", icon: Timer, hue: "red", tier: 3 },
    Slow: { label: "Lente", icon: Timer, hue: "red", tier: 3 },
};

export const StatBadge: React.FC<{ label: string; value: string; tooltip?: React.ReactNode }> = ({
    label,
    value,
    tooltip,
}) => {
    const bg = useColorModeValue("grey.50", "grey.850");
    const valueColor = useColorModeValue("grey.800", "grey.100");
    return (
        <Box bg={bg} borderRadius="8px" px={3} py={2} flex={1} minW="90px">
            <HStack spacing={1}>
                <Text variant="body-sm-muted">{label}</Text>
                {tooltip && <ChartInfoTooltip label={tooltip} />}
            </HStack>
            <Text fontSize="12px" fontWeight={700} color={valueColor} mt={0.5} noOfLines={1}>
                {value}
            </Text>
        </Box>
    );
};

export const ModelBadge: React.FC<{ badge: string }> = ({ badge }) => {
    const config = MODEL_BADGE_CONFIG[badge.toLowerCase()] ?? { label: badge, hue: "grey" };
    const bg = useColorModeValue(`${config.hue}.100`, `${config.hue}.700`);
    const color = useColorModeValue(`${config.hue}.700`, `${config.hue}.100`);
    const borderColor = useColorModeValue(`${config.hue}.200`, `${config.hue}.600`);

    return (
        <Badge
            bg={bg}
            color={color}
            border="1px solid"
            borderColor={borderColor}
            fontSize="9px"
            fontWeight={700}
            px={2}
            py={1}
            borderRadius="6px"
            textTransform="uppercase"
            letterSpacing="0.04em"
            flexShrink={0}
        >
            {config.label}
        </Badge>
    );
};

export const CapabilityBadge: React.FC<{ label: string }> = ({ label }) => {
    const bg = useColorModeValue("grey.50", "grey.850");
    const color = useColorModeValue("grey.600", "grey.200");
    const [iconColor] = useToken("colors", [color]);
    const config = MODALITY_CONFIG[label.toLowerCase()];
    const Icon = config?.icon;

    return (
        <Badge
            bg={bg}
            border="1px solid"
            borderColor="borderSubtle"
            fontSize="10px"
            fontWeight={600}
            px={2}
            py={1}
            borderRadius="6px"
        >
            <HStack spacing={1}>
                {Icon && <Icon size={10} color={iconColor} strokeWidth={2} />}
                <Text fontSize="12px" color={color} textTransform="capitalize">
                    {config?.label ?? label}
                </Text>
            </HStack>
        </Badge>
    );
};

export const LatencyIndicator: React.FC<{ label: string; latencyMs: number }> = ({ label, latencyMs }) => {
    const config = LATENCY_CONFIG[label] ?? { label, icon: Gauge, hue: "grey", tier: 2 as const };
    const Icon = config.icon;

    const iconBg = useColorModeValue(`${config.hue}.100`, `${config.hue}.700`);
    const iconColorToken = useColorModeValue(`${config.hue}.600`, `${config.hue}.100`);
    const [iconColor] = useToken("colors", [iconColorToken]);
    const trackBg = useColorModeValue("grey.100", "grey.800");
    const activeBg = useColorModeValue(`${config.hue}.400`, `${config.hue}.400`);

    const seconds = (latencyMs / 1000).toFixed(1);

    return (
        <HStack borderRadius="8px" p={3} spacing={3} align="center">
            <Flex boxSize="32px" borderRadius="8px" bg={iconBg} align="center" justify="center" flexShrink={0}>
                <Icon size={16} color={iconColor} strokeWidth={2} />
            </Flex>
            <VStack align="stretch" spacing={1.5} flex={1} minW={0}>
                <HStack justify="space-between">
                    <Text variant="body-sm-semibold">{config.label}</Text>
                    <Text variant="body-xs-muted">~{seconds}s / réponse</Text>
                </HStack>
                <HStack spacing={1}>
                    {([1, 2, 3] as const).map((tier) => (
                        <Box
                            key={tier}
                            h="4px"
                            flex={1}
                            borderRadius="2px"
                            bg={tier <= config.tier ? activeBg : trackBg}
                            transition="background-color 0.3s"
                        />
                    ))}
                </HStack>
            </VStack>
        </HStack>
    );
};

export const ScoreBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
    const trackBg = useColorModeValue("grey.100", "grey.800");
    const labelColor = useColorModeValue("grey.500", "grey.400");
    const pct = Math.min(100, Math.max(0, Math.round(value)));
    const barColor = color;

    if (value === null || isNaN(value)) {
        return (
            <VStack align="stretch" spacing={0.5}>
                <HStack justify="space-between">
                    <Text fontSize="10px" color={labelColor}>
                        {label}
                    </Text>
                    <Text fontSize="10px" color={labelColor} fontWeight={600}>
                        N/A
                    </Text>
                </HStack>
                <Box h="4px" bg={trackBg} borderRadius="2px">
                    <Box h="100%" w={`0%`} bg={barColor} borderRadius="2px" transition="width 0.3s" />
                </Box>
            </VStack>
        );
    }

    return (
        <VStack align="stretch" spacing={0.5}>
            <HStack justify="space-between">
                <Text fontSize="10px" color={labelColor}>
                    {label}
                </Text>
                <Text fontSize="10px" color={labelColor} fontWeight={600}>
                    {pct}/100
                </Text>
            </HStack>
            <Box h="4px" bg={trackBg} borderRadius="2px">
                <Box h="100%" w={`${pct}%`} bg={barColor} borderRadius="2px" transition="width 0.3s" />
            </Box>
        </VStack>
    );
};

export const ModelDetailPanelSkeleton: React.FC = () => {
    const dividerColor = useColorModeValue("grey.100", "grey.700");

    return (
        <VStack flex={1} align="stretch" overflowY="auto" bg="surfacePrimary">
            <Stack px={4} py={4} pb={2} spacing={3}>
                <HStack spacing={3} align="flex-start">
                    <Skeleton flexShrink={0} boxSize="36px" borderRadius="8px" />
                    <VStack align="stretch" spacing={1.5} flex={1}>
                        <Skeleton h="14px" w="60%" borderRadius="4px" />
                        <Skeleton h="10px" w="30%" borderRadius="4px" />
                    </VStack>
                </HStack>
                <VStack align="stretch" spacing={1.5}>
                    <Skeleton h="10px" w="95%" borderRadius="4px" />
                    <Skeleton h="10px" w="80%" borderRadius="4px" />
                </VStack>
            </Stack>

            <Box borderTopWidth="1px" borderTopStyle="solid" borderTopColor={dividerColor} />
            <Stack px={4} py={2} spacing={4}>
                <SimpleGrid columns={2} spacing={2}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} h="52px" borderRadius="8px" flex={1} minW="90px" />
                    ))}
                </SimpleGrid>

                <Skeleton h="120px" borderRadius="8px" />
                <Skeleton h="56px" borderRadius="8px" />

                <Skeleton h="32px" borderRadius="8px" mt="auto" />
            </Stack>
        </VStack>
    );
};
