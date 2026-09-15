import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Database, MessageSquare, ArrowDownToLine } from 'lucide-react';
import { FastFlowNodeData } from '../../engine/types';
import { BaseNode } from './BaseNode';

export const OutputNode: React.FC<NodeProps> = (props) => {
  const data = props.data as FastFlowNodeData;

  const isSlack = data.subtype === 'output_slack';
  const icon = isSlack ? (
    <MessageSquare className="w-4 h-4" />
  ) : (
    <Database className="w-4 h-4" />
  );

  return (
    <BaseNode
      id={props.id}
      data={data}
      selected={props.selected}
      icon={icon}
      accentColor="#06b6d4"
      hasInputHandle={true}
      hasOutputHandle={false}
    >
      <div className="space-y-1">
        {isSlack ? (
          <div className="text-[11px] font-mono text-cyan-300 truncate">
            {data.config?.channel || '#general'}
          </div>
        ) : (
          <div className="text-[11px] font-mono text-cyan-300 truncate">
            Table: {data.config?.targetTable || 'records'}
          </div>
        )}
        <div className="text-slate-500 text-[11px] flex items-center gap-1">
          <ArrowDownToLine className="w-3 h-3 text-cyan-500" />
          <span>{data.status === 'success' ? 'Terminal sink reached' : 'Terminal output'}</span>
        </div>
      </div>
    </BaseNode>
  );
};
