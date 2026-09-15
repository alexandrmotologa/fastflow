# FastFlow architecture and engine mechanics

This document details the internal design of FastFlow, including graph resolution, cycle detection, execution wave scheduling, and conduit edge animation.

## System overview

FastFlow is organized into three distinct layers:

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer                            │
│  FlowCanvas · NodeSidebar · NodeConfigDrawer · Debugger │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                  State Management                       │
│              Zustand Store (useFlowStore)               │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                    Execution Engine                     │
│    DAG Resolver (Kahn) · Wave Scheduler · Registry      │
└─────────────────────────────────────────────────────────┘
```

## DAG resolution and Kahn's algorithm

Workflow nodes form a directed graph $G = (V, E)$, where $V$ represents the set of nodes and $E$ represents directed data edges from a source node to a target node.

To execute the workflow correctly, two conditions must be satisfied:
1. The graph must be acyclic (no node depends directly or indirectly on its own output).
2. A node must only execute after all its parent dependencies have completed.

### Resolution algorithm

The resolver in `src/engine/dag_resolver.ts` implements Kahn's algorithm:

1. **In-degree calculation**: Count the number of incoming edges for each node:
   $$\text{inDegree}(v) = |\{u \in V \mid (u, v) \in E\}|$$
2. **Adjacency mapping**: Build an outgoing edge lookup table:
   $$\text{adj}[u] = \{v \in V \mid (u, v) \in E\}$$
3. **Queue initialization**: Find all root nodes with $\text{inDegree}(v) = 0$. These nodes form wave 0.
4. **Wave traversal**:
   - For each node in the current wave, iterate through its neighbors in $\text{adj}[u]$ and decrement their in-degree by 1.
   - Any neighbor whose in-degree reaches 0 is added to the next wave queue.
   - Record the wave array into the stages list.
   - Repeat until the queue is empty.
5. **Cycle check**: If the total count of sorted nodes does not equal the total number of nodes in the graph ($|V| \neq \sum |\text{wave}_i|$), a cycle exists. The unvisited nodes are reported as cycle participants.

### Complexity

- **Time complexity**: $O(|V| + |E|)$, where $|V|$ is the number of nodes and $|E|$ is the number of edges.
- **Space complexity**: $O(|V| + |E|)$ to store the adjacency list and in-degree counter.

## Wave-based parallel execution

FastFlow groups independent nodes into the same stage so they run concurrently:

```
Stage 0: [ Webhook Trigger ]
               │
               ▼
Stage 1: [ Regex Parser ]
               │
               ▼
Stage 2: [ Claude LLM ]
               │
               ▼
Stage 3: [ Slack Dispatcher ]
```

When a node completes:
1. Its output payload is stored in the engine's memory map (`nodeOutputs`).
2. If the node has conditional branching (such as `control_switch`), it marks which output handle (`true` or `false`) is active.
3. Downstream nodes inherit merged payloads from all completed parent nodes. If a downstream node is connected to an inactive conditional handle, the engine marks that node as `skipped` rather than failing.

## Animated edge conduits

During simulation, the engine signals the UI layer via the `onEdgePulse` callback:
1. When a stage finishes, all edges connecting the completed nodes to their downstream targets are added to the `activePulsingEdges` set.
2. The custom edge component (`PulseAnimatedEdge.tsx`) detects this status and renders an animated SVG overlay:
   - A glowing dashed line moving forward (`conduitFlow` keyframe animation).
   - An SVG circle with `<animateMotion>` traversing the exact bezier path.
3. Once the transport delay passes (scaled by the selected simulation speed), the pulse concludes and the next wave begins.

## Node registry and extensibility

Every node implements the `NodeDefinition` interface:

```typescript
export interface NodeDefinition {
  subtype: NodeSubtype;
  category: NodeCategory;
  displayName: string;
  defaultLabel: string;
  description: string;
  defaultConfig: Record<string, any>;
  execute: (context: NodeExecutionContext) => Promise<NodeExecutionOutput>;
}
```

To add a new node:
1. Create a definition file in `src/engine/registry/`.
2. Implement the async `execute` function.
3. Register the definition in `src/engine/registry/index.ts`.
4. The node automatically appears in the sidebar palette, configuration drawer, and canvas.
