import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
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
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const activePulsingEdges = useFlowStore((state) => state.activePulsingEdges);
  const isPulsing = activePulsingEdges.has(id);

  return (
    <>
      {/* Background wider hit-test and glow path */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isPulsing ? '#38bdf8' : '#334155',
          strokeWidth: isPulsing ? 3 : 2,
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
    </>
  );
};
