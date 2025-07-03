import React from 'react';
import { useCats } from '../context/CatContext';
import { calculateAge, formatDate } from '../utils/constants';
import PhotoManager from './PhotoManager';
import RequirePermission, { usePermissions } from './RequirePermission';
import { useLanguage } from '../context/LanguageContext';

const CatDetail = ({ onEdit, onBack }) => {
  const { selectedCat, deleteCat } = useCats();
  const { hasPermission } = usePermissions();
  const languageContext = useLanguage();
  const t = languageContext?.t || (key => key);

  if (!selectedCat) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('catDetail.noData')}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
        >
          {t('general.back')}
        </button>
      </div>
    );
  }

  const cat = selectedCat;
  const age = calculateAge(cat.fechaNacimiento);

  const handleDelete = async () => {
    if (window.confirm(t('catDetail.confirmDelete'))) {
      try {
        await deleteCat(cat.id);
        onBack();
      } catch (error) {
        console.error('Error al eliminar el gato:', error);
      }
    }
  };

  const getCompatibilityInfo = () => {
    const compatibility = [];
    if (cat.familia) compatibility.push(t('catDetail.families'));
    if (cat.compatibleNinos) compatibility.push(t('catDetail.children'));
    if (cat.casaTranquila) compatibility.push(t('catDetail.quietHome'));
    return compatibility.length > 0 ? compatibility.join(', ') : t('catDetail.notSpecified');
  };

  const getEnvironmentInfo = () => {
    const environment = [];
    if (cat.gatoAireLibre) environment.push(t('catDetail.outdoor'));
    if (cat.gatoInterior) environment.push(t('catDetail.indoor'));
    return environment.length > 0 ? environment.join(', ') : t('catDetail.notSpecified');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('general.back')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{cat.nombre}</h1>
        </div>
        
        <div className="flex space-x-3">
          <RequirePermission permission="canEdit">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              {t('general.edit')}
            </button>
          </RequirePermission>
          
          <RequirePermission permission="canDelete">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              {t('catDetail.markDeceased')}
            </button>
          </RequirePermission>
          
          <RequirePermission permission="canAdopt">
            <button
              onClick={() => alert(t('catDetail.adoptionProcessStarted'))}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              {t('catDetail.startAdoption')}
            </button>
          </RequirePermission>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sección de fotos - Carrusel grande */}
        <div className="w-full">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('catDetail.photos')}</h2>
            <div className="max-w-3xl mx-auto">
              <PhotoManager 
                catId={cat.id} 
                catName={cat.nombre}
                photos={cat.fotos || []} 
                readOnly={!hasPermission('canManagePhotos')} 
              />
              {cat.fotos && cat.fotos.length > 0 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {cat.fotos.length} {cat.fotos.length === 1 ? t('catDetail.photo') : t('catDetail.photos')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información - Grid de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('catDetail.basicInfo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('catForm.name')}</label>
                <p className="mt-1 text-sm text-gray-900">{cat.nombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('catDetail.age')}</label>
                <p className="mt-1 text-sm text-gray-900">{age}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('catForm.sex')}</label>
                <p className="mt-1 text-sm text-gray-900">{cat.sexo ? t('catForm.male') : t('catForm.female')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('catForm.collectionPlace')}</label>
                <p className="mt-1 text-sm text-gray-900">{cat.lugarRecogida}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('catForm.birthDate')}</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(cat.fechaNacimiento)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('catForm.arrivalYear')}</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(cat.anoLlegada)}</p>
              </div>
            </div>
          </div>

          {/* Estado de salud */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('catDetail.healthInfo')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">{t('catForm.tested')}:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cat.testado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {cat.testado ? t('searchFilters.yes') : t('searchFilters.no')}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">{t('catForm.neutered')}:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cat.castrado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {cat.castrado ? t('searchFilters.yes') : t('searchFilters.no')}
                </span>
              </div> 
            </div>
          </div>

          {/* Estado actual */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('catDetail.currentStatus')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">{t('catDetail.adopted')}:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cat.adoptado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {cat.adoptado ? t('searchFilters.yes') : t('searchFilters.no')}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">{t('catDetail.sponsored')}:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cat.apadrinado ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {cat.apadrinado ? t('searchFilters.yes') : t('searchFilters.no')}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">{t('catDetail.missing')}:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cat.desaparecido ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {cat.desaparecido ? t('searchFilters.yes') : t('searchFilters.no')}
                </span>
              </div>
              {cat.fechaFallecido && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-3">{t('catDetail.deathDate')}:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {formatDate(cat.fechaFallecido)}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Carácter y compatibilidad */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('catDetail.characterAndCompatibility')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">{t('catDetail.character')}</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {cat.caracter || t('catDetail.notSpecified')}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('catDetail.compatibleWith')}</label>
                  <p className="mt-1 text-sm text-gray-900">{getCompatibilityInfo()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t('catDetail.preferredEnvironment')}</label>
                  <p className="mt-1 text-sm text-gray-900">{getEnvironmentInfo()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Historia */}
          {cat.historia && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('catDetail.history')}</h2>
              <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md leading-relaxed">
                {cat.historia}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatDetail;