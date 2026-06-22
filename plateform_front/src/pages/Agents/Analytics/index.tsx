import React, { useState, useRef, useEffect } from "react";
import {
    VStack,
    HStack,
    Box,
    Text,
    Grid,
    Card,
    CardBody,
    Select,
    Button,
    ButtonGroup,
    useColorMode,
    Icon,
    Flex,
    Badge,
    useToken,
    Tooltip as ChakraTooltip,
    useColorModeValue,
    Divider,
    Avatar,
    Collapse,
    IconButton,
} from "@chakra-ui/react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    BarElement,
    ChartOptions,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import WorkspaceHeader from "components/ui/WorkspaceHeader";
import { ChevronDownIcon, ChevronUpIcon, ClockIcon } from "lucide-react";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    BarElement,
    Legend,
);

// Icon components
const TrendingUpIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path
            fill="currentColor"
            d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
        />
    </Icon>
);

const DollarIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path
            fill="currentColor"
            d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
        />
    </Icon>
);

const MessageIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path
            fill="currentColor"
            d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
        />
    </Icon>
);

const generateVolumeData = () => {
    const data = [];
    const startDate = new Date("2025-01-01");

    for (let i = 0; i < 120; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const baseQueries = isWeekend ? 120 : 200;
        const variance = Math.random() * 100 - 50;
        const queries = Math.max(50, Math.floor(baseQueries + variance));

        data.push({
            date: `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`,
            fullDate: date,
            queries,
            benchmark: 180,
        });
    }

    return data;
};

const allVolumeData = generateVolumeData();

const mockVolumeData = [
    { date: "01/02", queries: 145, benchmark: 160 },
    { date: "02/02", queries: 178, benchmark: 165 },
    { date: "03/02", queries: 156, benchmark: 170 },
    { date: "04/02", queries: 203, benchmark: 175 },
    { date: "05/02", queries: 189, benchmark: 180 },
    { date: "06/02", queries: 234, benchmark: 185 },
    { date: "07/02", queries: 267, benchmark: 190 },
    { date: "08/02", queries: 245, benchmark: 195 },
    { date: "09/02", queries: 298, benchmark: 200 },
];

const mockLatencyData = [
    { date: "01/02", p50: 245, p95: 567, benchmark: 250 },
    { date: "02/02", p50: 234, p95: 543, benchmark: 250 },
    { date: "03/02", p50: 267, p95: 612, benchmark: 250 },
    { date: "04/02", p50: 223, p95: 534, benchmark: 250 },
    { date: "05/02", p50: 212, p95: 498, benchmark: 250 },
    { date: "06/02", p50: 198, p95: 467, benchmark: 250 },
    { date: "07/02", p50: 189, p95: 445, benchmark: 250 },
    { date: "08/02", p50: 201, p95: 478, benchmark: 250 },
    { date: "09/02", p50: 195, p95: 456, benchmark: 250 },
];

const mockCostData = [
    { label: "Embeddings", data: 4.5, color: "#8B5CF6" },
    { label: "LLM Gen", data: 23.4, color: "#3B82F6" },
    { label: "Reranking", data: 2.2, color: "#10B981" },
    { label: "Other", data: 1.3, color: "#F59E0B" },
];

const mockActivityLog = [
    {
        id: 1,
        user: { name: "Anna Truong", avatar: "AT" },
        query: "What are the key findings from the Q4 sales report?",
        response:
            "Based on the Q4 sales report, the key findings include: Revenue increased by 23% compared to Q3, driven primarily by enterprise customers. The EMEA region showed the strongest growth at 45%...",
        timestamp: "10:03 AM, 12 Aug, 23",
        responseTime: "2.3s",
        sources: ["Q4_Sales_Report.pdf", "Regional_Performance.xlsx"],
        cost: "$0.12",
    },
    {
        id: 2,
        user: { name: "John Smith", avatar: "JS" },
        query: "How do we calculate customer lifetime value?",
        response:
            "Customer Lifetime Value (CLV) is calculated using the formula: CLV = (Average Purchase Value × Purchase Frequency × Customer Lifespan). In our case, we use a modified approach that accounts for...",
        timestamp: "9:43 PM, 14 Aug, 23",
        responseTime: "1.8s",
        sources: ["Finance_Metrics.pdf", "CLV_Guidelines.docx"],
        cost: "$0.08",
    },
    {
        id: 3,
        user: { name: "Sarah Lee", avatar: "SL" },
        query: "What is the current status of the product roadmap?",
        response:
            "The current product roadmap for Q1 2024 includes three major initiatives: 1) API v3 launch scheduled for January 15th, 2) Mobile app redesign in beta testing, 3) Enterprise dashboard enhancements...",
        timestamp: "2:13 PM, 15 Aug, 23",
        responseTime: "3.1s",
        sources: ["Product_Roadmap_2024.pdf", "Sprint_Planning.md"],
        cost: "$0.15",
    },
];

