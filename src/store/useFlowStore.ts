import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react';
import {
  ExecutionTrace,
  FastFlowNodeData,
  NodeCategory,
  NodeSubtype,
} from '../engine/types';
import { getNodeDefinition } from '../engine/registry';
import { WorkflowExecutionEngine } from '../engine/execution_runner';
import { resolveDAG, applyDagreLayout } from '../engine/dag_resolver';
import { generateStandaloneScript } from '../engine/codegen';
import { builtInTemplates, getTemplateById } from '../templates';

interface HistorySnapshot {
  nodes: Node<FastFlowNodeData>[];
  edges: Edge[];
}

export interface FlowState {
  nodes: Node<FastFlowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDrawerOpen: boolean;
  isDebuggerOpen: boolean;
  activeTemplateId: string;
  runStatus: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentStageIndex: number;
  totalStages: number;
  simulationSpeed: number;
  traces: ExecutionTrace[];
  logs: string[];
  activePulsingEdges: Set<string>;
  edgeData: Record<string, Record<string, any>>;

  // History for Undo/Redo
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Internal abort controller for canceling simulation
  abortController: AbortController | null;

  // Actions
  onNodesChange: (changes: NodeChange<Node<FastFlowNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId: string | null) => void;
  closeDrawer: () => void;
  toggleDebugger: () => void;
  toggleBreakpoint: (nodeId: string) => void;
  updateNodeConfig: (nodeId: string, newConfig: Record<string, any>) => void;
  updateNodeData: (nodeId: string, partialData: Partial<FastFlowNodeData>) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  deleteNode: (nodeId: string) => void;
  addNode: (subtype: NodeSubtype, position?: { x: number; y: number }) => void;
  loadTemplate: (templateId: string) => void;
  setSimulationSpeed: (speed: number) => void;
  resetWorkflowStatus: () => void;
  runSimulation: () => Promise<void>;
  stepSimulation: () => Promise<void>;
  stopSimulation: () => void;
  autoLayout: (direction?: 'LR' | 'TB') => void;
  undo: () => void;
  redo: () => void;
  exportWorkflow: () => string;
  exportStandaloneScript: () => string;
  importWorkflow: (jsonStr: string) => boolean;
}

const defaultTemplate = builtInTemplates[0];

