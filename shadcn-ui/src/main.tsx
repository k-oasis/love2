import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Disable Vite's error overlay to prevent conflicts
window.addEventListener('error', (event) => {
  event.preventDefault();
});

// Initialize app after window loads completely
window.addEventListener('load', () => {
  const root = document.getElementById('root');
  
  if (!root) {
    console.error('Root element not found');
    return;
  }

  try {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
  }
});
