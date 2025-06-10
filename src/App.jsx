import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CatProvider } from './context/CatContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CatProvider>
        <AppContent />
      </CatProvider>
    </AuthProvider>
  );
}

export default App;