import type { ReactNode } from "react";
import { Card, type CardProps, Divider, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import MultiOptionButtons from "components/ui/MultiOptionButtons";
import { ChartInfoTooltip } from "./ChartInfoTooltip";
import { type Period } from "./types";

interface AnalyticsChartCardProps {
    title: string;
    tooltip: string;
    subtitle: string;
    period: Period;
    onPeriodChange: (period: Period) => void;
    showPeriodSelector?: boolean;
    headerExtra?: ReactNode;
    contentCardProps?: CardProps;
    children: ReactNode;
}

export const AnalyticsChartCard = ({
    title,
    tooltip,
    subtitle,
    period,
    onPeriodChange,
    showPeriodSelector = true,
    headerExtra,
    contentCardProps,
    children,
}: AnalyticsChartCardProps) => (
    <Stack spacing={0}>
        <Card size="sm" variant="attachedTop">
            <HStack spacing={2} mb={headerExtra ? 1 : 0} justify="space-between" flexWrap="wrap" rowGap={1}>
                <VStack align="flex-start" spacing={0} flex={1} minW="180px">
                    <HStack spacing={1.5}>
                        <Text variant="body-md-semibold">{title}</Text>
                        <ChartInfoTooltip label={tooltip} />
                    </HStack>
                    <Text variant="body-xs-muted">{subtitle}</Text>
                </VStack>
                {showPeriodSelector && (
                    <MultiOptionButtons
                        options={(["7j", "30j", "90j"] as Period[]).map((p) => ({ value: p, label: p }))}
                        value={period}
                        onChange={onPeriodChange}
                        size="sm"
                        color="surfaceSubtle"
                    />
                )}
            </HStack>
            {headerExtra}
        </Card>
        <Divider borderColor="borderStrong" />
        <Card size="none" variant="attachedBottom" {...contentCardProps}>
            {children}
        </Card>
    </Stack>
);
