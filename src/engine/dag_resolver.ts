import { DAGResolutionResult } from './types';

export interface MinimalNode {
  id: string;
}

export interface MinimalEdge {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

/**
 * Resolves the Directed Acyclic Graph (DAG) into topologically sorted execution stages
 * using Kahn's Algorithm. Also detects cycles and isolated subgraphs.
 */
export function resolveDAG(
  nodes: MinimalNode[],
  edges: MinimalEdge[]
): DAGResolutionResult {
  const nodeIds = new Set(nodes.map((n) => n.id));

  // Filter edges to only include ones between valid nodes
  const validEdges = edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  // Build adjacency list and in-degree map
  const inDegree: Record<string, number> = {};
  const adjacencyList: Record<string, string[]> = {};

  for (const node of nodes) {
    inDegree[node.id] = 0;
    adjacencyList[node.id] = [];
  }

  for (const edge of validEdges) {
    inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    adjacencyList[edge.source].push(edge.target);
  }

  // Find all root nodes (in-degree == 0)
  let currentWave = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);

  const stages: string[][] = [];
  const sortedNodeIds: string[] = [];
  const inDegreeCopy = { ...inDegree };

  while (currentWave.length > 0) {
    stages.push([...currentWave]);
    sortedNodeIds.push(...currentWave);

    const nextWave: string[] = [];

    for (const nodeId of currentWave) {
      for (const neighborId of adjacencyList[nodeId] || []) {
        inDegreeCopy[neighborId] -= 1;
        if (inDegreeCopy[neighborId] === 0) {
          nextWave.push(neighborId);
        }
      }
    }

    currentWave = nextWave;
  }

  const hasCycle = sortedNodeIds.length !== nodes.length;
  let cycleNodes: string[] | undefined;

  if (hasCycle) {
    cycleNodes = nodes
      .filter((n) => !sortedNodeIds.includes(n.id))
      .map((n) => n.id);
  }

  return {
    hasCycle,
    cycleNodes,
    stages,
    sortedNodeIds,
  };
}

/**
 * Returns true if the graph contains any cycle.
 */
export function hasCycles(nodes: MinimalNode[], edges: MinimalEdge[]): boolean {
  return resolveDAG(nodes, edges).hasCycle;
}

/**
 * Returns the partitioned topological stages (waves) of node IDs.
 */
export function getExecutionStages(
  nodes: MinimalNode[],
  edges: MinimalEdge[]
): string[][] {
  const result = resolveDAG(nodes, edges);
  if (result.hasCycle) {
    throw new Error(
      `Cannot generate execution stages: cycle detected involving nodes: ${result.cycleNodes?.join(', ')}`
    );
  }
  return result.stages;
}

/**
 * Get all immediate parent node IDs for a specific target node.
 */
export function getParentNodeIds(targetId: string, edges: MinimalEdge[]): string[] {
  return edges.filter((e) => e.target === targetId).map((e) => e.source);
}

/**
 * Get all immediate child node IDs for a specific source node.
 */
export function getChildNodeIds(sourceId: string, edges: MinimalEdge[]): string[] {
  return edges.filter((e) => e.source === sourceId).map((e) => e.target);
}
