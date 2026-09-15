import React, { useState } from 'react';
import {
  X,
  Sliders,
  PlayCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CircleDot,
  RotateCw,
  ShieldAlert,
  Code2,
} from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';
import { WEBHOOK_PRESETS, WebhookPreset } from '../engine/presets';

export const NodeConfigDrawer: React.FC = () => {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const nodes = useFlowStore((state) => state.nodes);
  const closeDrawer = useFlowStore((state) => state.closeDrawer);
  const updateNodeConfig = useFlowStore((state) => state.updateNodeConfig);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const updateNodeLabel = useFlowStore((state) => state.updateNodeLabel);
  const toggleBreakpoint = useFlowStore((state) => state.toggleBreakpoint);
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
                    LOAD PRESET TEMPLATE
                  </label>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const preset = WEBHOOK_PRESETS.find((p: WebhookPreset) => p.id === e.target.value);
                      if (preset) {
                        handleConfigChange('mockPayload', JSON.stringify(preset.payload, null, 2));
                        handleConfigChange('endpoint', preset.endpoint);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2 cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Choose a Webhook Preset (Stripe, GitHub, Shopify, etc.) --
                    </option>
                    {WEBHOOK_PRESETS.map((p: WebhookPreset) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

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

            {data.subtype === 'transform_code' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    JAVASCRIPT CODE
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-1 rounded border border-emerald-800/50">
                    Safe Browser Sandbox
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={
                    config.code !== undefined
                      ? config.code
                      : '// Transform input payload and return an object\nreturn {\n  ...input,\n  processedAt: new Date().toISOString(),\n  status: "verified"\n};'
                  }
                  onChange={(e) => handleConfigChange('code', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-emerald-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                  placeholder="return { ...input, timestamp: Date.now() };"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Available in scope: <code className="text-slate-300">input</code> (upstream node data) and <code className="text-slate-300">context</code>. Must return a valid JavaScript Object.
                </p>
              </div>
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

            {/* Reliability, Retry Policy & Chaos Testing Section */}
            <div className="pt-4 mt-6 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  RELIABILITY & SIMULATION POLICIES
                </span>
              </div>

              {/* Breakpoint Setting */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <CircleDot className={`w-4 h-4 ${data.hasBreakpoint ? 'text-rose-500 fill-rose-500' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-medium text-slate-200">Execution Breakpoint</div>
                    <div className="text-[10px] text-slate-400">Pause simulation before running this node</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleBreakpoint(selectedNode.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                    data.hasBreakpoint
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {data.hasBreakpoint ? 'Active' : 'Disabled'}
                </button>
              </div>

              {/* Retry Policy */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                    Retry Policy (Exponential Backoff)
                  </span>
                  <span className="text-[10px] font-mono text-blue-400">
                    {data.retryConfig?.maxRetries || 0} retries
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-slate-400 font-mono text-[10px] mb-1">
                      MAX RETRIES (0-5)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={data.retryConfig?.maxRetries ?? 0}
                      onChange={(e) =>
                        updateNodeData(selectedNode.id, {
                          retryConfig: {
                            maxRetries: Math.max(0, Math.min(5, parseInt(e.target.value) || 0)),
                            delayMs: data.retryConfig?.delayMs ?? 300,
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono text-[10px] mb-1">
                      BASE DELAY (MS)
                    </label>
                    <input
                      type="number"
                      min={50}
                      step={100}
                      value={data.retryConfig?.delayMs ?? 300}
                      onChange={(e) =>
                        updateNodeData(selectedNode.id, {
                          retryConfig: {
                            maxRetries: data.retryConfig?.maxRetries ?? 0,
                            delayMs: Math.max(50, parseInt(e.target.value) || 300),
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Chaos Engineering: Artificial Failure Injection */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Chaos Testing (Simulated Outage)
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!data.chaosConfig?.simulateFailure}
                      onChange={(e) =>
                        updateNodeData(selectedNode.id, {
                          chaosConfig: {
                            simulateFailure: e.target.checked,
                            failureError: data.chaosConfig?.failureError || 'Simulated upstream dependency timeout (Chaos)',
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>
                {data.chaosConfig?.simulateFailure && (
                  <div className="pt-1">
                    <label className="block text-slate-400 font-mono text-[10px] mb-1">
                      SIMULATED ERROR REASON
                    </label>
                    <input
                      type="text"
                      value={data.chaosConfig?.failureError || ''}
                      onChange={(e) =>
                        updateNodeData(selectedNode.id, {
                          chaosConfig: {
                            simulateFailure: true,
                            failureError: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. 504 Gateway Timeout (Chaos test)"
                      className="w-full bg-slate-950 border border-rose-900/50 rounded px-2 py-1 text-rose-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                )}
              </div>
            </div>
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
