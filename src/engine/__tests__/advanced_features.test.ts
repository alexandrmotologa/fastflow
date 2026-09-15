import { describe, it, expect, vi } from 'vitest';
import { applyDagreLayout } from '../dag_resolver';
import { transformCodeExecutor } from '../registry/transform_code';
import { WorkflowExecutionEngine } from '../execution_runner';
import { generateStandaloneScript } from '../codegen';
import { FastFlowNodeData } from '../types';

describe('Advanced FastFlow Engine Features', () => {
  describe('Dagre Auto-Layout Engine', () => {
    it('should assign valid coordinates to unorganized nodes along left-to-right axis', () => {
      const mockNodes = [
        { id: 'node_1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } as any },
        { id: 'node_2', position: { x: 0, y: 0 }, data: { label: 'Node 2' } as any },
        { id: 'node_3', position: { x: 0, y: 0 }, data: { label: 'Node 3' } as any },
      ];
      const mockEdges = [
        { id: 'e1', source: 'node_1', target: 'node_2' },
        { id: 'e2', source: 'node_2', target: 'node_3' },
      ];

      const positionedNodes = applyDagreLayout(mockNodes as any, mockEdges as any, 'LR');

      expect(positionedNodes).toHaveLength(3);
      const n1 = positionedNodes.find((n) => n.id === 'node_1')!;
      const n2 = positionedNodes.find((n) => n.id === 'node_2')!;
      const n3 = positionedNodes.find((n) => n.id === 'node_3')!;

      // In LR layout, x-coordinates must strictly increase along the dependency chain
      expect(n2.position.x).toBeGreaterThan(n1.position.x);
      expect(n3.position.x).toBeGreaterThan(n2.position.x);
    });
  });

  describe('JavaScript Sandbox Code Node', () => {
    it('should evaluate custom script and return transformed data', async () => {
      const code = `
        return {
          fullName: (input.firstName || '') + ' ' + (input.lastName || ''),
          score: (input.baseScore || 10) * 2,
          processed: true
        };
      `;

      const result = await transformCodeExecutor.execute({
        nodeId: 'test_code_node',
        config: { code },
        inputs: { firstName: 'Alice', lastName: 'Smith', baseScore: 40 },
      });

      expect(result.outputs).toEqual({
        fullName: 'Alice Smith',
        score: 80,
        processed: true,
      });
    });

    it('should handle runtime script errors gracefully with clear error message', async () => {
      const brokenCode = `
        throw new Error('Custom validation failed: missing critical key');
      `;

      await expect(
        transformCodeExecutor.execute({
          nodeId: 'test_broken_node',
          config: { code: brokenCode },
          inputs: {},
        })
      ).rejects.toThrow('Custom Code Script Error: Custom validation failed: missing critical key');
    });
  });

  describe('Breakpoint & Stepping Execution Mechanics', () => {
    it('should pause workflow when encountering a node marked with hasBreakpoint', async () => {
      const nodes = [
        {
          id: 'trigger',
          position: { x: 0, y: 0 },
          data: {
            label: 'Webhook',
            category: 'trigger',
            subtype: 'webhook',
            status: 'idle',
            config: { mockPayload: { leadId: 'lead_999' } },
          } as FastFlowNodeData,
        },
        {
          id: 'transform',
          position: { x: 200, y: 0 },
          data: {
            label: 'Format',
            category: 'transform',
            subtype: 'transform_json',
            status: 'idle',
            hasBreakpoint: true, // Breakpoint set here!
            config: { mapping: { id: '{{leadId}}' } },
          } as FastFlowNodeData,
        },
      ];
      const edges = [{ id: 'e1', source: 'trigger', target: 'transform' }];

      const onBreakpointHit = vi.fn();
      const engine = new WorkflowExecutionEngine(nodes as any, edges as any, {
        onBreakpointHit,
      });

      const outcome = await engine.runWorkflow('run_breakpoint_test');

      expect(outcome.pausedAtBreakpoint).toBe('transform');
      expect(onBreakpointHit).toHaveBeenCalledWith('transform');
    });
  });

  describe('Chaos Testing & Retry Policy Engine', () => {
    it('should simulate failure when chaosConfig.simulateFailure is enabled', async () => {
      const nodes = [
        {
          id: 'trigger',
          position: { x: 0, y: 0 },
          data: {
            label: 'Trigger',
            category: 'trigger',
            subtype: 'webhook',
            status: 'idle',
            config: { mockPayload: {} },
            chaosConfig: {
              simulateFailure: true,
              failureError: 'Simulated 500 Outage',
            },
          } as FastFlowNodeData,
        },
      ];
      const edges: any[] = [];

      const onNodeError = vi.fn();
      const engine = new WorkflowExecutionEngine(nodes as any, edges, {
        onNodeError,
      });

      const outcome = await engine.runWorkflow('run_chaos_test');

      expect(outcome.success).toBe(false);
      expect(onNodeError).toHaveBeenCalledWith(
        'trigger',
        expect.stringContaining('Simulated 500 Outage'),
        expect.any(Number)
      );
    });

    it('should retry failed execution according to retryConfig with exponential backoff', async () => {
      const nodes = [
        {
          id: 'failing_node',
          position: { x: 0, y: 0 },
          data: {
            label: 'Action',
            category: 'action',
            subtype: 'action_http',
            status: 'idle',
            config: {},
            chaosConfig: {
              simulateFailure: true,
              failureError: 'Transient network timeout',
            },
            retryConfig: {
              maxRetries: 2,
              delayMs: 10,
            },
          } as FastFlowNodeData,
        },
      ];
      const edges: any[] = [];

      const onNodeRetry = vi.fn();
      const engine = new WorkflowExecutionEngine(nodes as any, edges, {
        onNodeRetry,
      });

      const outcome = await engine.runWorkflow('run_retry_test');

      expect(outcome.success).toBe(false);
      expect(onNodeRetry).toHaveBeenCalledTimes(2);
      expect(onNodeRetry).toHaveBeenCalledWith('failing_node', 1, 2);
      expect(onNodeRetry).toHaveBeenCalledWith('failing_node', 2, 2);
    });
  });

  describe('Standalone TypeScript Script Code Generator', () => {
    it('should generate valid standalone executable TypeScript code', () => {
      const template = {
        name: 'Order Processing Pipeline',
        nodes: [
          {
            id: 'n_webhook',
            type: 'triggerNode',
            position: { x: 100, y: 100 },
            data: {
              label: 'Stripe Webhook',
              category: 'trigger' as const,
              subtype: 'webhook' as const,
              status: 'idle' as const,
              config: { mockPayload: { event: 'charge.succeeded', amount: 4900 } },
            },
          },
          {
            id: 'n_transform',
            type: 'transformNode',
            position: { x: 400, y: 100 },
            data: {
              label: 'Parse Charge',
              category: 'transform' as const,
              subtype: 'transform_json' as const,
              status: 'idle' as const,
              config: { mapping: { gross: '{{amount}}' } },
            },
          },
        ],
        edges: [
          { id: 'e1', source: 'n_webhook', target: 'n_transform' },
        ],
      };

      const tsScript = generateStandaloneScript(template);

      expect(tsScript).toContain('FastFlow Headless Runtime');
      expect(tsScript).toContain('Order Processing Pipeline');
      expect(tsScript).toContain('executeNode');
      expect(tsScript).toContain('main().catch(console.error);');
    });
  });
});
