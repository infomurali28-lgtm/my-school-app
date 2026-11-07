import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { ThemeLanguageProvider } from './context/ThemeLanguageContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeLanguageProvider>
        <App />
      </ThemeLanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
