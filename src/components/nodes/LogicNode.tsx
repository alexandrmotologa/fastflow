import React from 'react';
import { NodeProps } from '@xyflow/react';
import { GitFork } from 'lucide-react';
import { FastFlowNodeData } from '../../engine/types';
import { BaseNode } from './BaseNode';

export const LogicNode: React.FC<NodeProps> = (props) => {
  const data = props.data as FastFlowNodeData;

  const outputHandles = [
    { id: 'true', label: 'TRUE', color: '#10b981' },
    { id: 'false', label: 'FALSE', color: '#f43f5e' },
  ];

  return (
    <BaseNode
      id={props.id}
      data={data}
      selected={props.selected}
      icon={<GitFork className="w-4 h-4" />}
      accentColor="#f59e0b"
      hasInputHandle={true}
      hasOutputHandle={false}
      outputHandles={outputHandles}
    >
      <div className="space-y-1">
        <div className="text-[11px] font-mono text-amber-300 truncate bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
          {data.config?.field || 'score'} {data.config?.operator || '>='}{' '}
          {data.config?.threshold ?? '80'}
        </div>
        <div className="text-slate-500 text-[11px] flex items-center justify-between">
          <span>Branch condition</span>
          {data.outputs?._branchSelected && (
            <span
              className={`font-mono font-semibold px-1 rounded text-[10px] ${
                data.outputs._branchSelected === 'true'
                  ? 'text-emerald-400 bg-emerald-950/60'
                  : 'text-rose-400 bg-rose-950/60'
              }`}
            >
              ➔ {data.outputs._branchSelected.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </BaseNode>
  );
};
