import { describe, it, expect } from 'vitest';
import { WorkflowExecutionEngine } from '../execution_runner';
import { FastFlowNodeData } from '../types';

describe('Workflow Execution Engine - Wave Dispatcher & Data Pipelines', () => {
  it('should pass outputs of upstream nodes into downstream inputs', async () => {
    const nodes = [
      {
        id: 'node-webhook',
        data: {
          label: 'Webhook',
          category: 'trigger',
          subtype: 'webhook',
          status: 'idle',
          config: {
            mockPayload: {
              customer: {
                id: 'cust_42',
                name: 'Alex Morgan',
                email: 'alex@cyberdyne.org',
                company: 'Cyberdyne',
              },
            },
          },
        } as FastFlowNodeData,
      },
      {
        id: 'node-transform',
        data: {
          label: 'JSON Map',
          category: 'transform',
          subtype: 'transform_json',
          status: 'idle',
          config: {
            mapping: {
              leadId: '{{customer.id}}',
              fullName: '{{customer.name}}',
              corporateEmail: '{{customer.email}}',
              organization: '{{customer.company}}',
            },
          },
        } as FastFlowNodeData,
      },
    ];

    const edges = [
      {
        id: 'edge-1',
        source: 'node-webhook',
        target: 'node-transform',
      },
    ];

    const engine = new WorkflowExecutionEngine(nodes, edges);
    const result = await engine.runWorkflow('test-run-1');

    expect(result.success).toBe(true);
    expect(result.traces.length).toBe(2);

    const transformOutput = engine.getNodeOutputs().get('node-transform');
    expect(transformOutput).toBeDefined();
    expect(transformOutput?.fullName).toBe('Alex Morgan');
    expect(transformOutput?.corporateEmail).toBe('alex@cyberdyne.org');
  });

  it('should handle conditional branching with control_switch node', async () => {
    const nodes = [
      {
        id: 'trigger',
        data: {
          label: 'Trigger',
          category: 'trigger',
          subtype: 'webhook',
          status: 'idle',
          config: {
            mockPayload: { qualificationScore: 95 },
          },
        } as FastFlowNodeData,
      },
      {
        id: 'switch',
        data: {
          label: 'Check Score',
          category: 'logic',
          subtype: 'control_switch',
          status: 'idle',
          config: {
            field: 'qualificationScore',
            operator: '>=',
            threshold: 80,
          },
        } as FastFlowNodeData,
      },
      {
        id: 'highPrioritySink',
        data: {
          label: 'Slack VIP',
          category: 'output',
          subtype: 'output_slack',
          status: 'idle',
          config: { channel: '#vip-leads' },
        } as FastFlowNodeData,
      },
      {
        id: 'lowPrioritySink',
        data: {
          label: 'Slack General',
          category: 'output',
          subtype: 'output_slack',
          status: 'idle',
          config: { channel: '#general-leads' },
        } as FastFlowNodeData,
      },
    ];

    const edges = [
      { id: 'e1', source: 'trigger', target: 'switch' },
      { id: 'e2', source: 'switch', target: 'highPrioritySink', sourceHandle: 'true' },
      { id: 'e3', source: 'switch', target: 'lowPrioritySink', sourceHandle: 'false' },
    ];

    const engine = new WorkflowExecutionEngine(nodes, edges);
    const result = await engine.runWorkflow('test-branch-run');

    expect(result.success).toBe(true);

    const traces = engine.getTraces();
    const highPriorityTrace = traces.find((t) => t.nodeId === 'highPrioritySink');
    const lowPriorityTrace = traces.find((t) => t.nodeId === 'lowPrioritySink');

    expect(highPriorityTrace?.status).toBe('success');
    expect(lowPriorityTrace?.status).toBe('skipped');
  });
});
