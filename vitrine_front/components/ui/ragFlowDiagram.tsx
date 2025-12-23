import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from '@/components/ui/customNode';

const nodeTypes = { custom: CustomNode };
const proOptions = { hideAttribution: true };

export function RAGFlowDiagram() {
  const [containerWidth, setContainerWidth] = useState(1200);

  const getNodePositions = (width: number) => {
    const nodeWidth = 240;
    const totalNodes = 3;
    const spacing = (width - nodeWidth * totalNodes) / (totalNodes + 1);
    return [
      { x: spacing, y: 120 },
      { x: spacing * 2 + nodeWidth, y: 240 },
      { x: spacing * 3 + nodeWidth * 2, y: 120 },
    ];
  };

  const [positions, setPositions] = useState(getNodePositions(containerWidth));

  const initialNodes = [
    { id: '1', type: 'custom', position: positions[0], data: { label: 'Query', description: 'User question', icon: 'Search' } },
    { id: '5', type: 'custom', position: positions[1], data: { label: 'LLM', description: 'Generation model', icon: 'Brain' } },
    { id: '6', type: 'custom', position: positions[2], data: { label: 'Response', description: 'Final answer', icon: 'CheckCircle' } },
  ];

  const initialEdges = [
    { id: 'e1-5', source: '1', target: '5', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } },
    { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.flow-container');
      if (container) {
        const width = container.clientWidth;
        setContainerWidth(width);
        const newPositions = getNodePositions(width);
        setNodes(nds => nds.map((node, idx) => ({ ...node, position: newPositions[idx] })));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setNodes]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-[500px] mb-8 relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden flow-container">
      <div 
        className="absolute inset-0 bg-white" 
        style={{
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          backgroundColor: 'rgba(255, 255, 255, 0.09)'
        }} 
      />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 60%)',
          mixBlendMode: 'overlay'
        }}
      />
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
            minZoom={0.3}
            maxZoom={1.2}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            panOnDrag={false}
            zoomOnDoubleClick={false}
            proOptions={proOptions}
        >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#f97316" className="opacity-20" />
        </ReactFlow>
        </div>


  );
}
