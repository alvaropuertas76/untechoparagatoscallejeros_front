import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCats } from '../context/CatContext';
import SearchFilters from './SearchFilters';
import CatList from './CatList';
import CatDetail from './CatDetail';
import CatForm from './CatForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { selectedCat, error, clearError } = useCats();
  const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'create', 'edit'

  const handleViewChange = (view, cat = null) => {
    setCurrentView(view);
    if (cat) {
      // Si se pasa un gato, se establece como seleccionado
    }
  };

  const handleCreateSuccess = () => {
    setCurrentView('list');
  };

  const handleEditSuccess = () => {
    setCurrentView('detail');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Gatos
              </h1>
              <span className="text-sm text-gray-500">
                Asociación Protectora de Mallorca
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bienvenido, {user?.username}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewChange('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    currentView === 'list'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => handleViewChange('create')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    currentView === 'create'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Añadir Gato
                </button>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'list' && (
          <div className="space-y-6">
            <SearchFilters />
            <CatList onViewDetail={(cat) => handleViewChange('detail', cat)} />
          </div>
        )}
        
        {currentView === 'detail' && selectedCat && (
          <CatDetail 
            onEdit={() => handleViewChange('edit')}
            onBack={() => handleViewChange('list')}
          />
        )}
        
        {currentView === 'create' && (
          <CatForm 
            onSuccess={handleCreateSuccess}
            onCancel={() => handleViewChange('list')}
          />
        )}
        
        {currentView === 'edit' && selectedCat && (
          <CatForm 
            cat={selectedCat}
            onSuccess={handleEditSuccess}
            onCancel={() => handleViewChange('detail')}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;