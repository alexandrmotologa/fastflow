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
import { resolveDAG } from '../engine/dag_resolver';
import { builtInTemplates, getTemplateById } from '../templates';

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

  // Internal abort controller for canceling simulation
  abortController: AbortController | null;

  // Actions
  onNodesChange: (changes: NodeChange<Node<FastFlowNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId: string | null) => void;
  closeDrawer: () => void;
  toggleDebugger: () => void;
  updateNodeConfig: (nodeId: string, newConfig: Record<string, any>) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  deleteNode: (nodeId: string) => void;
  addNode: (subtype: NodeSubtype, position?: { x: number; y: number }) => void;
  loadTemplate: (templateId: string) => void;
  setSimulationSpeed: (speed: number) => void;
  resetWorkflowStatus: () => void;
  runSimulation: () => Promise<void>;
  stepSimulation: () => Promise<void>;
  stopSimulation: () => void;
  exportWorkflow: () => string;
  importWorkflow: (jsonStr: string) => boolean;
}

const defaultTemplate = builtInTemplates[0];

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
    const newEdge: Edge = {
      ...connection,
      id: `e_${connection.source}_${connection.target}_${Date.now()}`,
      type: 'pulseEdge',
      animated: false,
    };
    set({
      edges: addEdge(newEdge, get().edges),
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
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      isDrawerOpen: get().selectedNodeId === nodeId ? false : get().isDrawerOpen,
    });
  },

  addNode: (subtype, position) => {
    const def = getNodeDefinition(subtype);
    if (!def) return;

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
      logs: [...get().logs, `[Studio] Added node: ${def.displayName} (${id})`],
    });
  },

  loadTemplate: (templateId) => {
    const tmpl = getTemplateById(templateId);
    if (!tmpl) return;

    // Reset abort controller if running
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
    const { nodes, edges, simulationSpeed } = get();

    // Check DAG resolution first
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

    // Reset statuses to idle before run
    set({
      runStatus: 'running',
      abortController: abortCtrl,
      traces: [],
      totalStages: dagResult.stages.length,
      currentStageIndex: 0,
      activePulsingEdges: new Set(),
      nodes: nodes.map((n) => ({
        ...n,
        data: { ...n.data, status: 'idle', outputs: undefined, error: undefined },
      })),
      logs: [
        ...get().logs,
        `[Run] Started simulation: ${nodes.length} nodes, ${edges.length} edges across ${dagResult.stages.length} stages.`,
      ],
    });

    const engine = new WorkflowExecutionEngine(nodes as any, edges as any, {
      onStageStart: (stageIdx, nodeIds) => {
        set({
          currentStageIndex: stageIdx + 1,
          logs: [
            ...get().logs,
            `[Stage ${stageIdx + 1}/${dagResult.stages.length}] Launching wave with nodes: [${nodeIds.join(', ')}]`,
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
          logs: [...get().logs, `[Node ${nodeId}] Skipped by upstream conditional branch.`],
        });
      },
      onEdgePulse: (edgeId, active) => {
        const nextSet = new Set(get().activePulsingEdges);
        if (active) nextSet.add(edgeId);
        else nextSet.delete(edgeId);
        set({ activePulsingEdges: nextSet });
      },
    });

    try {
      const outcome = await engine.runWorkflow(`run_${Date.now()}`, {
        simulationSpeed,
        signal: abortCtrl.signal,
      });

      set({
        runStatus: outcome.success ? 'completed' : 'failed',
        traces: engine.getTraces(),
        abortController: null,
        activePulsingEdges: new Set(),
        logs: [
          ...get().logs,
          outcome.success
            ? `[Simulation Complete] All ${nodes.length} nodes resolved successfully.`
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
    // Single-step forward
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

    // Execute this single wave
    const engine = new WorkflowExecutionEngine(nodes as any, edges as any);
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
