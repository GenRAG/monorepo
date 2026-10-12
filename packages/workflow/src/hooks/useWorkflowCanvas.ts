import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EMPTY_SETTING_NODE_TYPE, withEmptySettingNodes } from "../graph/create-flow-node";
import { type Edge, type NodeChange } from "@xyflow/react";
import { useFlowTypes } from "./useFlowTypes";
import { UseWorkflowNodesOptions } from "./useWorkflowNodes";
import { type LayoutStrategy } from "../layout";
import type { AppNode, NodeComponentType } from "../types/app-node";
import type { WorkflowRegistry } from "../types/task";
import { TaskRegistry } from "../graph/task/registry";

export interface UseWorkflowCanvasOptions {
    initialNodes?: AppNode[];
    initialEdges?: Edge[];
    readonly?: boolean;
    layout?: LayoutStrategy;
    /** Tasks available in the builder (default: TaskRegistry). */
    registry?: WorkflowRegistry;

    nodeComponent?: NodeComponentType;

    onNodeClick?: (nodeId: string) => void;
    onEdgeClick?: () => void;
    onInstructionSave?: (nodeId: string) => void;
    onMutation?: () => void;
}

type EmptyNodeOverride = Partial<Pick<AppNode, "position" | "measured" | "dragging">>;

export function useWorkflowCanvas(options: UseWorkflowCanvasOptions = {}) {
    const {
        nodeComponent,
        onNodeClick,
        onEdgeClick,
        onInstructionSave,
        onMutation,
        initialNodes,
        initialEdges,
        readonly,
        layout,
        registry = TaskRegistry,
    } = options;

    const workflowNodesOptions: UseWorkflowNodesOptions = {
        initialNodes,
        initialEdges,
        readonly,
        layout,
        registry,
    };

    const { edgeTypes, nodeTypes, workflow } = useFlowTypes({ onEdgeClick, onNodeClick, onInstructionSave, onMutation, nodeComponent, workflowNodesOptions });

    const canvas = useMemo(
        () => withEmptySettingNodes(workflow.nodes, workflow.edges, layout, registry),
        [workflow.nodes, workflow.edges, layout, registry],
    );

    // Display-only nodes are not in the nodes state: what ReactFlow measures and drags on them is kept here.
    const [emptyNodeOverrides, setEmptyNodeOverrides] = useState<Record<string, EmptyNodeOverride>>({});
    const canvasNodes = useMemo(
        () =>
            canvas.nodes.map((n) =>
                n.type === EMPTY_SETTING_NODE_TYPE && emptyNodeOverrides[n.id] ? { ...n, ...emptyNodeOverrides[n.id] } : n,
            ),
        [canvas.nodes, emptyNodeOverrides],
    );

    const emptyIdsRef = useRef(new Set<string>());
    emptyIdsRef.current = new Set(canvas.nodes.filter((n) => n.type === EMPTY_SETTING_NODE_TYPE).map((n) => n.id));

    // A node that comes back (dataset added then removed) starts again next to its parent, not where it was dragged.
    useEffect(() => {
        setEmptyNodeOverrides((prev) => {
            const kept = Object.entries(prev).filter(([id]) => emptyIdsRef.current.has(id));
            return kept.length === Object.keys(prev).length ? prev : Object.fromEntries(kept);
        });
    }, [canvas.nodes]);

    const { onNodesChange: onGraphNodesChange } = workflow;
    const onNodesChange = useCallback(
        (changes: NodeChange<AppNode>[]) => {
            const isEmptyNode = (c: NodeChange<AppNode>) => "id" in c && emptyIdsRef.current.has(c.id);
            const emptyChanges = changes.filter(isEmptyNode);
            if (emptyChanges.length > 0) {
                setEmptyNodeOverrides((prev) => {
                    const next = { ...prev };
                    for (const c of emptyChanges) {
                        if (c.type === "position" && c.position) {
                            next[c.id] = { ...next[c.id], position: c.position, dragging: c.dragging };
                        } else if (c.type === "dimensions" && c.dimensions) {
                            next[c.id] = { ...next[c.id], measured: c.dimensions };
                        }
                    }
                    return next;
                });
            }
            onGraphNodesChange(changes.filter((c) => !isEmptyNode(c)));
        },
        [onGraphNodesChange],
    );

    return {
        ...workflow,
        onNodesChange,
        /** What `<ReactFlow>` displays: the graph plus the display-only empty settings. Save `nodes` / `edges`. */
        canvasNodes,
        canvasEdges: canvas.edges,
        nodeTypes,
        edgeTypes,
    };
}
