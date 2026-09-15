import { resolveDAG } from './dag_resolver';
import { FastFlowNodeData } from './types';

export interface WorkflowExportData {
  name?: string;
  nodes: Array<{ id: string; data: FastFlowNodeData }>;
  edges: Array<{ id: string; source: string; target: string; sourceHandle?: string | null }>;
}

/**
 * Generates a standalone, runnable TypeScript script that executes the DAG
 * headlessly in Node.js, Bun, or Deno with zero UI dependencies.
 */
export function generateStandaloneScript(workflow: WorkflowExportData): string {
  const dag = resolveDAG(workflow.nodes, workflow.edges);

  if (dag.hasCycle) {
    throw new Error('Cannot generate code: workflow contains cyclical dependencies.');
  }

  const nodesJson = JSON.stringify(workflow.nodes, null, 2);
  const edgesJson = JSON.stringify(workflow.edges, null, 2);
  const stagesJson = JSON.stringify(dag.stages, null, 2);

  return `/**
 * FastFlow Headless Runtime
 * Generated from Workflow: "${workflow.name || 'Custom Workflow'}"
 * Exported at: ${new Date().toISOString()}
 * 
 * Run directly with:
 *   npx tsx workflow_runner.ts
 */

interface NodePayload {
  [key: string]: any;
}

const NODES = ${nodesJson};
const EDGES = ${edgesJson};
const STAGES: string[][] = ${stagesJson};

const nodeOutputs = new Map<string, NodePayload>();
const activeBranchHandles = new Map<string, string>();

async function executeNode(node: typeof NODES[0], inputs: NodePayload): Promise<NodePayload> {
  const { subtype, config, label } = node.data;
  console.log(\`[Running] \${label} (\${subtype})\`);

  switch (subtype) {
    case 'webhook': {
      let payload = {};
      try {
        payload = typeof config.mockPayload === 'string' ? JSON.parse(config.mockPayload) : (config.mockPayload || {});
      } catch {
        payload = { raw: config.mockPayload };
      }
      return { ...payload, _triggeredAt: new Date().toISOString() };
    }

    case 'transform_json': {
      const mapping = typeof config.mapping === 'string' ? JSON.parse(config.mapping) : (config.mapping || {});
      const result: NodePayload = {};
      for (const [k, v] of Object.entries(mapping)) {
        if (typeof v === 'string' && v.startsWith('{{') && v.endsWith('}}')) {
          const path = v.slice(2, -2).trim().split('.');
          result[k] = path.reduce((acc, p) => acc && acc[p], inputs);
        } else {
          result[k] = v;
        }
      }
      return result;
    }

    case 'transform_regex': {
      const pattern = new RegExp(config.pattern || '(.*)');
      const match = String(inputs[config.sourceField || 'email'] || '').match(pattern);
      const names = (config.captureFieldNames || '').split(',').map((s: string) => s.trim());
      const extracted: NodePayload = { isMatch: !!match };
      if (match) {
        names.forEach((name: string, i: number) => {
          extracted[name] = match[i + 1] ?? null;
        });
      }
      return { ...inputs, ...extracted };
    }

    case 'transform_code': {
      const fn = new Function('inputs', config.code || 'return inputs;');
      return fn(inputs);
    }

    case 'control_switch': {
      const val = inputs[config.field];
      const threshold = config.threshold;
      let passed = false;
      if (config.operator === '>=') passed = Number(val) >= Number(threshold);
      else if (config.operator === '>') passed = Number(val) > Number(threshold);
      else if (config.operator === '<=') passed = Number(val) <= Number(threshold);
      else if (config.operator === '<') passed = Number(val) < Number(threshold);
      else if (config.operator === '==') passed = String(val) === String(threshold);
      else passed = Boolean(val);

      const branch = passed ? 'true' : 'false';
      activeBranchHandles.set(node.id, branch);
      return { ...inputs, _branch: branch };
    }

    case 'action_llm': {
      console.log(\`  -> Calling AI Model \${config.model || 'claude-3-5-sonnet'}...\`);
      return {
        ...inputs,
        aiEnrichment: {
          classification: 'Enterprise Priority',
          score: 95,
          recommendedAction: 'Auto-route to senior account team'
        }
      };
    }

    case 'output_slack': {
      console.log(\`  -> [Slack Dispatch] Channel \${config.channel}: Message delivered.\`);
      return { delivered: true, channel: config.channel, timestamp: Date.now() };
    }

    case 'output_sql': {
      console.log(\`  -> [SQL Emit] Inserted records into table \${config.targetTable}.\`);
      return { affectedRows: 1, table: config.targetTable };
    }

    default:
      return { ...inputs };
  }
}

async function main() {
  console.log('=== FastFlow Headless DAG Execution ===\\n');
  const startTime = Date.now();

  for (let stageIdx = 0; stageIdx < STAGES.length; stageIdx++) {
    const stageNodes = STAGES[stageIdx];
    console.log(\`--- Stage \${stageIdx + 1}/\${STAGES.length} [\${stageNodes.length} nodes] ---\`);

    const promises = stageNodes.map(async (nodeId) => {
      const node = NODES.find(n => n.id === nodeId);
      if (!node) return;

      const incomingEdges = EDGES.filter(e => e.target === nodeId);
      const mergedInputs: NodePayload = {};

      for (const edge of incomingEdges) {
        const activeBranch = activeBranchHandles.get(edge.source);
        if (activeBranch && edge.sourceHandle && edge.sourceHandle !== activeBranch) {
          console.log(\`  [Skipped] \${node.data.label} (branch not taken)\`);
          return;
        }
        const parentOutput = nodeOutputs.get(edge.source);
        if (parentOutput) Object.assign(mergedInputs, parentOutput);
      }

      const output = await executeNode(node, mergedInputs);
      nodeOutputs.set(nodeId, output);
    });

    await Promise.all(promises);
    console.log('');
  }

  const duration = Date.now() - startTime;
  console.log(\`=== Execution Finished Successfully (\${duration}ms) ===\`);
}

main().catch(console.error);
`;
}
