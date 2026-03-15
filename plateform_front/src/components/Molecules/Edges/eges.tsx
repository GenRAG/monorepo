import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { useMemo } from "react";

interface GenEdgeProps extends EdgeProps {
    onToggle: () => void;
}

export default function GenEdge(props: GenEdgeProps) {
    const [edgePath] = getSmoothStepPath(props);

    const edgeId = useMemo(() => `edge-${props.id}`, [props.id]);

    return (
        <>
            <svg style={{ position: "absolute", top: 0, left: 0 }}>
                <defs>
                    <marker
                        className="react-flow__arrowhead"
                        id="selected-marker"
                        markerWidth="20"
                        markerHeight="20"
                        viewBox="-10 -10 20 20"
                        markerUnits="userSpaceOnUse"
                        orient="auto-start-reverse"
                        refX="0"
                        refY="0"
                    >
                        <polyline
                            className="arrowclosed"
                            style={{
                                strokeWidth: 1,
                                stroke: "#FFCC00",
                                fill: "#FFCC00",
                            }}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points="-5,-4 0,0 -5,4 -5,-4"
                        />
                    </marker>
                </defs>
            </svg>
            <BaseEdge
                id={edgeId}
                path={edgePath}
                markerEnd={props.markerEnd}
                style={{
                    ...props.style,
                    stroke: "rgb(50, 216, 172)",
                    strokeWidth: 2,
                    strokeDasharray: "none",
                }}
            />

            <g>
                <path
                    id={`motion-path-${props.id}`}
                    d={edgePath}
                    fill="none"
                    visibility="hidden"
                />
                <circle r="6" fill="#34D3A9">
                    <animateMotion dur="5s" repeatCount="indefinite">
                        <mpath href={`#motion-path-${props.id}`} />
                    </animateMotion>
                    <animate
                        attributeName="opacity"
                        values="0.4;1;1;0.8;0.3;0"
                        keyTimes="0;0.3;0.7;0.85;0.95;1"
                        dur="5s"
                        repeatCount="indefinite"
                    />
                </circle>
            </g>
            <style>{`
            @keyframes flowEdge {
            0% {
                stroke-dashoffset: 0;
                opacity: 0.6;
            }
            50% {
                opacity: 1;
            }
            100% {
                stroke-dashoffset: -35;
                opacity: 0.6;
            }
        }
      `}</style>
        </>
    );
}
