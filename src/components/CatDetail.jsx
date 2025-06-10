import React from 'react';
import { useCats } from '../context/CatContext';
import { calculateAge, formatDate } from '../utils/constants';
import PhotoManager from './PhotoManager';

const CatDetail = ({ onEdit, onBack }) => {
  const { selectedCat, deleteCat } = useCats();

  if (!selectedCat) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay gato seleccionado</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const cat = selectedCat;
  const age = calculateAge(cat.fechaNacimiento);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres marcar este gato como fallecido?')) {
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
    if (cat.familia) compatibility.push('Familias');
    if (cat.compatibleNinos) compatibility.push('Niños');
    if (cat.casaTranquila) compatibility.push('Casa tranquila');
    return compatibility.length > 0 ? compatibility.join(', ') : 'No especificado';
  };

  const getEnvironmentInfo = () => {
    const environment = [];
    if (cat.gatoAireLibre) environment.push('Aire libre');
    if (cat.gatoInterior) environment.push('Interior');
    return environment.length > 0 ? environment.join(', ') : 'No especificado';
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
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{cat.nombre}</h1>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Marcar Fallecido
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Fotos */}
        <div className="lg:col-span-1">
          <PhotoManager catId={cat.id} photos={cat.fotos || []} readOnly />
        </div>

        {/* Columna derecha - Información */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nombre</label>
                <p className="mt-1 text-sm text-gray-900">{cat.nombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Edad</label>
                <p className="mt-1 text-sm text-gray-900">{age}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Sexo</label>
                <p className="mt-1 text-sm text-gray-900">{cat.sexo ? 'Macho' : 'Hembra'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Lugar de recogida</label>
                <p className="mt-1 text-sm text-gray-900">{cat.lugarRecogida}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Fecha de nacimiento</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(cat.fechaNacimiento)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Año de llegada</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(cat.anoLlegada)}</p>
              </div>
            </div>
          </div>

          {/* Estado de salud */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado de Salud</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">Testado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cat.testado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {cat.testado ? 'Sí' : 'No'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">Castrado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cat.castrado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {cat.castrado ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Estado actual */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado Actual</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">Adoptado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cat.adoptado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {cat.adoptado ? 'Sí' : 'No'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">Apadrinado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cat.apadrinado ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {cat.apadrinado ? 'Sí' : 'No'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">Desaparecido:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cat.desaparecido ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {cat.desaparecido ? 'Sí' : 'No'}
                </span>
              </div>
              {cat.fechaFallecido && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-3">Fecha fallecimiento:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {formatDate(cat.fechaFallecido)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Carácter y compatibilidad */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Carácter y Compatibilidad</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Carácter</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {cat.caracter || 'No especificado'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Compatible con</label>
                  <p className="mt-1 text-sm text-gray-900">{getCompatibilityInfo()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Entorno preferido</label>
                  <p className="mt-1 text-sm text-gray-900">{getEnvironmentInfo()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Historia */}
          {cat.historia && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Historia</h2>
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