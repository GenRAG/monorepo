import { Box, Text, usePrefersReducedMotion } from "@chakra-ui/react";
import { EdgeLabelRenderer, EdgeProps, getSmoothStepPath, useInternalNode, useStore } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { flowEdgeTiming, mainChainEdgeIds } from "../../graph/flow-timeline";
import type { AppNode, AppNodeData } from "../../types/app-node";
import { FLOW_DATA, NodeHalo, pulse, themeColor, useSmilClock } from "./flow-data";
import { TypedBubble } from "./TypedBubble";

interface GenEdgeProps extends EdgeProps {
    onToggle: () => void;
}

const HIT_WIDTH = 36;
// Leaving the hit band for a moment (a corner, a jittery hand) must not make the tooltip flicker.
const HIDE_DELAY_MS = 150;
const BASE = themeColor("edgeMain");
const ACTIVE = themeColor("iconAccent");
// Dims the base line while the token travels: in dark mode it is almost the color of the active dashes.
const BASE_DIMMED = 0.35;

export default function GenEdge(props: GenEdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath(props);
    const [hovered, setHovered] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(hideTimer.current), []);
    const showTooltip = () => {
        clearTimeout(hideTimer.current);
        setHovered(true);
    };
    const hideTooltip = () => {
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setHovered(false), HIDE_DELAY_MS);
    };
    const reducedMotion = usePrefersReducedMotion();

    const sourceNode = useInternalNode(props.source);
    const flow = FLOW_DATA[(sourceNode?.internals.userNode.data as AppNodeData | undefined)?.type ?? ("" as never)];

    // A string, so the edge re-renders only when its place in the chain changes.
    const place = useStore((s) => {
        const ids = mainChainEdgeIds(s.nodes as AppNode[], s.edges);
        return `${ids.indexOf(props.id)}/${ids.length}`;
    });
    const [index, count] = place.split("/").map(Number);
    const animated = index >= 0 && !reducedMotion;
    const timing = animated ? flowEdgeTiming(index, count) : null;

    const basePath = useSmilClock<SVGPathElement>(animated, place);

    return (
        <>
            <path
                id={`edge-${props.id}`}
                ref={basePath}
                className="react-flow__edge-path"
                d={edgePath}
                fill="none"
                markerEnd={props.markerEnd}
                style={{ ...props.style, stroke: BASE, strokeWidth: 2, strokeDasharray: "none" }}
            >
                {timing && <animate attributeName="opacity" {...pulse(timing.travel, timing.duration, 1, BASE_DIMMED)} />}
            </path>

            {timing && (
                <g key={place}>
                    {timing.sourceGlow && (
                        <NodeHalo nodeId={props.source} window={timing.sourceGlow} duration={timing.duration} />
                    )}
                    <NodeHalo nodeId={props.target} window={timing.targetGlow} duration={timing.duration} />
                    {/* Dashed and flowing: the `animated` edge class of ReactFlow, which every main edge has. */}
                    <path d={edgePath} fill="none" strokeWidth={2.5} strokeLinecap="round" opacity={0} style={{ stroke: ACTIVE }}>
                        <animate attributeName="opacity" {...pulse(timing.travel, timing.duration)} />
                    </path>
                    {flow && (
                        <g opacity={0} aria-hidden="true">
                            <flow.Token />
                            <animateMotion
                                path={edgePath}
                                dur={`${timing.duration}s`}
                                repeatCount="indefinite"
                                calcMode="linear"
                                keyPoints="0;0;1;1"
                                keyTimes={`0;${timing.travel[0].toFixed(4)};${timing.travel[1].toFixed(4)};1`}
                            />
                            <animate attributeName="opacity" {...pulse(timing.travel, timing.duration)} />
                        </g>
                    )}
                </g>
            )}

            {index === 0 && (
                <TypedBubble
                    nodeId={props.source}
                    side="before"
                    tone="question"
                    timing={timing?.question ? { typed: timing.question, duration: timing.duration } : null}
                />
            )}
            {index >= 0 && index === count - 1 && (
                <TypedBubble
                    nodeId={props.target}
                    side="after"
                    tone="answer"
                    timing={timing?.answer ? { typed: timing.answer, duration: timing.duration } : null}
                />
            )}

            {!timing && flow && (
                <g transform={`translate(${labelX} ${labelY})`} aria-hidden="true">
                    <flow.Token />
                </g>
            )}

            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={HIT_WIDTH}
                strokeLinecap="round"
                style={{ cursor: "pointer", pointerEvents: "stroke" }}
                onClick={props.onToggle}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
            />

            {hovered && flow && (
                <EdgeLabelRenderer>
                    <Box
                        position="absolute"
                        transform={`translate(${labelX + 32}px, ${labelY}px) translateY(-50%)`}
                        bg="surfaceCard"
                        color="textBody"
                        borderWidth="1px"
                        borderColor="borderDefault"
                        px={3}
                        py={2}
                        borderRadius="10px"
                        boxShadow="xl"
                        maxW="260px"
                        pointerEvents="none"
                        zIndex={10}
                    >
                        <Text fontSize="12px" fontWeight={700} color="textPrimary">
                            {flow.title}
                        </Text>
                        <Text fontSize="11px">
                            {flow.detail}
                        </Text>
                    </Box>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
