import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CatProvider } from './context/CatContext';
import { LanguageProvider } from './context/LanguageContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TestLoginComponent from './components/TestLoginComponent';

// Este componente usa useAuth después de que AuthProvider esté disponible
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Verificar si estamos en la ruta de prueba
  const isTestPath = window.location.pathname === '/test-login';
  
  if (isTestPath) {
    return <TestLoginComponent />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-3 text-indigo-600">Cargando...</p>
          </div>
        </div>
      ) : isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CatProvider>
          <AppContent />
        </CatProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;