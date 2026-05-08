export const Sparkline = ({
    data,
    color = "var(--chakra-colors-green-500)",
    id,
    width = 290,
    height = 70,
}: {
    data: number[];
    color?: string;
    id: string;
    width?: number | "full";
    height?: number;
}) => {
    const isFull = width === "full";
    const W = isFull ? 290 : width;
    const H = height;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => ({
        x: (i / (data.length - 1)) * W,
        y: H - ((v - min) / range) * H * 0.82 - H * 0.09,
    }));
    const d = pts
        .map(
            (p, i) =>
                `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
        )
        .join(" ");
    const area = `${d} L${W},${H} L0,${H} Z`;
    const gid = `spk-${id.replace(/[^a-zA-Z0-9]/g, "-")}`;
    const topLineY = Math.min(...pts.map((p) => p.y));
    const hasOffset = min > 0;

    return (
        <svg
            width={isFull ? "100%" : W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio={isFull ? "none" : undefined}
            style={isFull ? { display: "block" } : undefined}
        >
            <defs>
                <linearGradient
                    id={gid}
                    x1="0"
                    y1={topLineY}
                    x2="0"
                    y2={H}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    {hasOffset && (
                        <stop
                            offset="55%"
                            stopColor={color}
                            stopOpacity={0.06}
                        />
                    )}
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gid})`} />
            <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
