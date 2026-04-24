import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, HStack, Text, useColorModeValue } from "@chakra-ui/react";
import { Chart, registerables } from "chart.js";
import { DocumentStats } from "types/document/document";

Chart.register(...registerables);

const DEFAULT_QUOTA_GB = 5;

const TYPE_COLORS = {
    pdf: { dark: "rgba(52,211,169,0.92)", light: "rgba(4,120,87,0.9)" },
    word: { dark: "rgba(16,185,129,0.8)", light: "rgba(5,150,105,0.78)" },
    markdown: {
        dark: "rgba(52,211,153,0.62)",
        light: "rgba(16,185,129,0.68)",
    },
    other: { dark: "rgba(6,95,70,0.5)", light: "rgba(110,231,183,0.55)" },
    free: { dark: "rgba(16,185,129,0.12)", light: "rgba(16,185,129,0.1)" },
};

function getTypeKey(mimeType: string): keyof typeof TYPE_COLORS {
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.includes("word") || mimeType.includes("document")) return "word";
    if (mimeType.includes("markdown") || mimeType.includes("text")) return "markdown";
    return "other";
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

interface StorageBarProps {
    byType: Record<string, number>;
    freeBytes: number;
    quotaBytes: number;
    isDark: boolean;
}

const StorageBar: React.FC<StorageBarProps> = ({
    byType,
    freeBytes,
    quotaBytes,
    isDark,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        chartRef.current?.destroy();

        const segments = [
            {
                label: "PDF",
                value: byType.pdf,
                color: isDark ? TYPE_COLORS.pdf.dark : TYPE_COLORS.pdf.light,
            },
            {
                label: "Word",
                value: byType.word,
                color: isDark ? TYPE_COLORS.word.dark : TYPE_COLORS.word.light,
            },
            {
                label: "Markdown",
                value: byType.markdown,
                color: isDark
                    ? TYPE_COLORS.markdown.dark
                    : TYPE_COLORS.markdown.light,
            },
            {
                label: "Other",
                value: byType.other,
                color: isDark
                    ? TYPE_COLORS.other.dark
                    : TYPE_COLORS.other.light,
            },
            {
                label: "Free",
                value: freeBytes,
                color: isDark ? TYPE_COLORS.free.dark : TYPE_COLORS.free.light,
            },
        ];

        chartRef.current = new Chart(canvasRef.current, {
            type: "bar",
            data: {
                labels: ["Storage"],
                datasets: segments.map((seg, i) => ({
                    label: seg.label,
                    data: [seg.value],
                    backgroundColor: seg.color,
                    borderRadius:
                        i === 0
                            ? { topLeft: 6, bottomLeft: 6 }
                            : i === segments.length - 1
                              ? { topRight: 6, bottomRight: 6 }
                              : 0,
                    borderSkipped: false,
                    barPercentage: 1,
                    categoryPercentage: 1,
                })),
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                },
                scales: {
                    x: {
                        stacked: true,
                        max: quotaBytes,
                        display: false,
                        grid: { display: false },
                        border: { display: false },
                    },
                    y: {
                        stacked: true,
                        display: false,
                        grid: { display: false },
                        border: { display: false },
                    },
                },
                layout: { padding: 0 },
            },
        });

        return () => chartRef.current?.destroy();
    }, [byType, freeBytes, quotaBytes, isDark]);

    return (
        <Box position="relative" w="100%" h="100%" overflow="hidden">
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                }}
            />
        </Box>
    );
};

interface StorageOverviewPanelProps {
    stats: DocumentStats | null;
}

