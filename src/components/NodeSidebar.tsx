import React, { useState } from 'react';
import {
  Search,
  Webhook,
  CalendarClock,
  Binary,
  Regex,
  Code2,
  Sparkles,
  Globe,
  GitFork,
  MessageSquare,
  Database,
  Plus,
} from 'lucide-react';
import { getAllNodeDefinitions } from '../engine/registry';
import { NodeCategory, NodeDefinition, NodeSubtype } from '../engine/types';
import { useFlowStore } from '../store/useFlowStore';

const iconMap: Record<NodeSubtype, React.ReactNode> = {
  webhook: <Webhook className="w-4 h-4 text-emerald-400" />,
  cron: <CalendarClock className="w-4 h-4 text-emerald-400" />,
  transform_json: <Binary className="w-4 h-4 text-cyan-400" />,
  transform_regex: <Regex className="w-4 h-4 text-cyan-400" />,
  transform_code: <Code2 className="w-4 h-4 text-emerald-400" />,
  action_llm: <Sparkles className="w-4 h-4 text-indigo-400" />,
  action_http: <Globe className="w-4 h-4 text-indigo-400" />,
  control_switch: <GitFork className="w-4 h-4 text-amber-400" />,
  output_slack: <MessageSquare className="w-4 h-4 text-cyan-400" />,
  output_sql: <Database className="w-4 h-4 text-cyan-400" />,
};

const categoryLabels: Record<NodeCategory, string> = {
  trigger: 'TRIGGERS & INGESTION',
  transform: 'TRANSFORMS & PARSING',
  action: 'ACTIONS & AI ENRICHMENT',
  logic: 'CONTROL FLOW & LOGIC',
  output: 'OUTPUTS & SINKS',
};

export const NodeSidebar: React.FC = () => {
  const [search, setSearch] = useState('');
  const addNode = useFlowStore((state) => state.addNode);

  const allDefinitions = getAllNodeDefinitions();

  const filtered = allDefinitions.filter(
    (def) =>
      def.displayName.toLowerCase().includes(search.toLowerCase()) ||
      def.description.toLowerCase().includes(search.toLowerCase())
  );

  const categories: NodeCategory[] = ['trigger', 'transform', 'action', 'logic', 'output'];

  const onDragStart = (event: React.DragEvent, subtype: NodeSubtype) => {
    event.dataTransfer.setData('application/fastflow-node', subtype);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex flex-col shrink-0 z-10 select-none">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Categorized node lists */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((category) => {
          const categoryNodes = filtered.filter((n) => n.category === category);
          if (categoryNodes.length === 0) return null;

          return (
            <div key={category} className="space-y-1.5">
              <h4 className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 px-1">
                {categoryLabels[category]}
              </h4>

              <div className="space-y-1">
                {categoryNodes.map((item: NodeDefinition) => (
                  <div
                    key={item.subtype}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.subtype)}
                    onClick={() => addNode(item.subtype)}
                    className="group flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing hover:shadow-md"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1 rounded bg-slate-800/90 border border-slate-700/50 shrink-0">
                        {iconMap[item.subtype]}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                          {item.displayName}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate">
                          {item.description}
                        </span>
                      </div>
                    </div>

                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-opacity shrink-0 ml-1"
                      title="Add to canvas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2.5 border-t border-slate-800/60 text-[11px] text-slate-500 text-center font-mono">
        Drag or click to insert into canvas
      </div>
    </aside>
  );
};