const createGradient = (
    ctx: CanvasRenderingContext2D,
    chartArea: any,
    color: string,
    opacity: number = 0.5,
) => {
    const { top, bottom } = chartArea;

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const gradient = ctx.createLinearGradient(0, top, 0, bottom);

    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);

    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    return gradient;
};

const CustomTooltip = (
    context: any,
    isDark: boolean,
    type: "volume" | "latency" | "cost",
) => {
    let tooltipEl = document.getElementById("chartjs-tooltip");

    if (!tooltipEl) {
        tooltipEl = document.createElement("div");
        tooltipEl.id = "chartjs-tooltip";
        Object.assign(tooltipEl.style, {
            position: "absolute",
            pointerEvents: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: "9999",
        });
        document.body.appendChild(tooltipEl);
    }

    const tooltipModel = context.tooltip;
    if (tooltipModel.opacity === 0) {
        Object.assign(tooltipEl.style, {
            opacity: "0",
            transform: "scale(0.95) translateY(-5px)",
        });
        return;
    }

    if (tooltipModel.body) {
        tooltipEl.innerHTML = "";

        const container = document.createElement("div");
        Object.assign(container.style, {
            background: isDark ? "#3D3D3D" : "#ffffff",
            color: isDark ? "#F9FAFB" : "#111827",
            padding: "6px",
            borderRadius: "8px",
            border: `1px solid ${isDark ? "grey.700" : "grey.200"}`,
            boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)",
            minWidth: "200px",
            transformOrigin: "center",
        });

        const titleLines = tooltipModel.title || [];
        titleLines.forEach((title: string) => {
            const titleEl = document.createElement("div");
            Object.assign(titleEl.style, {
                fontWeight: "600",
                marginBottom: "8px",
                fontSize: "13px",
                color: isDark ? "#F9FAFB" : "#111827",
            });
            titleEl.textContent = title;
            container.appendChild(titleEl);
        });

        const bodyLines = tooltipModel.body.map((b: any) => b.lines);
        bodyLines.forEach((body: any, i: number) => {
            const colors = tooltipModel.labelColors[i];

            const parts = body[0].split(":");
            const label = parts[0].trim();
            const value = parts[1]?.trim() || "";

            const row = document.createElement("div");
            Object.assign(row.style, {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "4px 0",
                gap: "16px",
            });

            const labelContainer = document.createElement("div");
            Object.assign(labelContainer.style, {
                display: "flex",
                alignItems: "center",
                gap: "8px",
            });

            const colorBox = document.createElement("span");
            Object.assign(colorBox.style, {
                background:
                    type === "cost"
                        ? colors.backgroundColor
                        : colors.borderColor,
                width: "10px",
                height: "10px",
                display: "inline-block",
                borderRadius: "2px",
                flexShrink: "0",
            });
            labelContainer.appendChild(colorBox);

            const labelText = document.createElement("span");
            Object.assign(labelText.style, {
                color: isDark ? "#E5E7EB" : "#374151",
                fontSize: "12px",
            });
            labelText.textContent = label;
            labelContainer.appendChild(labelText);

            const valueText = document.createElement("span");
            Object.assign(valueText.style, {
                color: isDark ? "#F9FAFB" : "#111827",
                fontSize: "12px",
                fontWeight: "600",
                whiteSpace: "nowrap",
            });
            valueText.textContent = value;

            row.appendChild(labelContainer);
            row.appendChild(valueText);
            container.appendChild(row);
        });

        tooltipEl.appendChild(container);
    }

    const position = context.chart.canvas.getBoundingClientRect();
    const tooltipWidth = tooltipEl.offsetWidth;
    const tooltipHeight = tooltipEl.offsetHeight;

    let leftPos =
        position.left +
        window.scrollX +
        tooltipModel.caretX -
        tooltipWidth -
        10;

    if (leftPos < window.scrollX + 20) {
        leftPos = position.left + window.scrollX + tooltipModel.caretX + 10;
    }

    let topPos =
        position.top + window.scrollY + tooltipModel.caretY - tooltipHeight / 2;

    if (topPos < window.scrollY + 10) {
        topPos = window.scrollY + 10;
    }

    if (topPos + tooltipHeight > window.scrollY + window.innerHeight - 10) {
        topPos = window.scrollY + window.innerHeight - tooltipHeight - 10;
    }

    Object.assign(tooltipEl.style, {
        opacity: "1",
        transform: "scale(1) translateY(0)",
        left: leftPos + "px",
        top: topPos + "px",
    });
};