export const StorageOverviewPanel: React.FC<StorageOverviewPanelProps> = ({
    stats,
}) => {
    const [quotaVal] = useState<number>(DEFAULT_QUOTA_GB);
    const [inputVal] = useState<string>(String(DEFAULT_QUOTA_GB));
    const [unit] = useState<"GB" | "MB">("GB");
    const isDark = useColorModeValue(false, true);

    const quotaBytes = useMemo(
        () => (unit === "GB" ? quotaVal * 1024 ** 3 : quotaVal * 1024 ** 2),
        [quotaVal, unit],
    );

    const { byType, totalUsed, freeBytes, usedPct } = useMemo(() => {
        const sums: Record<string, number> = { pdf: 0, word: 0, markdown: 0, other: 0 };
        Object.entries(stats?.sizeByMimeType ?? {}).forEach(([mime, size]) => {
            sums[getTypeKey(mime)] = (sums[getTypeKey(mime)] ?? 0) + size;
        });
        const totalUsed = Object.values(sums).reduce((a, b) => a + b, 0);
        const freeBytes = Math.max(quotaBytes - totalUsed, 0);
        const usedPct = Math.min((totalUsed / quotaBytes) * 100, 100);
        return { byType: sums, totalUsed, freeBytes, usedPct };
    }, [stats, quotaBytes]);

    const legendItems = [
        {
            label: "PDF",
            bytes: byType.pdf,
            color: isDark ? TYPE_COLORS.pdf.dark : TYPE_COLORS.pdf.light,
        },
        {
            label: "Word",
            bytes: byType.word,
            color: isDark ? TYPE_COLORS.word.dark : TYPE_COLORS.word.light,
        },
        {
            label: "Markdown",
            bytes: byType.markdown,
            color: isDark
                ? TYPE_COLORS.markdown.dark
                : TYPE_COLORS.markdown.light,
        },
        {
            label: "Other",
            bytes: byType.other,
            color: isDark ? TYPE_COLORS.other.dark : TYPE_COLORS.other.light,
        },
    ].filter((item) => item.bytes > 0);

    const textPrimary = useColorModeValue("grey.900", "white");
    const textSecondary = useColorModeValue("grey.500", "grey.400");
    const textMuted = useColorModeValue("grey.400", "grey.300");
    const dividerColor = useColorModeValue("grey.100", "grey.700");

    const pctColor =
        usedPct > 90 ? "red.400" : usedPct > 70 ? "orange.400" : "green.400";

    return (
        <Box display="flex" flexDirection="column" h="100%" gap={3}>
            <HStack justify="space-between" align="flex-start" flexShrink={0}>
                <Box>
                    <HStack align="baseline" spacing={2}>
                        <Text
                            fontSize="2xl"
                            fontWeight="600"
                            color={textPrimary}
                            lineHeight="1"
                        >
                            {formatBytes(totalUsed)}
                        </Text>
                        <Text fontSize="sm" color={pctColor} fontWeight="500">
                            {usedPct.toFixed(1)}%
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={textSecondary} mt={0.5}>
                        {stats?.total ?? 0} doc
                        {(stats?.total ?? 0) !== 1 ? "s" : ""}
                        {" · "}
                        {formatBytes(freeBytes)} free
                    </Text>
                </Box>

                <HStack spacing={1} align="center">
                    <Text fontSize="11px" color={textMuted} flexShrink={0}>
                        Quota:
                    </Text>
                    <Text>5 GB</Text>
                </HStack>
            </HStack>

            <Box h="28px" flexShrink={0} position="relative">
                <StorageBar
                    byType={byType}
                    freeBytes={freeBytes}
                    quotaBytes={quotaBytes}
                    isDark={isDark}
                />
            </Box>

            <HStack justify="space-between" mt={-2} flexShrink={0}>
                <Text fontSize="10px" color={textMuted}>0</Text>
                <Text fontSize="10px" color={textMuted}>
                    {inputVal} {unit}
                </Text>
            </HStack>

            <Box
                display="flex"
                flexWrap="wrap"
                gap="8px 16px"
                pt={2}
                borderTop="0.5px solid"
                borderColor={dividerColor}
                flexShrink={0}
            >
                {legendItems.map((item) => (
                    <HStack key={item.label} spacing={1.5}>
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="2px"
                            bg={item.color}
                            flexShrink={0}
                        />
                        <Text fontSize="11px" color={textSecondary}>
                            {item.label}
                        </Text>
                        <Text fontSize="11px" color={textMuted}>
                            {formatBytes(item.bytes)}
                        </Text>
                    </HStack>
                ))}
            </Box>
        </Box>
    );
};
