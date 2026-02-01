import React from 'react';
import ReactDOM from 'react-dom/client';
console.log("🚀 Index.tsx is starting...");
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

console.log("🚀 Root element finding...");
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("❌ Could not find root element!");
  throw new Error("Could not find root element to mount to");
}

console.log("🚀 React rendering...");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
console.log("🚀 React render called!");
