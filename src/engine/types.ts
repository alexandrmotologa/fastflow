export type NodeStatus = 'idle' | 'running' | 'success' | 'failed' | 'skipped';

export type NodeCategory = 'trigger' | 'transform' | 'action' | 'logic' | 'output';

export type NodeSubtype =
  | 'webhook'
  | 'cron'
  | 'transform_json'
  | 'transform_regex'
  | 'transform_code'
  | 'action_llm'
  | 'action_http'
  | 'control_switch'
  | 'output_slack'
  | 'output_sql';

export interface FastFlowNodeData {
  label: string;
  category: NodeCategory;
  subtype: NodeSubtype;
  description?: string;
  status: NodeStatus;
  config: Record<string, any>;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  durationMs?: number;
  executionStage?: number;
  lastExecutedAt?: number;
  hasBreakpoint?: boolean;
  retryConfig?: {
    maxRetries: number;
    delayMs: number;
  };
  chaosConfig?: {
    simulateFailure: boolean;
    failureError?: string;
  };
  [key: string]: any;
}

export interface DAGResolutionResult {
  hasCycle: boolean;
  cycleNodes?: string[];
  stages: string[][]; // Node IDs partitioned by topological depth wave
  sortedNodeIds: string[];
}

export interface ExecutionTrace {
  id: string;
  runId: string;
  timestamp: number;
  nodeId: string;
  nodeLabel: string;
  category: NodeCategory;
  subtype: NodeSubtype;
  status: NodeStatus;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  durationMs: number;
  stage: number;
}

export interface NodeExecutionContext {
  nodeId: string;
  config: Record<string, any>;
  inputs: Record<string, any>;
  signal?: AbortSignal;
}

export interface NodeExecutionOutput {
  outputs: Record<string, any>;
  branchTargetHandle?: string; // For conditional logic nodes
  logs?: string[];
}

export interface NodeDefinition {
  subtype: NodeSubtype;
  category: NodeCategory;
  displayName: string;
  defaultLabel: string;
  description: string;
  defaultConfig: Record<string, any>;
  execute: (context: NodeExecutionContext) => Promise<NodeExecutionOutput>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: FastFlowNodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    type?: string;
    animated?: boolean;
    data?: Record<string, any>;
  }>;
}
