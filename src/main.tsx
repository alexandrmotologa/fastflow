import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useFlowStore } from './store/useFlowStore';

(window as any).useFlowStore = useFlowStore;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
