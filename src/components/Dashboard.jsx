import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCats } from '../context/CatContext';
import { useLanguage } from '../context/LanguageContext';
import { usePermissions } from './RequirePermission';
import SearchFilters from './SearchFilters';
import CatList from './CatList';
import CatDetail from './CatDetail';
import CatForm from './CatForm';
import LanguageSelector from './LanguageSelector';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { selectedCat, error, clearError } = useCats();
  const { t } = useLanguage();
  const { hasPermission } = usePermissions();
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
      {/* Header - Nueva versión con logo */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            {/* Zona izquierda - Logo y nombre */}
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/images/Logo_grau_mit-deutsch-300x176.jpg" 
                alt="Logo Un Techo Para Gatos Callejeros" 
                className="h-14 w-auto"
              />
              <h1 className="text-xl font-bold text-gray-900 hidden md:block">
                {t('general.appName')}
              </h1>
            </div>
            
            {/* Zona central - Navegación */}
            <div className="flex space-x-2 justify-center">
              <button
                onClick={() => handleViewChange('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentView === 'list'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('catList.title')}
              </button>
              
              {/* Solo mostrar el botón de añadir si tiene permiso */}
              {hasPermission('canCreate') && (
                <button
                  onClick={() => handleViewChange('create')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    currentView === 'create'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t('catList.addNew')}
                </button>
              )}
              
              {/* Botón de administración de usuarios solo para administradores */}
              {hasPermission('canManageUsers') && (
                <button
                  onClick={() => alert('Funcionalidad de administración de usuarios en desarrollo')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 transition"
                >
                  {t('dashboard.manageUsers')}
                </button>
              )}
            </div>
            
            {/* Zona derecha - Usuario, idioma y logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center text-sm text-gray-700">
                <span className="mr-1">{t('dashboard.welcome')},</span>
                <span className="font-medium">{user?.nombre}</span>
                {user?.rol && (
                  <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {user.rol}
                  </span>
                )}
              </div>
              
              <LanguageSelector />
              
              <button
                onClick={logout}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
              >
                {t('general.logout')}
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