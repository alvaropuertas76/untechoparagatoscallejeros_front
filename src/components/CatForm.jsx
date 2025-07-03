import React, { useState, useEffect } from 'react';
import { useCats } from '../context/CatContext';
import PhotoManager from './PhotoManager';

const CatForm = ({ cat, onSuccess, onCancel }) => {
  const { createCat, updateCat } = useCats();
  const isEditing = !!cat;

  const [formData, setFormData] = useState({
    nombre: '',
    fechaNacimiento: '',
    lugarRecogida: '',
    testado: false,
    castrado: false,
    sexo: true, // true = macho, false = hembra
    caracter: '',
    gatoAireLibre: false,
    gatoInterior: false,
    familia: false,
    compatibleNinos: false,
    casaTranquila: false,
    historia: '',
    apadrinado: false,
    adoptado: false,
    desaparecido: false,
    fechaFallecido: '',
    anoLlegada: '',
    fotos: []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cat) {
      setFormData({
        nombre: cat.nombre || '',
        fechaNacimiento: cat.fechaNacimiento || '',
        lugarRecogida: cat.lugarRecogida || '',
        testado: cat.testado || false,
        castrado: cat.castrado || false,
        sexo: cat.sexo ?? true,
        caracter: cat.caracter || '',
        gatoAireLibre: cat.gatoAireLibre || false,
        gatoInterior: cat.gatoInterior || false,
        familia: cat.familia || false,
        compatibleNinos: cat.compatibleNinos || false,
        casaTranquila: cat.casaTranquila || false,
        historia: cat.historia || '',
        apadrinado: cat.apadrinado || false,
        adoptado: cat.adoptado || false,
        desaparecido: cat.desaparecido || false,
        fechaFallecido: cat.fechaFallecido || '',
        anoLlegada: cat.anoLlegada || '',
        fotos: cat.fotos || []
      });
    }
  }, [cat]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Solo validamos el nombre como obligatorio cuando estamos creando un nuevo gato
    if (!isEditing && !formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    // Los demás campos no son obligatorios
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateCat(cat.id, formData);
      } else {
        await createCat(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error guardando el gato:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotosChange = (photos) => {
    setFormData(prev => ({ ...prev, fotos: photos }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? `Editar ${cat.nombre}` : 'Añadir Nuevo Gato'}
        </h1>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fotos - Ahora en la parte superior a toda la anchura */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fotos</h3>
          <PhotoManager 
            catId={cat?.id}
            photos={formData.fotos}
            onPhotosChange={handlePhotosChange}
          />
        </div>
        
        {/* Información básica */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre {!isEditing && '*'}
              </label>
              {isEditing ? (
                <p className="mt-2 text-gray-700 font-medium">{formData.nombre}</p>
              ) : (
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    !isEditing && errors.nombre ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              )}
              {!isEditing && errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
            </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sexo
                  </label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={true}>Macho</option>
                    <option value={false}>Hembra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento {!isEditing && '*'}
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      !isEditing && errors.fechaNacimiento ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {!isEditing && errors.fechaNacimiento && <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Año de Llegada {!isEditing && '*'}
                  </label>
                  <input
                    type="date"
                    name="anoLlegada"
                    value={formData.anoLlegada}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      !isEditing && errors.anoLlegada ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {!isEditing && errors.anoLlegada && <p className="mt-1 text-sm text-red-600">{errors.anoLlegada}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Lugar de Recogida {!isEditing && '*'}
                  </label>
                  <input
                    type="text"
                    name="lugarRecogida"
                    value={formData.lugarRecogida}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      !isEditing && errors.lugarRecogida ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {!isEditing && errors.lugarRecogida && <p className="mt-1 text-sm text-red-600">{errors.lugarRecogida}</p>}
                </div>
              </div>
            </div>

            {/* Estado de salud */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Salud</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="testado"
                    checked={formData.testado}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Testado</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="castrado"
                    checked={formData.castrado}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Castrado</label>
                </div>
              </div>
            </div>

            {/* Entorno y compatibilidad */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Entorno y Compatibilidad</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="gatoAireLibre"
                    checked={formData.gatoAireLibre}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Gato al aire libre</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="gatoInterior"
                    checked={formData.gatoInterior}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Gato de interior</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="familia"
                    checked={formData.familia}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Apto para familias</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="compatibleNinos"
                    checked={formData.compatibleNinos}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Compatible con niños</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="casaTranquila"
                    checked={formData.casaTranquila}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Necesita casa tranquila</label>
                </div>
              </div>
            </div>

            {/* Estado actual */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estado Actual</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="adoptado"
                    checked={formData.adoptado}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Adoptado</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="apadrinado"
                    checked={formData.apadrinado}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Apadrinado</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="desaparecido"
                    checked={formData.desaparecido}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Desaparecido</label>
                </div>
                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha de Fallecimiento
                    </label>
                    <input
                      type="date"
                      name="fechaFallecido"
                      value={formData.fechaFallecido}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Carácter e Historia */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Carácter e Historia</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Carácter
                  </label>
                  <textarea
                    name="caracter"
                    value={formData.caracter}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe el carácter del gato..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Historia
                  </label>
                  <textarea
                    name="historia"
                    value={formData.historia}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Cuenta la historia del gato..."
                  />
                </div>
              </div>
            </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CatForm;