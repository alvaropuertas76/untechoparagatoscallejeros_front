import React, { useState } from 'react';
import { useCats } from '../context/CatContext';

const SearchFilters = () => {
  const { searchCats } = useCats();
  const [filters, setFilters] = useState({
    nombre: '',
    sexo: '',
    adoptado: '',
    testado: '',
    castrado: '',
    apadrinado: '',
    lugarRecogida: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    searchCats(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      nombre: '',
      sexo: '',
      adoptado: '',
      testado: '',
      castrado: '',
      apadrinado: '',
      lugarRecogida: ''
    };
    setFilters(emptyFilters);
    searchCats(emptyFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-800 transition"
        >
          Limpiar filtros
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            name="nombre"
            value={filters.nombre}
            onChange={handleInputChange}
            placeholder="Buscar por nombre..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Lugar de recogida */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lugar de recogida
          </label>
          <input
            type="text"
            name="lugarRecogida"
            value={filters.lugarRecogida}
            onChange={handleInputChange}
            placeholder="Buscar por lugar..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Sexo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo
          </label>
          <select
            name="sexo"
            value={filters.sexo}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="">Todos</option>
            <option value={true}>Macho</option>
            <option value={false}>Hembra</option>
          </select>
        </div>

        {/* Adoptado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado de adopción
          </label>
          <select
            name="adoptado"
            value={filters.adoptado}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="">Todos</option>
            <option value={true}>Adoptado</option>
            <option value={false}>Disponible</option>
          </select>
        </div>

        {/* Testado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Testado
          </label>
          <select
            name="testado"
            value={filters.testado}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="">Todos</option>
            <option value={true}>Sí</option>
            <option value={false}>No</option>
          </select>
        </div>

        {/* Castrado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Castrado
          </label>
          <select
            name="castrado"
            value={filters.castrado}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="">Todos</option>
            <option value={true}>Sí</option>
            <option value={false}>No</option>
          </select>
        </div>

        {/* Apadrinado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apadrinado
          </label>
          <select
            name="apadrinado"
            value={filters.apadrinado}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="">Todos</option>
            <option value={true}>Sí</option>
            <option value={false}>No</option>
          </select>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {Object.values(filters).some(value => value !== '') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">Filtros activos:</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters)
                .filter(([key, value]) => value !== '')
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs"
                  >
                    {key}: {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;