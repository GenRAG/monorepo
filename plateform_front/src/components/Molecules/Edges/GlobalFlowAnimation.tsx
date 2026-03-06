import { useReactFlow } from "@xyflow/react";
import { useMemo, useEffect, useState, useRef } from "react";
import { Edge, Node } from "@xyflow/react";

interface GlobalFlowAnimationProps {
    edges: Edge[];
    nodes: Node[];
    setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
}

export default function GlobalFlowAnimation({
    edges,
    nodes,
    setEdges,
}: GlobalFlowAnimationProps) {
    const { getEdges, getNodes } = useReactFlow();
    const [currentEdgeIndex, setCurrentEdgeIndex] = useState(0);
    const animationKeyRef = useRef(0);
    const previousActiveEdgeIdRef = useRef<string | null>(null);
    const setEdgesRef = useRef(setEdges);

    useEffect(() => {
        setEdgesRef.current = setEdges;
    }, [setEdges]);

    const sortedEdgeIds = useMemo(() => {
        const allEdges = edges.length > 0 ? edges : getEdges();
        const allNodes = nodes.length > 0 ? nodes : getNodes();

        const sorted = allEdges
            .map((edge) => {
                const sourceNode = allNodes.find((n) => n.id === edge.source);
                const targetNode = allNodes.find((n) => n.id === edge.target);

                if (!sourceNode || !targetNode) return null;

                const sourceX = sourceNode.position?.x || 0;
                const targetX = targetNode.position?.x || 0;
                const avgX = (sourceX + targetX) / 2;

                return {
                    id: edge.id,
                    avgX,
                };
            })
            .filter((edge) => edge !== null)
            .sort((a, b) => (a?.avgX || 0) - (b?.avgX || 0)) as Array<{
            id: string;
            avgX: number;
        }>;

        return sorted.map((e) => e.id);
    }, [nodes, getEdges, getNodes, edges]);

    useEffect(() => {
        if (sortedEdgeIds.length === 0) return;

        const currentEdgeId = sortedEdgeIds[currentEdgeIndex];
        if (!currentEdgeId) return;

        if (currentEdgeId === previousActiveEdgeIdRef.current) return;

        previousActiveEdgeIdRef.current = currentEdgeId;
        animationKeyRef.current += 1;

        setEdgesRef.current((prevEdges) => {
            return prevEdges.map((edge) => ({
                ...edge,
                data: {
                    ...edge.data,
                    isActive: edge.id === currentEdgeId,
                    animationKey:
                        edge.id === currentEdgeId
                            ? animationKeyRef.current
                            : undefined,
                },
            }));
        });
    }, [currentEdgeIndex, sortedEdgeIds]);

    useEffect(() => {
        if (sortedEdgeIds.length === 0) return;

        const interval = setInterval(() => {
            setCurrentEdgeIndex((prev) => (prev + 1) % sortedEdgeIds.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [sortedEdgeIds.length]);

    return null;
}
