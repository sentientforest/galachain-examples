import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Welcome to Electron Desktop Application</h1>
      <p>Start editing src/renderer/App.tsx to customize this application</p>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
