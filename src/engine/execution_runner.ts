import { resolveDAG, MinimalEdge } from './dag_resolver';
import { getNodeDefinition } from './registry';
import { ExecutionTrace, FastFlowNodeData, NodeStatus } from './types';

export interface WorkflowRunnerNode {
  id: string;
  data: FastFlowNodeData;
}

export interface WorkflowRunnerEdge extends MinimalEdge {
  id: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface ExecutionRunnerCallbacks {
  onNodeStart?: (nodeId: string, stageIndex: number) => void;
  onNodeComplete?: (
    nodeId: string,
    outputs: Record<string, any>,
    durationMs: number,
    logs: string[]
  ) => void;
  onNodeError?: (nodeId: string, error: string, durationMs: number) => void;
  onNodeSkip?: (nodeId: string) => void;
  onNodeRetry?: (nodeId: string, attempt: number, maxRetries: number) => void;
  onBreakpointHit?: (nodeId: string) => void;
  onStageStart?: (stageIndex: number, nodeIds: string[]) => void;
  onStageComplete?: (stageIndex: number) => void;
  onEdgePulse?: (edgeId: string, active: boolean) => void;
  onEdgeDataTransferred?: (edgeId: string, payload: Record<string, any>) => void;
}

export interface ExecutionOptions {
  simulationSpeed?: number; // 1 = normal, 2 = 2x faster, 0.5 = slower
  signal?: AbortSignal;
  breakpoints?: Set<string>;
  startFromStage?: number;
}

export class WorkflowExecutionEngine {
  private nodeOutputs: Map<string, Record<string, any>> = new Map();
  private nodeStatuses: Map<string, NodeStatus> = new Map();
  private activeBranchHandles: Map<string, string> = new Map(); // nodeId -> active sourceHandle
  private traces: ExecutionTrace[] = [];

  constructor(
    private nodes: WorkflowRunnerNode[],
    private edges: WorkflowRunnerEdge[],
    private callbacks: ExecutionRunnerCallbacks = {}
  ) {}

  public getTraces(): ExecutionTrace[] {
    return this.traces;
  }

  public getNodeOutputs(): Map<string, Record<string, any>> {
    return this.nodeOutputs;
  }

  /**
   * Run the entire workflow DAG from start to finish.
   */
  public async runWorkflow(
    runId = `run_${Date.now()}`,
    options: ExecutionOptions = {}
  ): Promise<{ success: boolean; pausedAtBreakpoint?: string; traces: ExecutionTrace[] }> {
    const dagResult = resolveDAG(this.nodes, this.edges);

    if (dagResult.hasCycle) {
      throw new Error(
        `Execution aborted: Workflow contains cyclical connections: ${dagResult.cycleNodes?.join(
          ', '
        )}`
      );
    }

    const { stages } = dagResult;
    const speed = options.simulationSpeed || 1;
    const startStage = options.startFromStage || 0;

    for (let stageIdx = startStage; stageIdx < stages.length; stageIdx++) {
      if (options.signal?.aborted) {
        return { success: false, traces: this.traces };
      }

      const stageNodeIds = stages[stageIdx];

      // Check if any node in this wave hits an active breakpoint
      const breakpointNodeId = stageNodeIds.find((id) => {
        const node = this.nodes.find((n) => n.id === id);
        return (
          node?.data.hasBreakpoint ||
          (options.breakpoints && options.breakpoints.has(id))
        );
      });

      if (breakpointNodeId && stageIdx > startStage) {
        this.callbacks.onBreakpointHit?.(breakpointNodeId);
        return {
          success: true,
          pausedAtBreakpoint: breakpointNodeId,
          traces: this.traces,
        };
      }

      this.callbacks.onStageStart?.(stageIdx, stageNodeIds);

      // Execute all nodes in this topological wave concurrently
      const stagePromises = stageNodeIds.map((nodeId) =>
        this.executeNode(nodeId, stageIdx, runId, options)
      );

      await Promise.allSettled(stagePromises);

      // Transfer data along edges & trigger edge pulses
      for (const nodeId of stageNodeIds) {
        const outEdges = this.edges.filter((e) => e.source === nodeId);
        const nodeOutput = this.nodeOutputs.get(nodeId) || {};
        const selectedHandle = this.activeBranchHandles.get(nodeId);

        for (const edge of outEdges) {
          if (!selectedHandle || !edge.sourceHandle || edge.sourceHandle === selectedHandle) {
            this.callbacks.onEdgePulse?.(edge.id, true);
            this.callbacks.onEdgeDataTransferred?.(edge.id, nodeOutput);
          }
        }
      }

      // Simulated transport duration scaled by simulation speed
      await new Promise((r) => setTimeout(r, Math.max(80, 300 / speed)));

      // Turn off edge pulses
      for (const nodeId of stageNodeIds) {
        const outEdges = this.edges.filter((e) => e.source === nodeId);
        for (const edge of outEdges) {
          this.callbacks.onEdgePulse?.(edge.id, false);
        }
      }

      this.callbacks.onStageComplete?.(stageIdx);
    }

    const isAllSuccess = !this.traces.some((t) => t.status === 'failed');
    return { success: isAllSuccess, traces: this.traces };
  }