const ChartWithFade: React.FC<{
    data: any;
    isDark: boolean;
    type: "volume" | "latency" | "cost";
}> = ({ data, isDark, type }) => {
    const chartRef = useRef<any>(null);
    const volumeColorLine = useToken("colors", "green.500");
    const volumeColorBackground = useToken("colors", "green.100");
    const darkVolumeColorLine = useToken("colors", "green.700");

    const createChartData = () => {
        if (type === "volume") {
            return {
                labels: data.map((d: any) => d.date),
                datasets: [
                    {
                        label: "Your queries",
                        data: data.map((d: any) => d.queries),
                        fill: true,
                        borderColor: isDark ? volumeColorLine : volumeColorLine,
                        borderWidth: 2.5,
                        backgroundColor: (context: any) => {
                            const chart = context.chart;
                            const { ctx, chartArea } = chart;
                            if (!chartArea) return;
                            return createGradient(
                                ctx,
                                chartArea,
                                isDark
                                    ? darkVolumeColorLine
                                    : volumeColorBackground,
                                0.5,
                            );
                        },
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBorderWidth: 3,
                        pointHoverBackgroundColor: isDark
                            ? volumeColorLine
                            : volumeColorLine,
                        pointHoverBorderColor: isDark ? "#1A202C" : "#ffffff",
                    },
                ],
            };
        } else if (type === "latency") {
            return {
                labels: data.map((d: any) => d.date),
                datasets: [
                    {
                        label: "p95",
                        data: data.map((d: any) => d.p95),
                        fill: true,
                        borderColor: "#EC4899",
                        borderWidth: 2,
                        backgroundColor: (context: any) => {
                            const chart = context.chart;
                            const { ctx, chartArea } = chart;
                            if (!chartArea) return;
                            return createGradient(
                                ctx,
                                chartArea,
                                "#EC4899",
                                0.2,
                            );
                        },
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBorderWidth: 3,
                        pointHoverBackgroundColor: "#EC4899",
                        pointHoverBorderColor: isDark ? "#1A202C" : "#ffffff",
                    },
                    {
                        label: "p50 median",
                        data: data.map((d: any) => d.p50),
                        fill: true,
                        borderColor: "#6366F1",
                        borderWidth: 2.5,
                        backgroundColor: (context: any) => {
                            const chart = context.chart;
                            const { ctx, chartArea } = chart;
                            if (!chartArea) return;
                            return createGradient(
                                ctx,
                                chartArea,
                                "#6366F1",
                                0.25,
                            );
                        },
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBorderWidth: 3,
                        pointHoverBackgroundColor: "#6366F1",
                        pointHoverBorderColor: isDark ? "#1A202C" : "#ffffff",
                    },
                ],
            };
        } else {
            return {
                labels: data.map((d: any) => d.label),
                datasets: [
                    {
                        data: data.map((d: any) => d.data),
                        backgroundColor: data.map((d: any) => d.color),
                        borderRadius: 8,
                        borderSkipped: false,
                        hoverBackgroundColor: data.map((d: any) => d.color),
                        hoverBorderColor: data.map((d: any) => d.color),
                        hoverBorderWidth: 2,
                        hoverBorderRadius: 8,
                        hoverBorderSkipped: false,
                    },
                ],
            };
        }
    };

    const animation = {
        x: {
            type: "number",
            easing: "easeOutQuart",
            duration: 700,
        },
        y: {
            type: "number",
            easing: "easeOutQuart",
            duration: 700,
            from: (ctx: any) => {
                const scale = ctx.chart.scales.y;
                return scale.getPixelForValue(scale.min);
            },
        },
    };

    const getOptions = (): any => ({
        responsive: true,
        maintainAspectRatio: false,
        animation,
        transitions: {
            active: {
                animation: {
                    duration: 400,
                },
            },
        },
        layout: {
            padding: {
                left: 0,
                right: 0,
                top: 20,
                bottom: 0,
            },
        },
        indexAxis: type === "cost" ? "y" : "x",
        interaction: {
            mode: type === "cost" ? "nearest" : "index",
            intersect: type === "cost" ? true : false,
        },

        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
                position: "nearest",
                external: (context: any) => {
                    CustomTooltip(context, isDark, type);
                },
            },
        },

        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: isDark ? "#A0AEC0" : "#718096",
                    font: { size: 11 },
                },
                border: {
                    display: false,
                },
            },
            y: {
                grid: {
                    color: isDark ? "transparent" : "transparent",
                },
                ticks: {
                    color: isDark ? "#A0AEC0" : "#718096",
                    padding: 20,
                    font: { size: 11 },
                    maxTicksLimit: 5,
                },
                border: {
                    display: false,
                },
            },
        },
        onHover: (event: any, activeElements: any) => {
            event.native.target.style.cursor =
                activeElements.length > 0 ? "pointer" : "default";
        },
    });

    return (
        <Box h="280px" position="relative">
            {type !== "cost" && (
                <>
                    <Box
                        position="absolute"
                        left={16}
                        top={0}
                        bottom={5}
                        width="80px"
                        background={
                            isDark
                                ? `linear-gradient(to right, 
                    #1E1E1E 0%,
                    rgba(29, 29, 29, 0.95) 10% ,
                    rgba(29, 29, 29, 0.7) 30%,
                    rgba(29, 29, 29, 0.4) 55%,
                    rgba(29, 29, 29, 0.15) 80%,
                  transparent 100%)`
                                : `linear-gradient(to right, 
                  #ffffff 0%,
                  rgba(255, 255, 255, 0.95) 10%,
                  rgba(255, 255, 255, 0.7) 30%,
                  rgba(255, 255, 255, 0.4) 55%,
                  rgba(255, 255, 255, 0.15) 80%,
                  transparent 100%)`
                        }
                        pointerEvents="none"
                        zIndex={1}
                    />
                    <Box
                        position="absolute"
                        right={3}
                        top={0}
                        bottom={5}
                        width="60px"
                        background={
                            isDark
                                ? `linear-gradient(to left, 
                  #1E1E1E 0%,
                   rgba(29, 29, 29, 0.95) 10%,
                    rgba(29, 29, 29, 0.7) 30%,
                    rgba(29, 29, 29, 0.4) 55%,
                    rgba(29, 29, 29, 0.15) 80%,
                  transparent 100%)`
                                : `linear-gradient(to left, 
                  #ffffff 0%,
                  rgba(255, 255, 255, 0.95) 10%,
                  rgba(255, 255, 255, 0.7) 30%,
                  rgba(255, 255, 255, 0.4) 55%,
                  rgba(255, 255, 255, 0.15) 80%,
                  transparent 100%)`
                        }
                        pointerEvents="none"
                        zIndex={1}
                    />
                </>
            )}
            {type === "cost" ? (
                <Bar
                    ref={chartRef}
                    data={createChartData()}
                    options={getOptions()}
                />
            ) : (
                <Line
                    ref={chartRef}
                    data={createChartData()}
                    options={getOptions()}
                />
            )}
        </Box>
    );
};