const MAX_HISTORY = 30;

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: (defaultTemplate?.nodes as Node<FastFlowNodeData>[]) || [],
  edges: defaultTemplate?.edges || [],
  selectedNodeId: null,
  isDrawerOpen: false,
  isDebuggerOpen: true,
  activeTemplateId: defaultTemplate?.id || 'ai_lead_enrichment',
  runStatus: 'idle',
  currentStageIndex: 0,
  totalStages: 0,
  simulationSpeed: 1,
  traces: [],
  logs: [`[System] FastFlow Studio ready. Loaded template: ${defaultTemplate?.name}`],
  activePulsingEdges: new Set(),
  edgeData: {},
  past: [],
  future: [],
  abortController: null,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    const currentSnapshot: HistorySnapshot = {
      nodes: get().nodes,
      edges: get().edges,
    };

    const newEdge: Edge = {
      ...connection,
      id: `e_${connection.source}_${connection.target}_${Date.now()}`,
      type: 'pulseEdge',
      animated: false,
    };

    set({
      edges: addEdge(newEdge, get().edges),
      past: [...get().past.slice(-MAX_HISTORY), currentSnapshot],
      future: [],
    });
  },

  selectNode: (nodeId) => {
    set({
      selectedNodeId: nodeId,
      isDrawerOpen: !!nodeId,
    });
  },

  closeDrawer: () => {
    set({
      selectedNodeId: null,
      isDrawerOpen: false,
    });
  },

  toggleDebugger: () => {
    set({ isDebuggerOpen: !get().isDebuggerOpen });
  },

  toggleBreakpoint: (nodeId) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          const hasBreakpoint = !node.data.hasBreakpoint;
          return {
            ...node,
            data: {
              ...node.data,
              hasBreakpoint,
            },
          };
        }
        return node;
      }),
      logs: [
        ...get().logs,
        `[Breakpoint] Toggled breakpoint on node: ${nodeId}`,
      ],
    });
  },

  updateNodeConfig: (nodeId, newConfig) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config: { ...node.data.config, ...newConfig },
            },
          };
        }
        return node;
      }),
    });
  },

  updateNodeData: (nodeId, partialData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...partialData,
            },
          };
        }
        return node;
      }),
    });
  },

  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label,
            },
          };
        }
        return node;
      }),
    });
  },

  deleteNode: (nodeId) => {
    const currentSnapshot: HistorySnapshot = {
      nodes: get().nodes,
      edges: get().edges,
    };

    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      isDrawerOpen: get().selectedNodeId === nodeId ? false : get().isDrawerOpen,
      past: [...get().past.slice(-MAX_HISTORY), currentSnapshot],
      future: [],
    });
  },

  addNode: (subtype, position) => {
    const def = getNodeDefinition(subtype);
    if (!def) return;

    const currentSnapshot: HistorySnapshot = {
      nodes: get().nodes,
      edges: get().edges,
    };

    const id = `node_${subtype}_${Date.now()}`;
    const pos = position || {
      x: 200 + (get().nodes.length % 5) * 40,
      y: 180 + (get().nodes.length % 5) * 40,
    };

    let nodeType = 'actionNode';
    if (def.category === 'trigger') nodeType = 'triggerNode';
    else if (def.category === 'transform') nodeType = 'transformNode';
    else if (def.category === 'logic') nodeType = 'logicNode';
    else if (def.category === 'output') nodeType = 'outputNode';

    const newNode: Node<FastFlowNodeData> = {
      id,
      type: nodeType,
      position: pos,
      data: {
        label: def.defaultLabel,
        category: def.category as NodeCategory,
        subtype: def.subtype as NodeSubtype,
        status: 'idle',
        config: { ...def.defaultConfig },
      },
    };

    set({
      nodes: [...get().nodes, newNode],
      selectedNodeId: id,
      isDrawerOpen: true,
      past: [...get().past.slice(-MAX_HISTORY), currentSnapshot],
      future: [],
      logs: [...get().logs, `[Studio] Added node: ${def.displayName} (${id})`],
    });
  },

  autoLayout: (direction = 'LR') => {
    const currentSnapshot: HistorySnapshot = {
      nodes: get().nodes,
      edges: get().edges,
    };

    const organizedNodes = applyDagreLayout(get().nodes, get().edges, direction);

    set({
      nodes: organizedNodes,
      past: [...get().past.slice(-MAX_HISTORY), currentSnapshot],
      future: [],
      logs: [...get().logs, `[Auto-Layout] Graph neatly organized (${direction}) using Dagre algorithm.`],
    });
  },

  undo: () => {
    const { past, future, nodes, edges } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: newPast,
      future: [{ nodes, edges }, ...future],
      logs: [...get().logs, `[History] Undo applied.`],
    });
  },

  redo: () => {
    const { past, future, nodes, edges } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past, { nodes, edges }],
      future: newFuture,
      logs: [...get().logs, `[History] Redo applied.`],
    });
  },

  loadTemplate: (templateId) => {
    const tmpl = getTemplateById(templateId);
    if (!tmpl) return;

    get().stopSimulation();

    set({
      activeTemplateId: templateId,
      nodes: (tmpl.nodes as Node<FastFlowNodeData>[]) || [],
      edges: tmpl.edges || [],
      selectedNodeId: null,
      isDrawerOpen: false,
      runStatus: 'idle',
      traces: [],
      currentStageIndex: 0,
      totalStages: 0,
      activePulsingEdges: new Set(),
      edgeData: {},
      past: [],
      future: [],
      logs: [`[Template] Loaded: ${tmpl.name}`],
    });
  },

  setSimulationSpeed: (speed) => {
    set({ simulationSpeed: speed });
  },

  resetWorkflowStatus: () => {
    get().stopSimulation();

    set({
      runStatus: 'idle',
      currentStageIndex: 0,
      traces: [],
      activePulsingEdges: new Set(),
      edgeData: {},
      nodes: get().nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: 'idle',
          outputs: undefined,
          inputs: undefined,
          error: undefined,
          durationMs: undefined,
        },
      })),
      logs: [...get().logs, `[Simulation] Reset graph state to idle.`],
    });
  },

  stopSimulation: () => {
    const controller = get().abortController;
    if (controller) {
      controller.abort();
    }
    set({
      abortController: null,
      runStatus: 'idle',
      activePulsingEdges: new Set(),
    });
  },

  runSimulation: async () => {
    const { nodes, edges, simulationSpeed, currentStageIndex } = get();

    const dagResult = resolveDAG(nodes, edges);
    if (dagResult.hasCycle) {
      set({
        runStatus: 'failed',
        logs: [
          ...get().logs,
          `[Error] Cycle detected in DAG! Involving nodes: ${dagResult.cycleNodes?.join(', ')}`,
        ],
      });
      return;
    }

    const abortCtrl = new AbortController();
    const startStage = get().runStatus === 'paused' ? currentStageIndex : 0;

    if (startStage === 0) {
      set({
        traces: [],
        currentStageIndex: 0,
        edgeData: {},
        nodes: nodes.map((n) => ({
          ...n,
          data: { ...n.data, status: 'idle', outputs: undefined, error: undefined },
        })),
      });
    }

    set({
      runStatus: 'running',
      abortController: abortCtrl,
      totalStages: dagResult.stages.length,
      activePulsingEdges: new Set(),
      logs: [
        ...get().logs,
        `[Run] ${startStage > 0 ? 'Resuming' : 'Starting'} simulation: ${nodes.length} nodes across ${dagResult.stages.length} stages.`,
      ],
    });

    const engine = new WorkflowExecutionEngine(nodes as any, edges as any, {
      onStageStart: (stageIdx, nodeIds) => {
        set({
          currentStageIndex: stageIdx + 1,
          logs: [
            ...get().logs,
            `[Stage ${stageIdx + 1}/${dagResult.stages.length}] Launching wave: [${nodeIds.join(', ')}]`,
          ],
        });
      },
      onNodeStart: (nodeId) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, status: 'running' } }
              : n
          ),
        });
      },
      onNodeComplete: (nodeId, outputs, durationMs, stepLogs) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: 'success',
                    outputs,
                    durationMs,
                    lastExecutedAt: Date.now(),
                  },
                }
              : n
          ),
          logs: [...get().logs, ...stepLogs.map((l) => `[Node ${nodeId}] ${l}`)],
        });
      },
      onNodeError: (nodeId, error, durationMs) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: 'failed',
                    error,
                    durationMs,
                  },
                }
              : n
          ),
          logs: [...get().logs, `[Node ${nodeId} ERROR] ${error}`],
        });
      },
      onNodeSkip: (nodeId) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, status: 'skipped' } }
              : n
          ),
          logs: [...get().logs, `[Node ${nodeId}] Skipped by upstream branch condition.`],
        });
      },
      onNodeRetry: (nodeId, attempt, maxRetries) => {
        set({
          logs: [
            ...get().logs,
            `[Retry Policy] Node ${nodeId} attempt ${attempt}/${maxRetries} with exponential backoff...`,
          ],
        });
      },
      onBreakpointHit: (nodeId) => {
        set({
          runStatus: 'paused',
          abortController: null,
          logs: [
            ...get().logs,
            `🛑 [BREAKPOINT HIT] Simulation paused before entering node: ${nodeId}`,
          ],
        });
      },
      onEdgePulse: (edgeId, active) => {
        const nextSet = new Set(get().activePulsingEdges);
        if (active) nextSet.add(edgeId);
        else nextSet.delete(edgeId);
        set({ activePulsingEdges: nextSet });
      },
      onEdgeDataTransferred: (edgeId, payload) => {
        set({
          edgeData: {
            ...get().edgeData,
            [edgeId]: payload,
          },
        });
      },
    });

    try {
      const outcome = await engine.runWorkflow(`run_${Date.now()}`, {
        simulationSpeed,
        signal: abortCtrl.signal,
        startFromStage: startStage,
      });

      if (outcome.pausedAtBreakpoint) {
        set({
          runStatus: 'paused',
          traces: engine.getTraces(),
          abortController: null,
          activePulsingEdges: new Set(),
        });
        return;
      }

      set({
        runStatus: outcome.success ? 'completed' : 'failed',
        traces: engine.getTraces(),
        abortController: null,
        activePulsingEdges: new Set(),
        logs: [
          ...get().logs,
          outcome.success
            ? `[Simulation Complete] All active nodes resolved successfully.`
            : `[Simulation Finished with Errors] Review trace output.`,
        ],
      });
    } catch (err: any) {
      set({
        runStatus: 'failed',
        abortController: null,
        activePulsingEdges: new Set(),
        logs: [...get().logs, `[Fatal Execution Error] ${err.message}`],
      });
    }
  },

  stepSimulation: async () => {
    const { nodes, edges, currentStageIndex } = get();
    const dagResult = resolveDAG(nodes, edges);

    if (dagResult.hasCycle) {
      set({
        logs: [...get().logs, `[Error] Cannot step: Graph contains cycles.`],
      });
      return;
    }

    const stages = dagResult.stages;
    if (currentStageIndex >= stages.length) {
      set({
        runStatus: 'completed',
        logs: [...get().logs, `[Simulation] Reached end of workflow.`],
      });
      return;
    }

    const stageIdx = currentStageIndex;
    const stageNodeIds = stages[stageIdx];

    set({
      runStatus: 'running',
      currentStageIndex: stageIdx + 1,
      totalStages: stages.length,
      logs: [
        ...get().logs,
        `[Step ${stageIdx + 1}/${stages.length}] Stepping wave: [${stageNodeIds.join(', ')}]`,
      ],
    });

    const engine = new WorkflowExecutionEngine(nodes as any, edges as any, {
      onEdgeDataTransferred: (edgeId, payload) => {
        set({
          edgeData: {
            ...get().edgeData,
            [edgeId]: payload,
          },
        });
      },
    });

    for (const nodeId of stageNodeIds) {
      set({
        nodes: get().nodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' } } : n
        ),
      });

      await engine.executeNode(nodeId, stageIdx, `step_${Date.now()}`);

      const outputs = engine.getNodeOutputs().get(nodeId);
      set({
        nodes: get().nodes.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  status: 'success',
                  outputs,
                  durationMs: 120,
                },
              }
            : n
        ),
      });
    }

    set({
      runStatus: stageIdx + 1 >= stages.length ? 'completed' : 'paused',
      traces: [...get().traces, ...engine.getTraces()],
    });
  },

  exportWorkflow: () => {
    const data = {
      name: 'Custom FastFlow Workflow',
      exportedAt: new Date().toISOString(),
      nodes: get().nodes,
      edges: get().edges,
    };
    return JSON.stringify(data, null, 2);
  },

  exportStandaloneScript: () => {
    return generateStandaloneScript({
      name: 'FastFlow Exported Workflow',
      nodes: get().nodes as any,
      edges: get().edges as any,
    });
  },

  importWorkflow: (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        get().stopSimulation();
        set({
          nodes: parsed.nodes,
          edges: parsed.edges,
          selectedNodeId: null,
          isDrawerOpen: false,
          runStatus: 'idle',
          traces: [],
          currentStageIndex: 0,
          edgeData: {},
          past: [],
          future: [],
          logs: [...get().logs, `[Import] Successfully loaded custom workflow.`],
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
