import { useInternalNode } from "@xyflow/react";
import type { TypedText } from "../../graph/flow-timeline";
import { HandleId } from "../../types/edge";
import { pulse, themeColor } from "./flow-data";

const GAP = 16;
const PAD_X = 12;
const PAD_Y = 9;
const LINE_HEIGHT = 9;
const BAR_HEIGHT = 4;
const WORD_GAP = 4;

/** The question goes into the chain before its first node, the answer leaves it after its last node. */
const SIDES = {
    before: { handleType: "target", handleId: HandleId.MainTarget },
    after: { handleType: "source", handleId: HandleId.MainSource },
} as const;

/** The shape of a sentence rather than the sentence itself: one width per word, one array per line. */
const TONES = {
    question: {
        fill: themeColor("iconAccent"),
        stroke: themeColor("iconAccent"),
        bar: themeColor("white"),
        lines: [[26, 14, 34, 20, 8]],
    },
    answer: {
        fill: themeColor("surfaceCard"),
        stroke: themeColor("edgeMain"),
        bar: themeColor("textBody"),
        lines: [
            [30, 18, 26, 34, 14],
            [22, 36, 16, 28, 24],
            [34, 20, 12],
        ],
    },
};

const lineWidth = (words: number[]) => words.reduce((sum, w) => sum + w, 0) + WORD_GAP * (words.length - 1);

interface TypedBubbleProps {
    nodeId: string;
    side: keyof typeof SIDES;
    tone: keyof typeof TONES;
    /** `null` shows the paragraph already written (reduced motion). */
    timing: { typed: TypedText; duration: number } | null;
}

/** A chat bubble beside a chain end, whose lines write themselves one after the other on the SMIL clock of its edge. */
export function TypedBubble({ nodeId, side, tone, timing }: TypedBubbleProps) {
    const node = useInternalNode(nodeId);
    const { handleType, handleId } = SIDES[side];
    const handle = node?.internals.handleBounds?.[handleType]?.find((h) => h.id === handleId);
    if (!node || !handle) return null;

    const { fill, stroke, bar, lines } = TONES[tone];
    const widths = lines.map(lineWidth);
    const total = widths.reduce((sum, w) => sum + w, 0);
    const width = Math.max(...widths) + PAD_X * 2;
    const height = lines.length * LINE_HEIGHT - (LINE_HEIGHT - BAR_HEIGHT) + PAD_Y * 2;

    const { x: nodeX, y: nodeY } = node.internals.positionAbsolute;
    const anchorX = nodeX + handle.x + (side === "after" ? handle.width : 0);
    const anchorY = nodeY + handle.y + handle.height / 2;
    const x = side === "before" ? anchorX - GAP - width : anchorX + GAP;
    const y = anchorY - height / 2;

    // Each line gets a slice of the typing window in proportion to its length, so the writing speed stays even.
    let written = 0;
    const reveals = widths.map((w) => {
        const from = written / total;
        written += w;
        if (!timing) return null;
        const [start, end] = timing.typed.typing;
        const at = (fraction: number) => (start + (end - start) * fraction).toFixed(4);
        return {
            values: `0;0;${w};${w}`,
            keyTimes: `0;${at(from)};${at(written / total)};1`,
            dur: `${timing.duration}s`,
            repeatCount: "indefinite",
        };
    });

    return (
        <g opacity={timing ? 0 : 1} aria-hidden="true">
            {timing && <animate attributeName="opacity" {...pulse(timing.typed.visible, timing.duration)} />}
            <line
                x1={side === "before" ? x + width : anchorX}
                x2={side === "before" ? anchorX : x}
                y1={anchorY}
                y2={anchorY}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                style={{ stroke: themeColor("edgeMain") }}
            />
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={Math.min(height / 2, 12)}
                strokeWidth={1}
                style={{ fill, stroke }}
            />
            {lines.map((words, i) => {
                const lineY = y + PAD_Y + i * LINE_HEIGHT;
                const clipId = `typed-${side}-${nodeId}-${i}`;
                let wordX = x + PAD_X;
                return (
                    <g key={i}>
                        <clipPath id={clipId}>
                            <rect x={x + PAD_X} y={lineY} height={BAR_HEIGHT} width={reveals[i] ? 0 : widths[i]}>
                                {reveals[i] && <animate attributeName="width" {...reveals[i]} />}
                            </rect>
                        </clipPath>
                        <g clipPath={`url(#${clipId})`} opacity={tone === "answer" ? 0.55 : 0.95}>
                            {words.map((w, j) => {
                                const wx = wordX;
                                wordX += w + WORD_GAP;
                                return (
                                    <rect
                                        key={j}
                                        x={wx}
                                        y={lineY}
                                        width={w}
                                        height={BAR_HEIGHT}
                                        rx={BAR_HEIGHT / 2}
                                        style={{ fill: bar }}
                                    />
                                );
                            })}
                        </g>
                    </g>
                );
            })}
        </g>
    );
}
