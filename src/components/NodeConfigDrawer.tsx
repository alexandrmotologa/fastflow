import React, { useState } from 'react';
import { X, Sliders, PlayCircle, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';

export const NodeConfigDrawer: React.FC = () => {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const nodes = useFlowStore((state) => state.nodes);
  const closeDrawer = useFlowStore((state) => state.closeDrawer);
  const updateNodeConfig = useFlowStore((state) => state.updateNodeConfig);
  const updateNodeLabel = useFlowStore((state) => state.updateNodeLabel);
  const deleteNode = useFlowStore((state) => state.deleteNode);

  const [activeTab, setActiveTab] = useState<'config' | 'outputs'>('config');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const { data } = selectedNode;
  const config = data.config || {};

  const handleConfigChange = (key: string, value: any) => {
    updateNodeConfig(selectedNode.id, { [key]: value });
  };

  return (
    <aside className="w-96 border-l border-slate-800 bg-slate-950/95 backdrop-blur-lg flex flex-col shrink-0 z-20 shadow-2xl transition-all select-none">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex flex-col gap-1 min-w-0 pr-2">
          <input
            type="text"
            value={data.label}
            onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
            className="bg-transparent font-semibold text-sm text-slate-100 border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-none px-0.5 py-0.5"
          />
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
              {data.subtype.replace('_', ' ')}
            </span>
            <span className="text-slate-500">ID: {selectedNode.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => deleteNode(selectedNode.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
            title="Delete node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('outputs')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'outputs'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Execution Output</span>
          {data.status === 'success' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'config' ? (
          <div className="space-y-4 text-xs">
            {/* Subtype-specific configurations */}
            {data.subtype === 'webhook' && (
              <>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    ENDPOINT URL
                  </label>
                  <input
                    type="text"
                    value={config.endpoint || ''}
                    onChange={(e) => handleConfigChange('endpoint', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    HTTP METHOD
                  </label>
                  <select
                    value={config.method || 'POST'}
                    onChange={(e) => handleConfigChange('method', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="GET">GET</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    MOCK INBOUND JSON PAYLOAD
                  </label>
                  <textarea
                    rows={8}
                    value={
                      typeof config.mockPayload === 'string'
                        ? config.mockPayload
                        : JSON.stringify(config.mockPayload, null, 2)
                    }
                    onChange={(e) => handleConfigChange('mockPayload', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
              </>
            )}

            {data.subtype === 'cron' && (
              <>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    CRON EXPRESSION
                  </label>
                  <input
                    type="text"
                    value={config.cronExpression || '*/15 * * * *'}
                    onChange={(e) => handleConfigChange('cronExpression', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    BATCH SIZE
                  </label>
                  <input
                    type="number"
                    value={config.batchSize || 100}
                    onChange={(e) => handleConfigChange('batchSize', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {data.subtype === 'transform_json' && (
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">
                  MAPPING TEMPLATE (JSON WITH {'{{path}}'})
                </label>
                <textarea
                  rows={8}
                  value={
                    typeof config.mapping === 'string'
                      ? config.mapping
                      : JSON.stringify(config.mapping, null, 2)
                  }
                  onChange={(e) => handleConfigChange('mapping', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            {data.subtype === 'transform_regex' && (
              <>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    SOURCE FIELD
                  </label>
                  <input
                    type="text"
                    value={config.sourceField || ''}
                    onChange={(e) => handleConfigChange('sourceField', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    REGEX PATTERN
                  </label>
                  <input
                    type="text"
                    value={config.pattern || ''}
                    onChange={(e) => handleConfigChange('pattern', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-cyan-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    CAPTURE FIELD NAMES (COMMA-SEPARATED)
                  </label>
                  <input
                    type="text"
                    value={config.captureFieldNames || ''}
                    onChange={(e) => handleConfigChange('captureFieldNames', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {data.subtype === 'action_llm' && (
              <>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    AI MODEL
                  </label>
                  <select
                    value={config.model || 'claude-3-5-sonnet-20241022'}
                    onChange={(e) => handleConfigChange('model', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet-20241022</option>
                    <option value="claude-3-7-sonnet">claude-3-7-sonnet</option>
                    <option value="gpt-4o">gpt-4o</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    SYSTEM INSTRUCTION
                  </label>
                  <textarea
                    rows={2}
                    value={config.systemPrompt || ''}
                    onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    USER PROMPT TEMPLATE
                  </label>
                  <textarea
                    rows={4}
                    value={config.userPromptTemplate || ''}
                    onChange={(e) => handleConfigChange('userPromptTemplate', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
              </>
            )}

            {data.subtype === 'action_http' && (
              <>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    TARGET URL
                  </label>
                  <input
                    type="text"
                    value={config.url || ''}
                    onChange={(e) => handleConfigChange('url', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    METHOD
                  </label>
                  <select
                    value={config.method || 'GET'}
                    onChange={(e) => handleConfigChange('method', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                  </select>
                </div>
              </>
            )}

            {data.subtype === 'control_switch' && (
              <>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    FIELD TO EVALUATE
                  </label>
                  <input
                    type="text"
                    value={config.field || 'qualificationScore'}
                    onChange={(e) => handleConfigChange('field', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1">
                      OPERATOR
                    </label>
                    <select
                      value={config.operator || '>='}
                      onChange={(e) => handleConfigChange('operator', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value=">=">&gt;= (Greater or Equal)</option>
                      <option value=">">&gt; (Greater)</option>
                      <option value="<=">&lt;= (Less or Equal)</option>
                      <option value="<">&lt; (Less)</option>
                      <option value="==">== (Equal)</option>
                      <option value="!=">!= (Not Equal)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono text-[11px] mb-1">
                      THRESHOLD
                    </label>
                    <input
                      type="text"
                      value={config.threshold ?? '80'}
                      onChange={(e) => handleConfigChange('threshold', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {data.subtype === 'output_slack' && (
              <>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    SLACK CHANNEL
                  </label>
                  <input
                    type="text"
                    value={config.channel || '#leads'}
                    onChange={(e) => handleConfigChange('channel', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    MESSAGE TEMPLATE
                  </label>
                  <textarea
                    rows={5}
                    value={config.template || ''}
                    onChange={(e) => handleConfigChange('template', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
              </>
            )}

            {data.subtype === 'output_sql' && (
              <>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    DATABASE TABLE
                  </label>
                  <input
                    type="text"
                    value={config.targetTable || 'leads'}
                    onChange={(e) => handleConfigChange('targetTable', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    CONFLICT KEY
                  </label>
                  <input
                    type="text"
                    value={config.conflictKey || 'id'}
                    onChange={(e) => handleConfigChange('conflictKey', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          /* Outputs Tab */
          <div className="space-y-4 text-xs">
            {/* Status Summary */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {data.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : data.status === 'failed' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                )}
                <span className="font-semibold text-slate-200 uppercase tracking-wide font-mono text-[11px]">
                  {data.status}
                </span>
              </div>

              {data.durationMs !== undefined && (
                <span className="text-slate-400 font-mono text-[11px]">
                  Execution Time: {data.durationMs}ms
                </span>
              )}
            </div>

            {data.error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 font-mono text-[11px]">
                {data.error}
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                LATEST OUTPUT DATA PAYLOAD
              </label>
              <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-72">
                {data.outputs
                  ? JSON.stringify(data.outputs, null, 2)
                  : '// No execution payload recorded yet.\n// Click "Run Pipeline" to simulate.'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
