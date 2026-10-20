import { useInternalNode } from "@xyflow/react";
import { useLayoutEffect, useRef, type FC } from "react";
import type { CycleWindow } from "../../graph/flow-timeline";
import { TaskType } from "../../types/task";

/** Theme color as a CSS variable: SVG presentation attributes cannot read Chakra tokens directly. */
export const themeColor = (token: string) => `var(--chakra-colors-${token.replace(".", "-")})`;

const FADE_S = 0.25;

/** SMIL opacity keyframes: `during` inside `window`, `outside` for the rest of the cycle. */
export function pulse([start, end]: CycleWindow, duration: number, outside = 0, during = 1) {
    const fade = Math.min(FADE_S / duration, (end - start) / 2);
    const keyTimes = [0, start, start + fade, end - fade, end, 1].map((t) => Math.min(1, Math.max(0, t)).toFixed(4));
    const values = [outside, outside, during, during, outside, outside].join(";");
    return { values, keyTimes: keyTimes.join(";"), dur: `${duration}s`, repeatCount: "indefinite" };
}

/**
 * ReactFlow draws each edge in its own <svg>, whose SMIL clock starts when it mounts: an edge added later would run
 * behind the others. Setting every clock to the same wall time, on mount and whenever `key` changes, keeps them in phase.
 */
export function useSmilClock<T extends SVGElement>(active: boolean, key: string) {
    const ref = useRef<T>(null);
    useLayoutEffect(() => {
        if (active) ref.current?.ownerSVGElement?.setCurrentTime(performance.now() / 1000);
    }, [active, key]);
    return ref;
}

/** Lights a node up from the edge layer, so it runs on the same SMIL clock as the edge animations. */
export function NodeHalo({ nodeId, window, duration }: { nodeId: string; window: CycleWindow; duration: number }) {
    const node = useInternalNode(nodeId);
    if (!node) return null;
    const { x, y } = node.internals.positionAbsolute;
    const width = node.measured.width ?? 0;
    const height = node.measured.height ?? 0;

    return (
        <rect x={x - 6} y={y - 6} width={width + 12} height={height + 12} rx={18} opacity={0} style={{ fill: themeColor("bubbleAccentBg") }}>
            <animate attributeName="opacity" {...pulse(window, duration)} />
        </rect>
    );
}

const STRONG = themeColor("iconAccent");
const SOFT = themeColor("borderAccentCardActive");
const PAPER = themeColor("surfaceCard");
const INK = themeColor("white");

const Bubble = ({ x, fill, lines }: { x: number; fill: string; lines: [number, number] }) => (
    <g transform={`translate(${x} 0)`}>
        <rect x={-14} y={-11} width={28} height={22} rx={11} style={{ fill }} />
        <rect x={-8} y={-4} width={lines[0]} height={2.5} rx={1.25} style={{ fill: INK }} />
        <rect x={-8} y={1.5} width={lines[1]} height={2.5} rx={1.25} style={{ fill: INK }} />
    </g>
);

/** One passage; `relevance` (0 to 12) is the height of its score bar. */
const Passage = ({ x, y = 0, relevance, best = false, faded = 1 }: {
    x: number;
    y?: number;
    relevance: number;
    best?: boolean;
    faded?: number;
}) => (
    <g transform={`translate(${x} ${y})`} opacity={faded}>
        <rect x={-7} y={-9} width={14} height={18} rx={2.5} strokeWidth={1.3} style={{ fill: best ? STRONG : PAPER, stroke: STRONG }} />
        <rect x={-4} y={6 - relevance} width={8} height={relevance} rx={1} style={{ fill: best ? INK : SOFT }} />
    </g>
);

const QuestionToken: FC = () => (
    <g>
        <rect x={-16} y={-12} width={32} height={24} rx={12} style={{ fill: STRONG }} />
        <path d="M-7 9 L-11 17 L-1 11 z" style={{ fill: STRONG }} />
        <text y={5} textAnchor="middle" fontSize={14} fontWeight={700} style={{ fill: INK }}>
            ?
        </text>
    </g>
);

const RewrittenToken: FC = () => (
    <g>
        <Bubble x={-17} fill={STRONG} lines={[16, 10]} />
        <Bubble x={17} fill={SOFT} lines={[16, 12]} />
    </g>
);

const PassagesToken: FC = () => (
    <g>
        <Passage x={-36} y={-3} relevance={5} />
        <Passage x={-18} y={2} relevance={12} />
        <Passage x={0} y={-1} relevance={3} />
        <Passage x={18} y={3} relevance={10} />
        <Passage x={36} y={-2} relevance={7} />
    </g>
);

const SORTED = [
    { relevance: 12, faded: 1 },
    { relevance: 10, faded: 1 },
    { relevance: 7, faded: 1 },
    { relevance: 5, faded: 0.7 },
    { relevance: 3, faded: 0.45 },
];

/** The same passages ranked: each one carries its rank above it. */
const SortedPassagesToken: FC = () => (
    <g>
        {SORTED.map(({ relevance, faded }, i) => {
            const x = -36 + i * 18;
            return (
                <g key={i}>
                    <Passage x={x} relevance={relevance} best={i === 0} faded={faded} />
                    <text x={x} y={-12} textAnchor="middle" fontSize={9} fontWeight={700} opacity={faded} style={{ fill: STRONG }}>
                        {i + 1}
                    </text>
                </g>
            );
        })}
    </g>
);

export interface FlowData {
    Token: FC;
    title: string;
    detail: string;
}

/** What travels on a main edge, keyed by the task that produces it (the edge's source). */
export const FLOW_DATA: Partial<Record<TaskType, FlowData>> = {
    [TaskType.QUERY]: {
        Token: QuestionToken,
        title: "La question de l'utilisateur",
        detail: "Telle qu'elle a été écrite dans le chat.",
    },
    [TaskType.REWRITER]: {
        Token: RewrittenToken,
        title: "La question reformulée",
        detail: "Plus précise, parfois en plusieurs variantes.",
    },
    [TaskType.RETRIEVER]: {
        Token: PassagesToken,
        title: "Les passages trouvés",
        detail: "Les extraits de vos documents les plus proches de la question.",
    },
    [TaskType.RERANKER]: {
        Token: SortedPassagesToken,
        title: "Les mêmes passages, triés",
        detail: "Du plus utile au moins utile pour répondre.",
    },
};
