import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { Database, Eye, X } from 'lucide-react';
import { useFlowStore } from '../../store/useFlowStore';

export const PulseAnimatedEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const activePulsingEdges = useFlowStore((state) => state.activePulsingEdges);
  const edgeData = useFlowStore((state) => state.edgeData[id]);
  const isPulsing = activePulsingEdges.has(id);
  const hasPayload = !!edgeData && Object.keys(edgeData).length > 0;

  return (
    <>
      {/* Background wider hit-test and glow path */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isPulsing ? '#38bdf8' : hasPayload ? '#0284c7' : '#334155',
          strokeWidth: isPulsing ? 3 : hasPayload ? 2.5 : 2,
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
        }}
      />

      {/* When active, render high-energy glowing particle pulse traveling along SVG path */}
      {isPulsing && (
        <>
          <path
            d={edgePath}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={4}
            strokeDasharray="12 12"
            className="animate-conduit-flow"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))',
            }}
          />
          <circle r="4" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }}>
            <animateMotion dur="0.8s" repeatCount="indefinite" path={edgePath} />
          </circle>
        </>
      )}

      {/* Interactive Midpoint Payload Badge & Inspector Popover */}
      {hasPayload && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan z-30"
          >
            <button
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-medium flex items-center gap-1 border shadow-lg transition-all ${
                isPopoverOpen
                  ? 'bg-blue-600 text-white border-blue-400 scale-105 ring-2 ring-blue-400/40'
                  : 'bg-slate-900/95 hover:bg-slate-800 text-sky-300 border-sky-500/50 hover:scale-105'
              }`}
              title="Inspect payload traveling through wire"
            >
              <Database className="w-2.5 h-2.5 text-sky-400" />
              <span>{Object.keys(edgeData).length} props</span>
            </button>

            {isPopoverOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-6 w-72 p-3 bg-slate-950/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md text-left z-50 animate-in fade-in zoom-in-95 duration-150 select-text">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                  <span className="text-[10px] font-mono text-sky-400 font-semibold flex items-center gap-1">
                    <Eye className="w-3 h-3" /> WIRE DATA PAYLOAD
                  </span>
                  <button
                    onClick={() => setIsPopoverOpen(false)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-slate-300 max-h-48 overflow-auto bg-slate-900/90 p-2 rounded border border-slate-800/80 leading-relaxed">
                  {JSON.stringify(edgeData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
