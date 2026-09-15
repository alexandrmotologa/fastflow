import { describe, it, expect } from 'vitest';
import { resolveDAG, hasCycles, getExecutionStages } from '../dag_resolver';

describe('DAG Resolver - Kahn Algorithm & Cycle Detection', () => {
  it('should correctly sort a linear workflow (A -> B -> C)', () => {
    const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
    const edges = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
    ];

    const result = resolveDAG(nodes, edges);

    expect(result.hasCycle).toBe(false);
    expect(result.sortedNodeIds).toEqual(['A', 'B', 'C']);
    expect(result.stages).toEqual([['A'], ['B'], ['C']]);
  });

  it('should parallelize a diamond graph (A -> B, C -> D)', () => {
    const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
    const edges = [
      { source: 'A', target: 'B' },
      { source: 'A', target: 'C' },
      { source: 'B', target: 'D' },
      { source: 'C', target: 'D' },
    ];

    const result = resolveDAG(nodes, edges);

    expect(result.hasCycle).toBe(false);
    expect(result.stages.length).toBe(3);
    expect(result.stages[0]).toEqual(['A']);
    // B and C can run concurrently in stage 1
    expect(new Set(result.stages[1])).toEqual(new Set(['B', 'C']));
    expect(result.stages[2]).toEqual(['D']);
  });

  it('should detect direct cycles (A -> B -> A)', () => {
    const nodes = [{ id: 'A' }, { id: 'B' }];
    const edges = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'A' },
    ];

    expect(hasCycles(nodes, edges)).toBe(true);

    const result = resolveDAG(nodes, edges);
    expect(result.hasCycle).toBe(true);
    expect(result.cycleNodes).toContain('A');
    expect(result.cycleNodes).toContain('B');
  });

  it('should detect indirect cycles in complex graphs (A -> B -> C -> D -> B)', () => {
    const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
    const edges = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
      { source: 'C', target: 'D' },
      { source: 'D', target: 'B' }, // Loop back to B
    ];

    const result = resolveDAG(nodes, edges);
    expect(result.hasCycle).toBe(true);
    expect(result.sortedNodeIds).toEqual(['A']);
    expect(result.cycleNodes).toEqual(expect.arrayContaining(['B', 'C', 'D']));

    expect(() => getExecutionStages(nodes, edges)).toThrowError(/cycle detected/);
  });

  it('should handle multi-root disconnected graphs', () => {
    const nodes = [{ id: 'Root1' }, { id: 'Child1' }, { id: 'Root2' }, { id: 'Child2' }];
    const edges = [
      { source: 'Root1', target: 'Child1' },
      { source: 'Root2', target: 'Child2' },
    ];

    const result = resolveDAG(nodes, edges);
    expect(result.hasCycle).toBe(false);
    expect(result.stages.length).toBe(2);
    expect(new Set(result.stages[0])).toEqual(new Set(['Root1', 'Root2']));
    expect(new Set(result.stages[1])).toEqual(new Set(['Child1', 'Child2']));
  });
});
