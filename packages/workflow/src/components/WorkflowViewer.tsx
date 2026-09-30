import React, { useMemo } from 'react';
import type { PipelineBlock, WorkflowDefinition } from '../types/pipeline';
import { DEFAULT_LAYOUT } from '../layout';
import { pipelineToWorkflow } from '../utils/pipeline-to-workflow';
import { sanitizeWorkflowEdges } from '../utils/sanitize';
import { WorkflowCanvas, type WorkflowCanvasProps } from './WorkflowCanvas';

export interface WorkflowViewerProps
    extends Omit<WorkflowCanvasProps, 'initialNodes' | 'initialEdges' | 'readonly' | 'onInstructionSave' | 'onMutation'> {
    /** RAG pipeline to draw (`definition.blocks`, the config sent to the engine). */
    pipeline?: readonly PipelineBlock[];
    /**
     * A definition saved by the builder. Its graph (with the positions chosen by the user) wins over
     * `pipeline`; when it has no nodes, its `blocks` are drawn instead.
     */
    definition?: Partial<WorkflowDefinition> | null;
}

let graphVersion = 0;

/**
 * Read-only drawing of a RAG workflow, from a builder definition or from a bare pipeline config:
 *
 * ```tsx
 * <WorkflowViewer pipeline={agent.workflow.definition.blocks} layout={HORIZONTAL} fitView>
 *   <Background />
 * </WorkflowViewer>
 * ```
 *
 * Layout strategies are compared by `name`: passing a new instance on every render does not redraw.
 * Throws `UnsupportedPipelineBlockError` on an unknown block type (catch it with an error boundary).
 */
export const WorkflowViewer = ({ pipeline, definition, layout, ...canvasProps }: WorkflowViewerProps) => {
    const layoutName = (layout ?? DEFAULT_LAYOUT).name;

    const graph = useMemo(() => {
        graphVersion += 1;
        const { nodes, edges } = definition?.nodes?.length
            ? sanitizeWorkflowEdges(definition.nodes, definition.edges ?? [])
            : pipelineToWorkflow(pipeline ?? definition?.blocks ?? [], { layout });
        return { nodes, edges, key: graphVersion };
        // `layout` is identified by its name (see above), not by identity.
    }, [pipeline, definition, layoutName]);

    // The canvas keeps its initial nodes in state: remount it when the input changes.
    return (
        <WorkflowCanvas
            key={graph.key}
            {...canvasProps}
            layout={layout}
            initialNodes={graph.nodes}
            initialEdges={graph.edges}
            readonly
        />
    );
};

export default WorkflowViewer;
