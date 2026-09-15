# FastFlow

FastFlow is a visual Directed Acyclic Graph (DAG) workflow builder and simulation engine that runs in the browser. It executes graph resolution, cycle detection, and step-by-step simulations directly on the client, with animated data conduits showing payloads moving between nodes.

Traditional automation tools require heavy server infrastructure, database queues, and background workers even for simple testing and debugging. FastFlow moves workflow simulation into the browser using Kahn's algorithm for topological sorting and React Flow for visual editing.

## Features

- **Client-side DAG engine**: Resolves node execution order using Kahn's algorithm in O(V + E) time. Automatically detects cycles and partitions nodes into parallel execution waves.
- **Visual conduit pulses**: Custom SVG edges animate data packets traveling between nodes during execution.
- **Interactive simulation**: Run full pipelines, step through individual execution waves, or pause runs to inspect data.
- **Node parameter drawer**: Configure endpoints, JSON transformations, regular expressions, LLM prompts, and conditional rules.
- **Execution console**: Inspect stage runtimes, system logs, and live JSON payloads for each node.
- **Pre-configured workflows**: Includes templates for AI lead enrichment, PostgreSQL data sanitation, and order fraud triage.
- **Portable workflows**: Export and import workflow graphs as standard JSON files.

## Node types

The engine includes five node categories:

- **Triggers**: Webhook listeners and cron schedulers that generate initial payloads.
- **Transforms**: JSON field mappers and regular expression extractors for data normalization.
- **Actions**: LLM prompts (Claude 3.5 Sonnet simulation) and outbound HTTP API requests.
- **Logic**: Conditional branches (if/else) with multi-handle output routing.
- **Outputs**: Slack notification dispatchers and PostgreSQL upsert statement generators.

## Technical stack

- **Framework**: React 18 with TypeScript and Vite
- **Graph canvas**: `@xyflow/react` (React Flow v12)
- **State management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Test suite**: Vitest

## Getting started

### Prerequisites

You need Node.js 18 or higher installed on your system.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/alexandrmotologa/fastflow.git
cd fastflow
npm install
```

### Development server

Start the local development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### Running tests

Run the unit test suite:

```bash
npm test
```

### Production build

Compile the TypeScript code and generate static assets:

```bash
npm run build
```

## Architecture

FastFlow separates the execution engine from the visual canvas:

1. **Graph resolution (`src/engine/dag_resolver.ts`)**: Calculates in-degrees for every node and builds an adjacency list. It pulls nodes with zero in-degrees into wave 0, decrements downstream neighbor degrees, and repeats until all nodes are ordered or a cycle is found.
2. **Execution runner (`src/engine/execution_runner.ts`)**: Iterates through topological waves. Nodes within the same wave run concurrently via `Promise.allSettled`. Outputs from parent nodes are merged and passed into child inputs.
3. **Reactive store (`src/store/useFlowStore.ts`)**: Connects React Flow graph updates, node selection, edge pulse tracking, and debugger logs into a single reactive store.
4. **Canvas components (`src/components/`)**: Renders custom node shells with status halos (idle, running, success, failed, skipped) and animated SVG conduit edges.

## License

MIT License. See [LICENSE](LICENSE) for details.
