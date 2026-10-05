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

            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                style={{ cursor: "pointer", pointerEvents: "all" }}
                onClick={props.onToggle}
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
        </>
    );
}
