import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Sparkles, Globe, Cpu } from 'lucide-react';
import { FastFlowNodeData } from '../../engine/types';
import { BaseNode } from './BaseNode';

export const ActionNode: React.FC<NodeProps> = (props) => {
  const data = props.data as FastFlowNodeData;

  const isLlm = data.subtype === 'action_llm';
  const icon = isLlm ? (
    <Sparkles className="w-4 h-4" />
  ) : (
    <Globe className="w-4 h-4" />
  );

  return (
    <BaseNode
      id={props.id}
      data={data}
      selected={props.selected}
      icon={icon}
      accentColor="#6366f1"
      hasInputHandle={true}
      hasOutputHandle={true}
    >
      <div className="space-y-1">
        {isLlm ? (
          <div className="flex items-center gap-1.5 text-indigo-300 font-mono text-[11px]">
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span className="truncate">{data.config?.model || 'claude-3-5-sonnet'}</span>
          </div>
        ) : (
          <div className="text-[11px] font-mono text-indigo-300 truncate">
            {data.config?.method || 'GET'} {data.config?.url || 'https://api.domain.com'}
          </div>
        )}
        <div className="text-slate-500 text-[11px] line-clamp-1">
          {data.outputs?.aiEnrichment?.accountClassification ||
            (data.status === 'success' ? 'Execution completed' : 'Ready for inputs')}
        </div>
      </div>
    </BaseNode>
  );
};
