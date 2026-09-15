import React, { useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  StepForward,
  Download,
  Upload,
  Square,
  Terminal,
  Layers,
  Github,
  Zap,
  Undo2,
  Redo2,
  Sparkles,
  FileCode2,
} from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';
import { builtInTemplates } from '../templates';

export const Header: React.FC = () => {
  const activeTemplateId = useFlowStore((state) => state.activeTemplateId);
  const loadTemplate = useFlowStore((state) => state.loadTemplate);
  const runStatus = useFlowStore((state) => state.runStatus);
  const currentStageIndex = useFlowStore((state) => state.currentStageIndex);
  const totalStages = useFlowStore((state) => state.totalStages);
  const simulationSpeed = useFlowStore((state) => state.simulationSpeed);
  const setSimulationSpeed = useFlowStore((state) => state.setSimulationSpeed);
  const runSimulation = useFlowStore((state) => state.runSimulation);
  const stepSimulation = useFlowStore((state) => state.stepSimulation);
  const stopSimulation = useFlowStore((state) => state.stopSimulation);
  const resetWorkflowStatus = useFlowStore((state) => state.resetWorkflowStatus);
  const isDebuggerOpen = useFlowStore((state) => state.isDebuggerOpen);
  const toggleDebugger = useFlowStore((state) => state.toggleDebugger);
  const exportWorkflow = useFlowStore((state) => state.exportWorkflow);
  const exportStandaloneScript = useFlowStore((state) => state.exportStandaloneScript);
  const importWorkflow = useFlowStore((state) => state.importWorkflow);
  const autoLayout = useFlowStore((state) => state.autoLayout);
  const undo = useFlowStore((state) => state.undo);
  const redo = useFlowStore((state) => state.redo);
  const past = useFlowStore((state) => state.past);
  const future = useFlowStore((state) => state.future);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut support for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting inside inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleExport = () => {
    const jsonStr = exportWorkflow();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fastflow_workflow_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTs = () => {
    const tsCode = exportStandaloneScript();
    const blob = new Blob([tsCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fastflow_pipeline_${Date.now()}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importWorkflow(content);
        if (!success) {
          alert('Invalid FastFlow workflow JSON file.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
      {/* Brand & Templates */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-4 h-4 text-white fill-current" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100 tracking-tight">FastFlow</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                DAG STUDIO
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Visual Automation Engine</span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-slate-800" />

        {/* Template switcher */}
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={activeTemplateId}
            onChange={(e) => loadTemplate(e.target.value)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            {builtInTemplates.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Playback / Simulation Controls */}
      <div className="flex items-center gap-2">
        {runStatus === 'running' ? (
          <button
            onClick={stopSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-md shadow-rose-600/20 transition-all active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            onClick={() => runSimulation()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Pipeline</span>
          </button>
        )}

        <button
          onClick={() => stepSimulation()}
          disabled={runStatus === 'running'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
          title="Execute next topological wave"
        >
          <StepForward className="w-3.5 h-3.5" />
          <span>Step</span>
        </button>

        <button
          onClick={resetWorkflowStatus}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Reset graph execution state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-800" />

        {/* Undo / Redo Controls */}
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          title={`Undo change (Ctrl+Z) [${past.length} in history]`}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={redo}
          disabled={future.length === 0}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          title={`Redo change (Ctrl+Y) [${future.length} available]`}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => autoLayout('LR')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
          title="Auto-organize graph layout using Dagre"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Auto Layout</span>
        </button>

        {/* Speed presets */}
        <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px] font-mono">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSimulationSpeed(s)}
              className={`px-2 py-0.5 rounded transition-colors ${
                simulationSpeed === s
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Stage Wave Pill */}
        {totalStages > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="text-slate-500">Stage:</span>
            <span className="text-blue-400 font-semibold">{currentStageIndex}</span>
            <span className="text-slate-600">/</span>
            <span>{totalStages}</span>
          </div>
        )}
      </div>

      {/* Right: Actions, Import/Export, GitHub */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleImportClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-colors"
          title="Import Workflow JSON"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import</span>
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-colors"
          title="Export Workflow JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        <button
          onClick={handleExportTs}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-emerald-300 text-xs transition-colors"
          title="Export as Standalone Executable TypeScript Script"
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Export TS</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-800" />

        <button
          onClick={toggleDebugger}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
            isDebuggerOpen
              ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
          }`}
          title="Toggle execution console"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Console</span>
        </button>

        <a
          href="https://github.com/alexandrmotologa/fastflow"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          title="View GitHub repository"
        >
          <Github className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
