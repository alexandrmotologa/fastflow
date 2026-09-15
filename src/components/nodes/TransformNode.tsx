import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Binary, Regex, Filter, Code2 } from 'lucide-react';
import { FastFlowNodeData } from '../../engine/types';
import { BaseNode } from './BaseNode';

export const TransformNode: React.FC<NodeProps> = (props) => {
  const data = props.data as FastFlowNodeData;

  const isCode = data.subtype === 'transform_code';
  const isRegex = data.subtype === 'transform_regex';

  const icon = isCode ? (
    <Code2 className="w-4 h-4 text-emerald-300" />
  ) : isRegex ? (
    <Regex className="w-4 h-4" />
  ) : (
    <Binary className="w-4 h-4" />
  );

  return (
    <BaseNode
      id={props.id}
      data={data}
      selected={props.selected}
      icon={icon}
      accentColor={isCode ? '#10b981' : '#0ea5e9'}
      hasInputHandle={true}
      hasOutputHandle={true}
    >
      <div className="space-y-1">
        {isCode ? (
          <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
            <Code2 className="w-3 h-3 text-emerald-400" />
            <span>JavaScript Sandbox</span>
          </div>
        ) : isRegex ? (
          <div className="text-[11px] font-mono text-cyan-300 truncate bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
            /{data.config?.pattern || '.*'}/
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-slate-300">
            <Filter className="w-3 h-3 text-cyan-400" />
            <span>Map & Normalize Fields</span>
          </div>
        )}
        <div className="text-slate-500 text-[11px] line-clamp-1">
          {data.outputs
            ? `Extracted ${Object.keys(data.outputs).length} attributes`
            : 'Awaiting upstream payload'}
        </div>
      </div>
    </BaseNode>
  );
};