const AnalyticsWorkspace = () => {
    const { colorMode } = useColorMode();
    const [timeRange, setTimeRange] = useState("7d");
    const [environment, setEnvironment] = useState("all");

    const isDark = colorMode === "dark";

    return (
        <VStack
            w="100%"
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
        >
            <WorkspaceHeader
                title="Analytics"
                description="View data about your assistant performance and usage."
            />
            <VStack
                w="100%"
                flex={1}
                align="stretch"
                spacing={0}
                overflow="auto"
                bg={isDark ? "grey.975" : "white"}
            >
                <HStack w="100%" align="start" spacing={6} p={6}>
                    <Box flex={1} minW={0}>
                        <VStack spacing={6} align="stretch" w="100%">
                            <Card
                                bg={isDark ? "grey.950" : "white"}
                                borderRadius="16px"
                                border="1px solid"
                                borderColor={isDark ? "grey.700" : "grey.200"}
                            >
                                <CardBody p={2}>
                                    <VStack
                                        spacing={6}
                                        align="stretch"
                                        w="100%"
                                    >
                                        <Grid
                                            templateColumns="repeat(auto-fit, minmax(280px, 1fr))"
                                            gap={6}
                                        >
                                            <PremiumKPICard
                                                icon={MessageIcon}
                                                label="Queries"
                                                value="298"
                                                sublabel="today"
                                                trend={12.5}
                                                trendLabel="vs yesterday"
                                            />
                                            <PremiumKPICard
                                                icon={ClockIcon}
                                                label="Avg Latency"
                                                value="195"
                                                unit="ms"
                                                sublabel="p95: 456ms"
                                                trend={-8.3}
                                                trendLabel="vs yesterday"
                                            />
                                            <PremiumKPICard
                                                icon={DollarIcon}
                                                label="Total Cost"
                                                value="31.40"
                                                unit="$"
                                                sublabel="today"
                                                trend={15.2}
                                                trendLabel="vs yesterday"
                                            />
                                        </Grid>
                                        <HStack
                                            display="flex"
                                            align="stretch"
                                            spacing={6}
                                            w="100%"
                                        >
                                            <Box flexGrow={2} minW={0}>
                                                <VStack
                                                    w="100%"
                                                    align="stretch"
                                                    spacing={6}
                                                >
                                                    <HStack
                                                        w="100%"
                                                        justify="space-between"
                                                        align="start"
                                                    >
                                                        <Box>
                                                            <Text
                                                                fontSize="lg"
                                                                fontWeight="600"
                                                                color={
                                                                    isDark
                                                                        ? "grey.100"
                                                                        : "grey.800"
                                                                }
                                                            >
                                                                Query Volume
                                                            </Text>
                                                        </Box>
                                                    </HStack>
                                                    <ChartWithFade
                                                        data={mockVolumeData}
                                                        isDark={isDark}
                                                        type="volume"
                                                    />
                                                </VStack>
                                            </Box>
                                        </HStack>
                                        <VStack align="stretch" spacing={6}>
                                            <HStack justify="space-between">
                                                <Box>
                                                    <Text
                                                        fontSize="lg"
                                                        fontWeight="600"
                                                        color={
                                                            isDark
                                                                ? "grey.100"
                                                                : "grey.800"
                                                        }
                                                    >
                                                        Response Latency
                                                    </Text>
                                                    <HStack spacing={4} mt={2}>
                                                        <HStack spacing={2}>
                                                            <Box
                                                                w={2}
                                                                h={2}
                                                                borderRadius="full"
                                                                bg="#6366F1"
                                                            />
                                                            <Text
                                                                fontSize="xs"
                                                                color="grey.500"
                                                            >
                                                                p50 median
                                                            </Text>
                                                        </HStack>
                                                        <HStack spacing={2}>
                                                            <Box
                                                                w={2}
                                                                h={2}
                                                                borderRadius="full"
                                                                bg="#EC4899"
                                                            />
                                                            <Text
                                                                fontSize="xs"
                                                                color="grey.500"
                                                            >
                                                                p95
                                                            </Text>
                                                        </HStack>
                                                    </HStack>
                                                </Box>
                                            </HStack>
                                            <ChartWithFade
                                                data={mockLatencyData}
                                                isDark={isDark}
                                                type="latency"
                                            />
                                        </VStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </VStack>
                    </Box>
                    <Box flex={1} w="400px" maxW="100%">
                        <VStack spacing={6} align="stretch" w="100%">
                            <Card
                                p={2}
                                bg={isDark ? "grey.950" : "white"}
                                borderRadius="16px"
                                border="1px solid"
                                borderColor={isDark ? "grey.700" : "grey.200"}
                            >
                                <CardBody p={2}>
                                    <VStack
                                        spacing={6}
                                        align="stretch"
                                        w="100%"
                                    >
                                        <VStack align="stretch" spacing={1}>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="600"
                                                color={
                                                    isDark
                                                        ? "grey.100"
                                                        : "grey.800"
                                                }
                                            >
                                                Query Activity Heatmap
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color="grey.500"
                                                fontWeight="500"
                                                mb={1}
                                            >
                                                Last 60 days
                                            </Text>
                                        </VStack>
                                        <VStack
                                            align="stretch"
                                            spacing={1}
                                            h="300px"
                                        >
                                            <ActivityHeatmap
                                                data={allVolumeData}
                                                isDark={isDark}
                                            />
                                        </VStack>
                                    </VStack>
                                    <VStack
                                        spacing={4}
                                        align="stretch"
                                        w="100%"
                                        mt={7}
                                    >
                                        <HStack justify="space-between">
                                            <Text
                                                fontSize="lg"
                                                fontWeight="600"
                                                color={
                                                    isDark
                                                        ? "grey.100"
                                                        : "grey.800"
                                                }
                                            >
                                                Activity log
                                            </Text>
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                color={
                                                    isDark
                                                        ? "grey.400"
                                                        : "grey.600"
                                                }
                                            >
                                                Expand all activities
                                            </Button>
                                        </HStack>

                                        <VStack spacing={3} align="stretch">
                                            {mockActivityLog.map((activity) => (
                                                <ActivityLogItem
                                                    key={activity.id}
                                                    activity={activity}
                                                    isDark={isDark}
                                                />
                                            ))}
                                        </VStack>
                                    </VStack>
                                    <HStack justify="space-between" mt={8}>
                                        <Box>
                                            <Text
                                                fontSize="lg"
                                                fontWeight="600"
                                                color={
                                                    isDark
                                                        ? "grey.100"
                                                        : "grey.800"
                                                }
                                            >
                                                Total Cost
                                            </Text>
                                            <HStack spacing={4} mt={2}>
                                                <HStack spacing={2}>
                                                    <Box
                                                        w={2}
                                                        h={2}
                                                        borderRadius="full"
                                                        bg="#10B981"
                                                    />
                                                    <Text
                                                        fontSize="xs"
                                                        color="grey.500"
                                                    >
                                                        Daily spend
                                                    </Text>
                                                </HStack>
                                            </HStack>
                                        </Box>
                                    </HStack>

                                    <ChartWithFade
                                        data={mockCostData}
                                        isDark={isDark}
                                        type="cost"
                                    />
                                </CardBody>
                            </Card>
                        </VStack>
                    </Box>
                </HStack>
            </VStack>
        </VStack>
    );
};

