import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
} from 'lucide-react';
import { FastFlowNodeData, NodeStatus } from '../../engine/types';
import { useFlowStore } from '../../store/useFlowStore';

interface BaseNodeProps {
  id: string;
  data: FastFlowNodeData;
  selected?: boolean;
  icon: React.ReactNode;
  accentColor: string;
  hasInputHandle?: boolean;
  hasOutputHandle?: boolean;
  outputHandles?: Array<{ id: string; label: string; color: string; positionOffset?: number }>;
  children?: React.ReactNode;
}

const statusConfig: Record<
  NodeStatus,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  idle: {
    label: 'IDLE',
    badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
    icon: <Clock className="w-3 h-3" />,
  },
  running: {
    label: 'RUNNING',
    badgeClass: 'bg-blue-950/80 text-blue-400 border-blue-500/60 animate-pulse',
    icon: <Activity className="w-3 h-3 animate-spin" />,
  },
  success: {
    label: 'SUCCESS',
    badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  failed: {
    label: 'FAILED',
    badgeClass: 'bg-rose-950/80 text-rose-400 border-rose-500/50',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  skipped: {
    label: 'SKIPPED',
    badgeClass: 'bg-slate-900 text-slate-500 border-slate-800',
    icon: <Clock className="w-3 h-3" />,
  },
};

export const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  data,
  selected,
  icon,
  accentColor,
  hasInputHandle = true,
  hasOutputHandle = true,
  outputHandles,
  children,
}) => {
  const selectNode = useFlowStore((state) => state.selectNode);
  const deleteNode = useFlowStore((state) => state.deleteNode);

  const statusInfo = statusConfig[data.status] || statusConfig.idle;

  return (
    <div
      onClick={() => selectNode(id)}
      className={`group relative rounded-xl border bg-slate-900/95 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer min-w-[220px] max-w-[280px] ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-blue-500/10'
          : data.status === 'running'
          ? 'border-blue-400 shadow-lg shadow-blue-500/20'
          : data.status === 'failed'
          ? 'border-rose-500/80 shadow-rose-500/10'
          : data.status === 'success'
          ? 'border-emerald-500/50 hover:border-emerald-400'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Input Handle */}
      {hasInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-slate-700 !border-2 !border-slate-400 hover:!bg-blue-400 transition-colors -ml-1.5"
        />
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-inner"
            style={{ backgroundColor: accentColor }}
          >
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
              {data.label}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              {data.subtype.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Delete node quick icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity rounded hover:bg-slate-800"
          title="Delete node"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body content */}
      <div className="p-3 text-xs text-slate-400 space-y-2">
        {children}

        {/* Status and timing footer */}
        <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800/50">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono font-medium ${statusInfo.badgeClass}`}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </span>

          {data.durationMs !== undefined && (
            <span className="text-slate-500 font-mono text-[10px]">
              {data.durationMs}ms
            </span>
          )}
        </div>
      </div>

      {/* Default Single Output Handle */}
      {hasOutputHandle && !outputHandles && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-slate-700 !border-2 !border-blue-400 hover:!bg-blue-300 transition-colors -mr-1.5"
        />
      )}

      {/* Multi-Handle Output (e.g. Conditional branch true/false) */}
      {outputHandles &&
        outputHandles.map((handle, idx) => {
          const topPercent = 35 + idx * 30;
          return (
            <div
              key={handle.id}
              className="absolute right-0 flex items-center gap-1 translate-x-full pr-1"
              style={{ top: `${topPercent}%` }}
            >
              <Handle
                id={handle.id}
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !border-2 hover:scale-125 transition-transform"
                style={{
                  backgroundColor: handle.color,
                  borderColor: '#0f172a',
                  top: `${topPercent}%`,
                }}
              />
              <span
                className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 border border-slate-700 ml-2"
                style={{ color: handle.color }}
              >
                {handle.label}
              </span>
            </div>
          );
        })}
    </div>
  );
};
