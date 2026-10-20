import { usePrefersReducedMotion } from "@chakra-ui/react";
import { BaseEdge, EdgeProps, getBezierPath, useStore } from "@xyflow/react";
import { useMemo } from "react";
import { flowNodeBeats, mainChainNodeIds } from "../../graph/flow-timeline";
import type { AppNode } from "../../types/app-node";
import { NodeHalo, pulse, themeColor, useSmilClock } from "./flow-data";
import "./edge-animations.css";

export default function SettingsEdge(props: EdgeProps) {
    const [edgePath] = getBezierPath(props);
    const edgeId = useMemo(() => `settings-edge-${props.id}`, [props.id]);
    const reducedMotion = usePrefersReducedMotion();

    // Place of the chain node that reads this setting, as a string so the edge re-renders only when it changes.
    const place = useStore((s) => {
        const ids = mainChainNodeIds(s.nodes as AppNode[], s.edges);
        return `${ids.indexOf(props.source)}/${ids.length - 1}`;
    });
    const [position, count] = place.split("/").map(Number);
    const animated = position >= 0 && !reducedMotion;
    const beats = animated ? flowNodeBeats(position, count) : null;
    const group = useSmilClock<SVGGElement>(animated, place);

    return (
        <>
            <BaseEdge
                id={edgeId}
                path={edgePath}
                markerEnd={props.markerEnd}
                style={{
                    ...props.style,
                    stroke: "rgb(129, 207, 186)",
                    strokeWidth: 2,
                    strokeDasharray: "8 8",
                    animation: "settingsEdgeFlow 1.5s linear infinite",
                }}
            />

            {/* While its node holds the data, the setting lights up and flows into the node. */}
            {beats && (
                <g key={place} ref={group}>
                    <NodeHalo nodeId={props.target} window={beats.settings} duration={beats.duration} />
                    <path d={edgePath} fill="none" strokeWidth={2.5} opacity={0} style={{ stroke: themeColor("iconAccent") }}>
                        <animate attributeName="opacity" {...pulse(beats.settings, beats.duration)} />
                    </path>
                    <circle r={4.5} opacity={0} style={{ fill: themeColor("iconAccent") }}>
                        <animateMotion
                            path={edgePath}
                            dur={`${beats.duration}s`}
                            repeatCount="indefinite"
                            calcMode="linear"
                            keyPoints="1;1;0;0"
                            keyTimes={`0;${beats.settings[0].toFixed(4)};${beats.settings[1].toFixed(4)};1`}
                        />
                        <animate attributeName="opacity" {...pulse(beats.settings, beats.duration)} />
                    </circle>
                </g>
            )}
        </>
    );
}
