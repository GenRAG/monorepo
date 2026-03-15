import React, { useEffect } from 'react';
import { ReactFlow, Background, BackgroundVariant, useNodesInitialized, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowTypes } from '../hooks/useFlowTypes';
import { WorkflowPreset, useWorkflowNodes } from '../hooks/useWorkflowNodes';

export interface WorkflowBuilderProps {
  interactive?: boolean;
  preset?: WorkflowPreset;
}

const ShowcaseViewportController = ({ interactive }: { interactive: boolean }) => {
  const nodesInitialized = useNodesInitialized();
  const { fitView, getZoom, zoomTo } = useReactFlow();

  useEffect(() => {
    if (interactive || !nodesInitialized) return;


  }, [fitView, getZoom, interactive, nodesInitialized, zoomTo]);

  return null;
};

export const WorkflowBuilder = ({ interactive = true, preset }: WorkflowBuilderProps) => {
  const resolvedPreset: WorkflowPreset = preset ?? (interactive ? "default" : "showcase");
  const fitViewOptions = interactive
    ? { padding: 0.7 }
    : { padding: 0.12, minZoom: 0.35, maxZoom: 2 }

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onDragOver,
    onDrop,
    onConnect,
  } = useWorkflowNodes({ preset: resolvedPreset });

  const { edgeTypes, nodeTypes } = useFlowTypes({ isVertical: true });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={interactive ? onNodesChange : undefined}
      onEdgesChange={interactive ? onEdgesChange : undefined}
      onDragOver={interactive ? onDragOver : undefined}
      onDrop={interactive ? onDrop : undefined}
      onConnect={interactive ? onConnect : undefined}
      nodesDraggable={interactive}
      nodesConnectable={interactive}
      elementsSelectable={interactive}
      panOnDrag={interactive}
      panOnScroll={interactive}
      zoomOnScroll={interactive}
      zoomOnPinch={interactive}
      zoomOnDoubleClick={interactive}
      preventScrolling={!interactive}
      disableKeyboardA11y={!interactive}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={fitViewOptions}
    >
      <ShowcaseViewportController interactive={interactive} />
      <Background variant={BackgroundVariant.Dots} gap={16} />
    </ReactFlow>
  );
};