  /**
   * Execute a single node in the DAG with retry logic and chaos testing support.
   */
  public async executeNode(
    nodeId: string,
    stageIndex: number,
    runId: string,
    options: ExecutionOptions = {}
  ): Promise<boolean> {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) return false;

    // Check parent dependencies and branch filtering
    const incomingEdges = this.edges.filter((e) => e.target === nodeId);
    let shouldSkip = false;

    if (incomingEdges.length > 0) {
      const activeIncomingEdges = incomingEdges.filter((edge) => {
        const parentBranch = this.activeBranchHandles.get(edge.source);
        if (parentBranch && edge.sourceHandle && edge.sourceHandle !== parentBranch) {
          return false;
        }
        return true;
      });

      if (activeIncomingEdges.length === 0) {
        shouldSkip = true;
      }
    }

    if (shouldSkip) {
      this.nodeStatuses.set(nodeId, 'skipped');
      this.callbacks.onNodeSkip?.(nodeId);
      this.traces.push({
        id: `tr_${Date.now()}_${nodeId}`,
        runId,
        timestamp: Date.now(),
        nodeId,
        nodeLabel: node.data.label,
        category: node.data.category,
        subtype: node.data.subtype,
        status: 'skipped',
        durationMs: 0,
        stage: stageIndex,
      });
      return true;
    }

    // Merge inputs from all active parent outputs
    const mergedInputs: Record<string, any> = {};
    for (const edge of incomingEdges) {
      const parentOutput = this.nodeOutputs.get(edge.source);
      if (parentOutput) {
        Object.assign(mergedInputs, parentOutput);
      }
    }

    this.callbacks.onNodeStart?.(nodeId, stageIndex);
    this.nodeStatuses.set(nodeId, 'running');

    const nodeDef = getNodeDefinition(node.data.subtype);
    if (!nodeDef) {
      const errorMsg = `No executor registered for node subtype: ${node.data.subtype}`;
      this.callbacks.onNodeError?.(nodeId, errorMsg, 0);
      this.nodeStatuses.set(nodeId, 'failed');
      this.traces.push({
        id: `tr_${Date.now()}_${nodeId}`,
        runId,
        timestamp: Date.now(),
        nodeId,
        nodeLabel: node.data.label,
        category: node.data.category,
        subtype: node.data.subtype,
        status: 'failed',
        error: errorMsg,
        durationMs: 0,
        stage: stageIndex,
      });
      return false;
    }

    const maxRetries = node.data.retryConfig?.maxRetries || 0;
    const retryDelay = node.data.retryConfig?.delayMs || 300;
    let attempt = 0;
    let lastError: any = null;

    while (attempt <= maxRetries) {
      const startTime = performance.now();

      try {
        // Chaos Testing: Artificial failure injection
        if (node.data.chaosConfig?.simulateFailure) {
          throw new Error(
            node.data.chaosConfig.failureError ||
              'Simulated Failure (Chaos Testing injected 500 error)'
          );
        }

        const result = await nodeDef.execute({
          nodeId,
          config: node.data.config || {},
          inputs: mergedInputs,
          signal: options.signal,
        });

        const durationMs = Math.round(performance.now() - startTime);

        this.nodeOutputs.set(nodeId, result.outputs);
        this.nodeStatuses.set(nodeId, 'success');

        if (result.branchTargetHandle) {
          this.activeBranchHandles.set(nodeId, result.branchTargetHandle);
        }

        this.callbacks.onNodeComplete?.(
          nodeId,
          result.outputs,
          durationMs,
          result.logs || []
        );

        this.traces.push({
          id: `tr_${Date.now()}_${nodeId}`,
          runId,
          timestamp: Date.now(),
          nodeId,
          nodeLabel: node.data.label,
          category: node.data.category,
          subtype: node.data.subtype,
          status: 'success',
          inputs: mergedInputs,
          outputs: result.outputs,
          durationMs,
          stage: stageIndex,
        });

        return true;
      } catch (err: any) {
        lastError = err;
        attempt++;

        if (attempt <= maxRetries) {
          this.callbacks.onNodeRetry?.(nodeId, attempt, maxRetries);
          const backoff = retryDelay * Math.pow(1.5, attempt - 1);
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
    }

    const durationMs = 0;
    const errorMsg = lastError?.message || 'Execution error';

    this.nodeStatuses.set(nodeId, 'failed');
    this.callbacks.onNodeError?.(nodeId, errorMsg, durationMs);

    this.traces.push({
      id: `tr_${Date.now()}_${nodeId}`,
      runId,
      timestamp: Date.now(),
      nodeId,
      nodeLabel: node.data.label,
      category: node.data.category,
      subtype: node.data.subtype,
      status: 'failed',
      inputs: mergedInputs,
      error: errorMsg,
      durationMs,
      stage: stageIndex,
    });

    return false;
  }
}
