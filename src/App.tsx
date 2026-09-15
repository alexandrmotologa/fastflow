import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Header } from './components/Header';
import { NodeSidebar } from './components/NodeSidebar';
import { FlowCanvas } from './components/FlowCanvas';
import { NodeConfigDrawer } from './components/NodeConfigDrawer';
import { ExecutionDebugger } from './components/ExecutionDebugger';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Top Header Controls */}
      <Header />

      {/* Main Workspace Canvas & Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        <NodeSidebar />

        <ReactFlowProvider>
          <FlowCanvas />
        </ReactFlowProvider>

        <NodeConfigDrawer />
      </div>

      {/* Bottom Collapsible Debug Console */}
      <ExecutionDebugger />
    </div>
  );
};

export default App;
