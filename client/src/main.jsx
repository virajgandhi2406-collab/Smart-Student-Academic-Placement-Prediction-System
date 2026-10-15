import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { setupLiveMockInterceptor } from './services/mockBackend';
import './index.css';

// Initialize in-browser live simulation layer for GitHub Pages
setupLiveMockInterceptor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