interface ActivityLogItemProps {
    activity: {
        id: number;
        user: { name: string; avatar: string };
        query: string;
        response: string;
        timestamp: string;
        responseTime: string;
        sources: string[];
        cost: string;
    };
    isDark: boolean;
}

const ActivityLogItem: React.FC<ActivityLogItemProps> = ({
    activity,
    isDark,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Box
            p={3}
            bg={isDark ? "grey.900" : "white"}
            borderRadius="12px"
            border="1px solid"
            borderColor={isDark ? "grey.800" : "grey.200"}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
                borderColor: isDark ? "grey.600" : "grey.300",
                bg: isDark ? "grey.850" : "grey.50",
            }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <VStack spacing={3} align="stretch">
                <HStack justify="space-between" align="start">
                    <HStack spacing={3} flex={1}>
                        <Avatar
                            size="sm"
                            name={activity.user.name}
                            bg="green.500"
                            color="white"
                            fontSize="xs"
                        />
                        <VStack align="start" spacing={0} flex={1}>
                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                color={isDark ? "grey.100" : "grey.900"}
                            >
                                {activity.user.name}
                            </Text>
                            <Text
                                fontSize="xs"
                                color={isDark ? "grey.500" : "grey.500"}
                                noOfLines={isExpanded ? undefined : 1}
                            >
                                {activity.query}
                            </Text>
                        </VStack>
                    </HStack>
                    <VStack align="end" spacing={1}>
                        <Text
                            fontSize="xs"
                            color={isDark ? "grey.500" : "grey.500"}
                        >
                            {activity.timestamp}
                        </Text>
                        <IconButton
                            icon={
                                isExpanded ? (
                                    <ChevronUpIcon size={16} />
                                ) : (
                                    <ChevronDownIcon size={16} />
                                )
                            }
                            size="xs"
                            variant="ghost"
                            aria-label="Expand"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                        />
                    </VStack>
                </HStack>
                {!isExpanded && (
                    <HStack spacing={4} flexWrap="wrap">
                        <HStack spacing={1}>
                            <Text
                                fontSize="xs"
                                color={isDark ? "grey.500" : "grey.500"}
                            >
                                Response time:
                            </Text>
                            <Text
                                fontSize="xs"
                                fontWeight="600"
                                color={isDark ? "grey.300" : "grey.700"}
                            >
                                {activity.responseTime}
                            </Text>
                        </HStack>
                        <HStack spacing={1}>
                            <Text
                                fontSize="xs"
                                color={isDark ? "grey.500" : "grey.500"}
                            >
                                Cost:
                            </Text>
                            <Text
                                fontSize="xs"
                                fontWeight="600"
                                color={isDark ? "grey.300" : "grey.700"}
                            >
                                {activity.cost}
                            </Text>
                        </HStack>
                        <HStack spacing={1}>
                            <Text
                                fontSize="xs"
                                color={isDark ? "grey.500" : "grey.500"}
                            >
                                Sources:
                            </Text>
                            <Text
                                fontSize="xs"
                                fontWeight="600"
                                color={isDark ? "grey.300" : "grey.700"}
                            >
                                {activity.sources.length}
                            </Text>
                        </HStack>
                    </HStack>
                )}

                {/* Expanded view */}
                <Collapse in={isExpanded} animateOpacity>
                    <VStack spacing={3} align="stretch" pt={2}>
                        <Divider
                            borderColor={isDark ? "grey.800" : "grey.200"}
                        />

                        {/* Response */}
                        <Box>
                            <Text
                                fontSize="xs"
                                fontWeight="600"
                                color={isDark ? "grey.400" : "grey.600"}
                                mb={1}
                            >
                                Response
                            </Text>
                            <Text
                                fontSize="xs"
                                color={isDark ? "grey.300" : "grey.700"}
                                lineHeight="1.5"
                            >
                                {activity.response}
                            </Text>
                        </Box>

                        {/* Sources */}
                        <Box>
                            <Text
                                fontSize="xs"
                                fontWeight="600"
                                color={isDark ? "grey.400" : "grey.600"}
                                mb={2}
                            >
                                Sources ({activity.sources.length})
                            </Text>
                            <HStack spacing={2} flexWrap="wrap">
                                {activity.sources.map((source, idx) => (
                                    <Badge
                                        key={idx}
                                        size="sm"
                                        colorScheme="blue"
                                        fontSize="xs"
                                        px={2}
                                        py={1}
                                        borderRadius="6px"
                                    >
                                        📄 {source}
                                    </Badge>
                                ))}
                            </HStack>
                        </Box>

                        {/* Metrics */}
                        <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                            <Box
                                p={2}
                                bg={isDark ? "grey.800" : "white"}
                                borderRadius="8px"
                                border="1px solid"
                                borderColor={isDark ? "grey.700" : "grey.200"}
                            >
                                <Text
                                    fontSize="xs"
                                    color={isDark ? "grey.500" : "grey.500"}
                                    mb={1}
                                >
                                    Response Time
                                </Text>
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color={isDark ? "grey.100" : "grey.900"}
                                >
                                    {activity.responseTime}
                                </Text>
                            </Box>

                            <Box
                                p={2}
                                bg={isDark ? "grey.800" : "white"}
                                borderRadius="8px"
                                border="1px solid"
                                borderColor={isDark ? "grey.700" : "grey.200"}
                            >
                                <Text
                                    fontSize="xs"
                                    color={isDark ? "grey.500" : "grey.500"}
                                    mb={1}
                                >
                                    Cost
                                </Text>
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color={isDark ? "grey.100" : "grey.900"}
                                >
                                    {activity.cost}
                                </Text>
                            </Box>

                            <Box
                                p={2}
                                bg={isDark ? "grey.800" : "white"}
                                borderRadius="8px"
                                border="1px solid"
                                borderColor={isDark ? "grey.700" : "grey.200"}
                            >
                                <Text
                                    fontSize="xs"
                                    color={isDark ? "grey.500" : "grey.500"}
                                    mb={1}
                                >
                                    Sources
                                </Text>
                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color={isDark ? "grey.100" : "grey.900"}
                                >
                                    {activity.sources.length}
                                </Text>
                            </Box>
                        </Grid>
                    </VStack>
                </Collapse>
            </VStack>
        </Box>
    );
};

