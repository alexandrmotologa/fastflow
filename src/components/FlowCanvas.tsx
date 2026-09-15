import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFlowStore } from '../store/useFlowStore';
import { TriggerNode } from './nodes/TriggerNode';
import { TransformNode } from './nodes/TransformNode';
import { ActionNode } from './nodes/ActionNode';
import { LogicNode } from './nodes/LogicNode';
import { OutputNode } from './nodes/OutputNode';
import { PulseAnimatedEdge } from './edges/PulseAnimatedEdge';
import { NodeSubtype } from '../engine/types';

export const FlowCanvas: React.FC = () => {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const onNodesChange = useFlowStore((state) => state.onNodesChange);
  const onEdgesChange = useFlowStore((state) => state.onEdgesChange);
  const onConnect = useFlowStore((state) => state.onConnect);
  const selectNode = useFlowStore((state) => state.selectNode);
  const addNode = useFlowStore((state) => state.addNode);

  const { screenToFlowPosition } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      triggerNode: TriggerNode,
      transformNode: TransformNode,
      actionNode: ActionNode,
      logicNode: LogicNode,
      outputNode: OutputNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      pulseEdge: PulseAnimatedEdge,
    }),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const subtype = event.dataTransfer.getData('application/fastflow-node') as NodeSubtype;
      if (!subtype) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(subtype, position);
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div
      className="w-full h-full flex-1 relative bg-[#07090e]"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'pulseEdge',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#1e293b"
          className="opacity-40"
        />
        <Controls className="!bg-slate-900 !border-slate-800 !shadow-2xl !rounded-xl !p-1 [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-300 hover:[&>button]:!bg-slate-700" />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'triggerNode':
                return '#10b981';
              case 'transformNode':
                return '#0ea5e9';
              case 'actionNode':
                return '#6366f1';
              case 'logicNode':
                return '#f59e0b';
              case 'outputNode':
                return '#06b6d4';
              default:
                return '#64748b';
            }
          }}
          maskColor="rgba(7, 9, 14, 0.75)"
          className="!bg-slate-950 !border-slate-800 !rounded-xl !shadow-2xl overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
};
