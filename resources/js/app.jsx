import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import MainApp from './MainApp';
import { AuthProvider } from './context/AuthContext.jsx';
import { DarkModeProvider } from './hooks/useDarkMode.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DarkModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainApp />
        </BrowserRouter>
      </AuthProvider>
    </DarkModeProvider>
  </React.StrictMode>
);