interface PremiumKPICardProps {
    icon: any;
    label: string;
    value: string;
    unit?: string;
    sublabel?: string;
    trend?: number;
    trendLabel?: string;
}

const PremiumKPICard: React.FC<PremiumKPICardProps> = ({
    icon: IconComponent,
    label,
    value,
    unit,
    sublabel,
    trend,
    trendLabel,
}) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";

    return (
        <Card
            bg={isDark ? "grey.850" : "white"}
            borderRadius="16px"
            border="1px solid"
            borderColor={isDark ? "grey.700" : "grey.200"}
            _hover={{
                transform: "translateY(-2px)",
                shadow: isDark ? "lg" : "md",
                transition: "all 0.2s",
            }}
            padding={4}
        >
            <CardBody p={1}>
                <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between" align="top">
                        <Text
                            fontSize="xl"
                            color={isDark ? "grey.100" : "grey.600"}
                            fontWeight="400"
                        >
                            {label}
                        </Text>
                        <Box
                            p={4}
                            borderRadius="12px"
                            bg={isDark ? "green.700" : "green.100"}
                        >
                            <IconComponent
                                boxSize={6}
                                color={isDark ? "grey.100" : "grey.600"}
                            />
                        </Box>
                    </HStack>
                    <HStack align="baseline" spacing={1}>
                        {unit && (
                            <Text
                                fontSize="xl"
                                fontWeight="600"
                                color={isDark ? "grey.300" : "grey.600"}
                            >
                                {unit}
                            </Text>
                        )}
                        <Text
                            fontSize="3xl"
                            fontWeight="700"
                            color={isDark ? "grey.100" : "grey.800"}
                        >
                            {value}
                        </Text>
                    </HStack>

                    {trend !== undefined && (
                        <HStack spacing={2}>
                            <Badge
                                colorScheme={trend >= 0 ? "green" : "red"}
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                borderRadius="6px"
                            >
                                {trend >= 0 ? "↗" : "↘"} {Math.abs(trend)}%
                            </Badge>
                            <Text fontSize="xs" color="grey.500">
                                {trendLabel}
                            </Text>
                        </HStack>
                    )}
                </VStack>
            </CardBody>
        </Card>
    );
};

