import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getSmoothStepPath,
    useReactFlow,
} from "@xyflow/react";
import { Plus } from "lucide-react";
import { Button, Box } from "@chakra-ui/react";
import { useMemo } from "react";

interface GenEdgeProps extends EdgeProps {
    onToggle: () => void;
}

export default function GenEdge(props: GenEdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath(props);

    const edgeId = useMemo(() => `edge-${props.id}`, [props.id]);
    const { fitView } = useReactFlow();

    return (
        <>
            <BaseEdge
                id={edgeId}
                path={edgePath}
                markerEnd={props.markerEnd}
                style={{
                    ...props.style,
                    stroke: "#E7E7E7",
                    strokeWidth: 1,
                }}
            />

            <path
                id={`flow-path-${props.id}`}
                d={edgePath}
                fill="none"
                stroke="#34D3A9"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="15 20"
                filter={`url(#glow-${props.id})`}
                style={{
                    animation: "flowEdge 2.5s linear infinite",
                }}
            />

            <g>
                <path
                    id={`motion-path-${props.id}`}
                    d={edgePath}
                    fill="none"
                    visibility="hidden"
                />
                <circle
                    r="6"
                    fill="#34D3A9"
                >
                    <animateMotion
                        dur="5s"
                        repeatCount="indefinite"
                    >
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
            <EdgeLabelRenderer>
                <Box
                    position="absolute"
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: "all",
                    }}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        bg="white"
                        borderRadius="999px"
                        p="2"
                        border="1px solid #E7E7E7"
                        minW="32px"
                        h="32px"
                        onClick={(e) => {
                            props.onToggle();
                            setTimeout(() => {
                                fitView({ duration: 500 });
                            }, 500);
                            e.stopPropagation();
                        }}
                    >
                        <Plus size={16} color="#374151" />
                    </Button>
                </Box>
            </EdgeLabelRenderer>
        </>
    );
}