import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Terminal,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';

export const ExecutionDebugger: React.FC = () => {
  const isDebuggerOpen = useFlowStore((state) => state.isDebuggerOpen);
  const toggleDebugger = useFlowStore((state) => state.toggleDebugger);
  const logs = useFlowStore((state) => state.logs);
  const traces = useFlowStore((state) => state.traces);
  const nodes = useFlowStore((state) => state.nodes);
  const selectNode = useFlowStore((state) => state.selectNode);

  const [activeTab, setActiveTab] = useState<'timeline' | 'logs' | 'payloads'>('timeline');
  const [isMaximized, setIsMaximized] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'logs') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  if (!isDebuggerOpen) {
    return (
      <div className="absolute bottom-4 left-72 z-10">
        <button
          onClick={toggleDebugger}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white shadow-xl backdrop-blur-md transition-all hover:border-slate-700"
        >
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>Show Console</span>
          {traces.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>
    );
  }

  // Aggregate stage statistics
  const stageGroups = traces.reduce((acc, trace) => {
    acc[trace.stage] = acc[trace.stage] || [];
    acc[trace.stage].push(trace);
    return acc;
  }, {} as Record<number, typeof traces>);

  return (
    <div
      className={`border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg flex flex-col shrink-0 z-20 transition-all select-none ${
        isMaximized ? 'h-96' : 'h-64'
      }`}
    >
      {/* Console Bar */}
      <div className="h-9 px-4 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-slate-300 font-medium">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>FASTFLOW DEBUG CONSOLE</span>
          </div>

          <div className="h-3 w-[1px] bg-slate-800" />

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-slate-800 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stage Timeline ({traces.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'logs'
                  ? 'bg-slate-800 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              System Logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('payloads')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'payloads'
                  ? 'bg-slate-800 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Graph Data Dumps
            </button>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2 text-slate-400">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:text-white transition-colors"
            title={isMaximized ? 'Minimize' : 'Maximize'}
          >
            {isMaximized ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={toggleDebugger}
            className="p-1 hover:text-white transition-colors"
            title="Close Console"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {/* Timeline View */}
        {activeTab === 'timeline' && (
          <div className="space-y-3">
            {Object.keys(stageGroups).length === 0 ? (
              <div className="text-slate-500 py-6 text-center">
                Ready for execution. Click "Run Pipeline" or "Step" in the header to execute
                and inspect DAG waves.
              </div>
            ) : (
              Object.entries(stageGroups).map(([stageIdx, stageTraces]) => (
                <div
                  key={stageIdx}
                  className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-blue-400">
                      TOPOLOGICAL WAVE {Number(stageIdx) + 1}
                    </span>
                    <span>{stageTraces.length} nodes resolved</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {stageTraces.map((trace) => (
                      <div
                        key={trace.id}
                        onClick={() => selectNode(trace.nodeId)}
                        className="p-2 rounded bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-200 truncate max-w-[140px]">
                            {trace.nodeLabel}
                          </span>
                          {trace.status === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : trace.status === 'skipped' ? (
                            <span className="text-[10px] text-slate-500">SKIP</span>
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{trace.subtype}</span>
                          <span>{trace.durationMs}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Logs View */}
        {activeTab === 'logs' && (
          <div className="space-y-1 text-[11px]">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`py-0.5 leading-relaxed ${
                  log.includes('ERROR') || log.includes('Failed')
                    ? 'text-rose-400'
                    : log.includes('Complete') || log.includes('success')
                    ? 'text-emerald-400'
                    : log.includes('Stage') || log.includes('Step')
                    ? 'text-blue-400'
                    : 'text-slate-400'
                }`}
              >
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}

        {/* Payloads View */}
        {activeTab === 'payloads' && (
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400">
              Active node outputs cached in runtime memory:
            </div>
            <pre className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-slate-300 text-[11px] overflow-x-auto">
              {JSON.stringify(
                nodes.map((n) => ({
                  id: n.id,
                  label: n.data.label,
                  subtype: n.data.subtype,
                  status: n.data.status,
                  outputs: n.data.outputs || null,
                })),
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
