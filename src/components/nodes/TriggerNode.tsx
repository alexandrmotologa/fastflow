import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Radio, CalendarClock, Webhook } from 'lucide-react';
import { FastFlowNodeData } from '../../engine/types';
import { BaseNode } from './BaseNode';

export const TriggerNode: React.FC<NodeProps> = (props) => {
  const data = props.data as FastFlowNodeData;

  const isWebhook = data.subtype === 'webhook';
  const icon = isWebhook ? (
    <Webhook className="w-4 h-4" />
  ) : (
    <CalendarClock className="w-4 h-4" />
  );

  return (
    <BaseNode
      id={props.id}
      data={data}
      selected={props.selected}
      icon={icon}
      accentColor="#10b981"
      hasInputHandle={false}
      hasOutputHandle={true}
    >
      <div className="space-y-1">
        {isWebhook && (
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] truncate">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>{data.config?.endpoint || '/webhook'}</span>
          </div>
        )}
        {data.subtype === 'cron' && (
          <div className="text-slate-300 font-mono text-[11px]">
            Schedule: <span className="text-emerald-400">{data.config?.cronExpression}</span>
          </div>
        )}
        <div className="text-slate-500 text-[11px] line-clamp-1">
          {data.description || 'Starts workflow execution wave'}
        </div>
      </div>
    </BaseNode>
  );
};
