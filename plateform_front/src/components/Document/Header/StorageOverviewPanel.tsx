import React, { useMemo } from "react";
import { Box, HStack, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { DocumentStats } from "types/document/document";

const DEFAULT_QUOTA_BYTES = 100 * 1024 * 1024;

const SEGMENTS = [
    { key: "pdf", label: "PDF", fill: "#2ae48d" },
    { key: "text", label: "Text", fill: "#064fee" },
    { key: "markdown", label: "Markdown", fill: "#a9ec0e" },
    { key: "word", label: "Word", fill: "#f5a623" },
] as const;

function getTypeKey(mimeType: string): "pdf" | "text" | "markdown" | "word" | "other" {
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.includes("text")) return "text";
    if (mimeType.includes("markdown")) return "markdown";
    if (mimeType.includes("word")) return "word";
    return "other";
}

function fmt(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} Ko`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} Mo`;
    return `${(bytes / 1024 ** 3).toFixed(2)} Go`;
}

interface StorageOverviewPanelProps {
    stats: DocumentStats | null;
}

export const StorageOverviewPanel: React.FC<StorageOverviewPanelProps> = ({ stats }) => {
    const bg = useColorModeValue("white", "grey.950");
    const labelColor = useColorModeValue("grey.400", "grey.500");
    const textColor = useColorModeValue("grey.900", "white");
    const mutedColor = useColorModeValue("grey.500", "grey.400");
    const barTrack = useColorModeValue("grey.100", "grey.800");
    const borderColor = useColorModeValue("grey.100", "grey.800");

    const { byType, totalUsed, freeBytes, usedPct } = useMemo(() => {
        const sums: Record<string, number> = {
            pdf: 0,
            text: 0,
            markdown: 0,
            other: 0,
        };
        Object.entries(stats?.sizeByMimeType ?? {}).forEach(([mime, size]) => {
            const k = getTypeKey(mime);
            sums[k] = (sums[k] ?? 0) + size;
        });
        const totalUsed = Object.values(sums).reduce((a, b) => a + b, 0);
        const freeBytes = Math.max(DEFAULT_QUOTA_BYTES - totalUsed, 0);
        const usedPct = Math.min((totalUsed / DEFAULT_QUOTA_BYTES) * 100, 100);
        return { byType: sums, totalUsed, freeBytes, usedPct };
    }, [stats]);

    const pctColor = usedPct > 90 ? "red.400" : usedPct > 70 ? "orange.400" : "green.400";

    return (
        <Box
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
            borderTop="none"
            borderBottomRadius="12px"
            p={5}
            pt={3}
            display="flex"
            flexDirection="column"
            gap={3}
            minW={0}
        >
            <Stack spacing="2px">
                <Text
                    fontSize="28px"
                    fontWeight="700"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color={labelColor}
                >
                    Stockage
                </Text>
                <HStack align="flex-start">
                    <Box>
                        <HStack align="baseline" spacing={2}>
                            <Text fontSize="28px" fontWeight="700" color={textColor} lineHeight="1">
                                {fmt(totalUsed)}
                            </Text>
                            <Text fontSize="13px" fontWeight="600" color={pctColor}>
                                {usedPct.toFixed(1)}%
                            </Text>
                        </HStack>
                        <Text fontSize="11px" color={mutedColor} mt={0.5}>
                            / {fmt(DEFAULT_QUOTA_BYTES)} · {fmt(freeBytes)} libre
                        </Text>
                    </Box>
                </HStack>
            </Stack>

            <Box position="relative" h="8px" borderRadius="full" bg={barTrack} overflow="hidden">
                <HStack spacing={0} h="100%" position="absolute" inset={0}>
                    {SEGMENTS.map((seg) => {
                        const pct = (byType[seg.key] / DEFAULT_QUOTA_BYTES) * 100;
                        if (pct <= 0) return null;
                        return <Box key={seg.key} h="100%" w={`${pct}%`} bg={seg.fill} />;
                    })}
                </HStack>
            </Box>

            <HStack spacing={3} flexWrap="wrap">
                {SEGMENTS.filter((s) => byType[s.key] > 0).map((seg) => (
                    <HStack key={seg.key} spacing={1.5}>
                        <Box w="8px" h="8px" borderRadius="2px" bg={seg.fill} flexShrink={0} />
                        <Text fontSize="11px" color={mutedColor}>
                            {seg.label}
                        </Text>
                        <Text fontSize="11px" color={textColor} fontWeight="500">
                            {fmt(byType[seg.key])}
                        </Text>
                    </HStack>
                ))}
                {freeBytes > 0 && (
                    <HStack spacing={1.5}>
                        <Box w="8px" h="8px" borderRadius="2px" bg={barTrack} flexShrink={0} />
                        <Text fontSize="11px" color={mutedColor}>
                            Libre
                        </Text>
                        <Text fontSize="11px" color={textColor} fontWeight="500">
                            {fmt(freeBytes)}
                        </Text>
                    </HStack>
                )}
            </HStack>
        </Box>
    );
};
