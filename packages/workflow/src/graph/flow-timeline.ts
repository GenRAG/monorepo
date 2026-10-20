import type { Edge } from "@xyflow/react";
import type { AppNode } from "../types/app-node";
import { EdgeType } from "../types/edge";
import { TaskType } from "../types/task";

/** Fraction of the animation cycle, from 0 to 1. */
export type CycleWindow = [start: number, end: number];

/** A text bubble outside the chain: it types itself during `typing`, and stays on screen during `visible`. */
export interface TypedText {
    typing: CycleWindow;
    visible: CycleWindow;
}

export interface FlowEdgeTiming {
    /** Length of one cycle, in seconds: the same for every edge of the chain, so they stay in step. */
    duration: number;
    travel: CycleWindow;
    targetGlow: CycleWindow;
    /** Only the first edge lights the QUERY node, before its token leaves. */
    sourceGlow?: CycleWindow;
    /** First edge only: the question typed into the QUERY node. */
    question?: TypedText;
    /** Last edge only: the answer typed out of the RESPONSE node. */
    answer?: TypedText;
}

/** When a chain node reads its settings, while it holds the data. */
export interface NodeBeats {
    duration: number;
    settings: CycleWindow;
}

const TYPE_DELAY_S = 0.3;
const QUESTION_TYPE_S = 1.8;
const SOURCE_GLOW_S = 0.8;
const START_S = TYPE_DELAY_S + QUESTION_TYPE_S + SOURCE_GLOW_S;
const TRAVEL_S = 2.6;
const GLOW_S = 1.2;
// The answer starts once RESPONSE has read its model and instruction.
const ANSWER_DELAY_S = 1.2;
const ANSWER_TYPE_S = 2.2;
const LAST_GLOW_S = 2.8;
// Question and answer stay side by side for a moment before the cycle restarts.
const HOLD_S = 1.5;
const PAUSE_S = 0.5;
const SETTINGS_LAG_S = 0.3;
const SETTINGS_LEAD_S = 0.15;

type ChainEdge = Pick<Edge, "id" | "source" | "target" | "type">;

/** Main-chain edges in flow order, walking from the QUERY node. */
function mainChain(nodes: Pick<AppNode, "id" | "data">[], edges: ChainEdge[]) {
    const next = new Map(edges.filter((e) => e.type === EdgeType.Main).map((e) => [e.source, e]));
    const queryId = nodes.find((n) => n.data.type === TaskType.QUERY)?.id;
    const chain: ChainEdge[] = [];
    const seen = new Set<string>();
    let current = queryId;
    while (current && !seen.has(current)) {
        seen.add(current);
        const edge = next.get(current);
        if (!edge) break;
        chain.push(edge);
        current = edge.target;
    }
    return { queryId, chain };
}

/** Main-chain edge ids in flow order, walking from the QUERY node. */
export function mainChainEdgeIds(nodes: Pick<AppNode, "id" | "data">[], edges: ChainEdge[]): string[] {
    return mainChain(nodes, edges).chain.map((e) => e.id);
}

/** Main-chain node ids in flow order, QUERY first; empty while QUERY has no outgoing edge. */
export function mainChainNodeIds(nodes: Pick<AppNode, "id" | "data">[], edges: ChainEdge[]): string[] {
    const { queryId, chain } = mainChain(nodes, edges);
    return queryId && chain.length ? [queryId, ...chain.map((e) => e.target)] : [];
}

/** The cycle in seconds, for a chain of `count` edges: node `p` is QUERY for 0, the target of edge `p - 1` otherwise. */
function schedule(count: number) {
    const travelStart = (index: number) => START_S + index * (TRAVEL_S + GLOW_S);
    const lastArrival = travelStart(count - 1) + TRAVEL_S;
    const answerStart = lastArrival + ANSWER_DELAY_S;
    const textsEnd = lastArrival + LAST_GLOW_S + HOLD_S;
    return {
        duration: textsEnd + PAUSE_S,
        textsEnd,
        answerStart,
        lastArrival,
        travelStart,
        arrive: (p: number) => (p === 0 ? TYPE_DELAY_S + QUESTION_TYPE_S : travelStart(p - 1) + TRAVEL_S),
        leave: (p: number) => (p === count ? answerStart : travelStart(p)),
    };
}

/** When the token of the `index`-th edge (out of `count`) travels, and when its nodes light up. */
export function flowEdgeTiming(index: number, count: number): FlowEdgeTiming {
    const s = schedule(count);
    const travelStart = s.travelStart(index);
    const travelEnd = travelStart + TRAVEL_S;
    const isLast = index === count - 1;
    const glowEnd = travelEnd + (isLast ? LAST_GLOW_S : GLOW_S);
    const at = (seconds: number) => seconds / s.duration;
    const typed = (start: number, typing: number): TypedText => ({
        typing: [at(start), at(start + typing)],
        visible: [at(start), at(s.textsEnd)],
    });

    return {
        duration: s.duration,
        travel: [at(travelStart), at(travelEnd)],
        targetGlow: [at(travelEnd), at(glowEnd)],
        sourceGlow: index === 0 ? [at(START_S - SOURCE_GLOW_S), at(START_S)] : undefined,
        question: index === 0 ? typed(TYPE_DELAY_S, QUESTION_TYPE_S) : undefined,
        answer: isLast ? typed(s.answerStart, ANSWER_TYPE_S) : undefined,
    };
}

/** The settings beat of the `position`-th chain node (0 is QUERY), in a chain of `count` edges. */
export function flowNodeBeats(position: number, count: number): NodeBeats {
    const s = schedule(count);
    const arrive = s.arrive(position);
    const leave = s.leave(position);
    const at = (seconds: number) => seconds / s.duration;

    return {
        duration: s.duration,
        settings: [at(arrive + SETTINGS_LAG_S), at(leave - SETTINGS_LEAD_S)],
    };
}
