import {
    BaseEdge,
    EdgeProps,
    getStraightPath,
    getBezierPath,
} from "@xyflow/react";
import { useMemo } from "react";

export default function SettingsEdge(props: EdgeProps) {
    const [edgePath] = getBezierPath(props);
    const edgeId = useMemo(() => `settings-edge-${props.id}`, [props.id]);

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
            <style>{`
                @keyframes settingsEdgeFlow {
                    0% { stroke-dashoffset: -16; }
                    100% { stroke-dashoffset: 0; }
                }
            `}</style>
        </>
    );
}
