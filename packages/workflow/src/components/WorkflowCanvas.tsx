import React from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    type FitViewOptions,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    useWorkflowCanvas,
    type UseWorkflowCanvasOptions,
} from '../hooks/useWorkflowCanvas';

export interface WorkflowCanvasProps extends UseWorkflowCanvasOptions {
    // ReactFlow visual config
    snapToGrid?: boolean;
    snapGrid?: [number, number];
    fitViewOptions?: FitViewOptions;
    fitView?: boolean;
    colorMode?: 'light' | 'dark';

    // Overlay content (Background, MiniMap, Controls, custom modals…)
    children?: React.ReactNode;

    // Styling
    className?: string;
    style?: React.CSSProperties;
}

const WorkflowCanvasInner = ({
    snapToGrid,
    snapGrid,
    fitViewOptions,
    fitView = true,
    colorMode,
    children,
    className,
    style,
    ...canvasOptions
}: WorkflowCanvasProps) => {
    const {
        nodes,
        edges,
        nodeTypes,
        edgeTypes,
        onNodesChange,
        onEdgesChange,
        onDragOver,
        readonly,
    } = useWorkflowCanvas(canvasOptions);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={readonly ? undefined : onNodesChange}
            onEdgesChange={readonly ? undefined : onEdgesChange}
            onDragOver={readonly ? undefined : onDragOver}
            nodesDraggable={!readonly}
            nodesConnectable={!readonly}
            elementsSelectable={!readonly}
            fitView={fitView}
            fitViewOptions={fitViewOptions}
            colorMode={colorMode}
            className={className}
            style={style}
        >
            {children}
        </ReactFlow>
    );
};

/**
 * Composable ReactFlow canvas.
 *
 * Unlike WorkflowBuilder (fully opaque), WorkflowCanvas accepts children
 * so consumers can inject Background, MiniMap, Controls, modals, etc.
 *
 * @example
 * ```tsx
 * <WorkflowCanvas nodeComponent={MyNodeComponent} isVertical readonly>
 *   <Background variant={BackgroundVariant.Lines} />
 *   <MiniMap />
 * </WorkflowCanvas>
 * ```
 */
export const WorkflowCanvas = (props: WorkflowCanvasProps) => (
    <ReactFlowProvider>
        <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
);