interface ActivityHeatmapProps {
    data: Array<{ fullDate: Date; queries: number }>;
    isDark: boolean;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data, isDark }) => {
    const weeks: Array<
        Array<{ date: Date; queries: number; dayOfWeek: number }>
    > = [];
    let currentWeek: Array<{ date: Date; queries: number; dayOfWeek: number }> =
        [];

    const firstDate = new Date(data[0].fullDate);
    const firstDay = firstDate.getDay();

    for (let i = 0; i < firstDay; i++) {
        currentWeek.push({ date: new Date(0), queries: 0, dayOfWeek: i });
    }

    data.forEach((item, index) => {
        const dayOfWeek = item.fullDate.getDay();
        currentWeek.push({
            date: item.fullDate,
            queries: item.queries,
            dayOfWeek,
        });

        if (dayOfWeek === 6 || index === data.length - 1) {
            while (currentWeek.length < 7) {
                currentWeek.push({
                    date: new Date(0),
                    queries: 0,
                    dayOfWeek: currentWeek.length,
                });
            }
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
    });

    const allQueries = data.map((d) => d.queries);
    const minQueries = Math.min(...allQueries);
    const maxQueries = Math.max(...allQueries);

    const getColor = (queries: number) => {
        if (queries === 0) return isDark ? "#4F4F4F" : "#F3F4F6";

        const intensity = (queries - minQueries) / (maxQueries - minQueries);

        if (intensity < 0.25) return "#D1FAE5";
        if (intensity < 0.5) return "#6EE7B7";
        if (intensity < 0.75) return "#34D399";
        return "#10B981";
    };

    return (
        <VStack w="100%" h="100%" align="start" spacing={1} flex={1}>
            <Flex w="100%" h="calc(100% - 24px)" gap="4px" flex={1}>
                {weeks.map((week, weekIndex) => (
                    <Flex
                        key={weekIndex}
                        flexDirection="column"
                        gap="4px"
                        flex={1}
                        minW={0}
                    >
                        {week.map((day, dayIndex) => (
                            <ChakraTooltip
                                key={dayIndex}
                                placement="top"
                                hasArrow
                                borderRadius="8px"
                                label={
                                    day.queries > 0
                                        ? `${day.date.toLocaleDateString()}: ${day.queries} queries`
                                        : ""
                                }
                            >
                                <Box
                                    flex={1}
                                    minH={0}
                                    borderRadius="8px"
                                    bg={getColor(day.queries)}
                                    cursor="pointer"
                                    _hover={{
                                        transform: "scale(1.5)",
                                        transition: "transform 0.1s",
                                        zIndex: 1,
                                    }}
                                    transition="transform 0.1s"
                                />
                            </ChakraTooltip>
                        ))}
                    </Flex>
                ))}
            </Flex>

            <HStack spacing={1} mt={2} flexShrink={0}>
                <Text fontSize="9px" color="grey.500">
                    Less
                </Text>
                {[0, 1, 2, 3, 4].map((level) => (
                    <Box
                        key={level}
                        w="10px"
                        h="10px"
                        borderRadius="2px"
                        bg={getColor(
                            minQueries +
                                (level / 4) * (maxQueries - minQueries),
                        )}
                    />
                ))}
                <Text fontSize="9px" color="grey.500">
                    More
                </Text>
            </HStack>
        </VStack>
    );
};

export default AnalyticsWorkspace;
