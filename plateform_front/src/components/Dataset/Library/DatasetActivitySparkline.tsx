import { useId } from "react";
import { Box, Text, Tooltip, useToken } from "@chakra-ui/react";
import { pluralize } from "utils/dataset/datasetStatus";

const WIDTH = 120;
const HEIGHT = 28;
const PAD = 3;

/** Documents added per day (last 30 days) as a line; the total is the tooltip and the accessible label. */
export const DatasetActivitySparkline = ({ activity }: { activity: number[] }) => {
    const gradientId = useId();
    const [line, faint] = useToken("colors", ["green.400", "grey.500"]);
    const total = activity.reduce((sum, count) => sum + count, 0);
    const max = Math.max(...activity, 1);
    const step = activity.length > 1 ? (WIDTH - PAD * 2) / (activity.length - 1) : 0;

    const points = activity.map((count, i) => ({
        x: PAD + i * step,
        y: HEIGHT - PAD - (count / max) * (HEIGHT - PAD * 2),
    }));
    const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const area = `${path} L${points[points.length - 1]?.x ?? PAD},${HEIGHT - PAD} L${PAD},${HEIGHT - PAD} Z`;
    const last = points[points.length - 1];
    const label =
        total === 0
            ? "Aucun ajout sur 30 jours"
            : `${pluralize(total, "document ajouté", "documents ajoutés")} sur 30 jours`;

    return (
        <Tooltip label={label} bg="tooltipBg" color="white" borderRadius="8px" hasArrow placement="top">
            <Box display="flex" alignItems="center" gap={2} w="fit-content">
                <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label}>
                    {total === 0 ? (
                        <line
                            x1={PAD}
                            x2={WIDTH - PAD}
                            y1={HEIGHT - PAD}
                            y2={HEIGHT - PAD}
                            stroke={faint}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeDasharray="2 4"
                        />
                    ) : (
                        <>
                            <defs>
                                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor={line} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={line} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <path d={area} fill={`url(#${gradientId})`} />
                            <path
                                d={path}
                                fill="none"
                                stroke={line}
                                strokeWidth={2}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                            {last && <circle cx={last.x} cy={last.y} r={2.5} fill={line} />}
                        </>
                    )}
                </svg>
                <Text variant="caption-xs-muted" minW="18px">
                    {total}
                </Text>
            </Box>
        </Tooltip>
    );
};
