import React, { createContext, useContext, useState, useEffect } from 'react';
// Importar el servicio de mock en lugar del servicio real para desarrollo
import { mockCatService as catService } from '../services/mockCatService';

const CatContext = createContext();

// NOTA TEMPORAL: Este contexto está utilizando datos mockados
// Cuando la integración con Supabase esté lista, cambiar la importación
// de mockCatService de vuelta a catService real

export const useCats = () => {
  const context = useContext(CatContext);
  if (!context) {
    throw new Error('useCats must be used within a CatProvider');
  }
  return context;
};

export const CatProvider = ({ children }) => {
  const [cats, setCats] = useState([]);
  const [filteredCats, setFilteredCats] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    loadCats();
  }, []);

  const loadCats = async () => {
    setLoading(true);
    try {
      const data = await catService.getAllCats();
      setCats(data);
      setFilteredCats(data);
    } catch (err) {
      console.error('Error cargando los gatos:', err);
      setError('Error cargando los gatos');
    } finally {
      setLoading(false);
    }
  };

  const createCat = async (catData) => {
    try {
      const newCat = await catService.createCat(catData);
      setCats(prev => [...prev, newCat]);
      
      // Aplicar filtros actuales al nuevo conjunto de datos
      if (Object.keys(activeFilters).length > 0) {
        applyFilters(activeFilters);
      } else {
        setFilteredCats(prev => [...prev, newCat]);
      }
      
      return newCat;
    } catch (err) {
      console.error('Error creando el gato:', err);
      setError('Error creando el gato');
      throw err;
    }
  };

  const updateCat = async (id, catData) => {
    try {
      const updatedCat = await catService.updateCat(id, catData);
      setCats(prev => prev.map(cat => cat.id === id ? updatedCat : cat));
      
      // Aplicar filtros actuales al nuevo conjunto de datos
      if (Object.keys(activeFilters).length > 0) {
        applyFilters(activeFilters);
      } else {
        setFilteredCats(prev => prev.map(cat => cat.id === id ? updatedCat : cat));
      }
      
      if (selectedCat && selectedCat.id === id) {
        setSelectedCat(updatedCat);
      }
      
      return updatedCat;
    } catch (err) {
      console.error('Error actualizando el gato:', err);
      setError('Error actualizando el gato');
      throw err;
    }
  };

  const deleteCat = async (id) => {
    try {
      await catService.deleteCat(id);
      
      // Actualizar el estado local con la fecha de fallecimiento
      const today = new Date().toISOString().split('T')[0];
      
      setCats(prev => prev.map(cat => 
        cat.id === parseInt(id) ? { ...cat, fechaFallecido: today } : cat
      ));
      
      // Aplicar filtros actuales al nuevo conjunto de datos
      if (Object.keys(activeFilters).length > 0) {
        applyFilters(activeFilters);
      } else {
        setFilteredCats(prev => prev.filter(cat => cat.id !== parseInt(id)));
      }
      
      // Si el gato seleccionado es el que se está eliminando, deseleccionarlo
      if (selectedCat && selectedCat.id === parseInt(id)) {
        setSelectedCat(null);
      }
      
    } catch (err) {
      console.error('Error eliminando el gato:', err);
      setError('Error eliminando el gato');
      throw err;
    }
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    
    // Aplicar filtros localmente (esto mejora la experiencia de usuario)
    let filtered = cats.filter(cat => !cat.fechaFallecido); // Excluir gatos fallecidos por defecto

    if (filters.nombre) {
      filtered = filtered.filter(cat => 
        cat.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
      );
    }

    if (filters.sexo !== undefined && filters.sexo !== '') {
      const sexoValue = filters.sexo === 'true' || filters.sexo === true;
      filtered = filtered.filter(cat => cat.sexo === sexoValue);
    }

    if (filters.adoptado !== undefined && filters.adoptado !== '') {
      const adoptadoValue = filters.adoptado === 'true' || filters.adoptado === true;
      filtered = filtered.filter(cat => cat.adoptado === adoptadoValue);
    }

    if (filters.testado !== undefined && filters.testado !== '') {
      const testadoValue = filters.testado === 'true' || filters.testado === true;
      filtered = filtered.filter(cat => cat.testado === testadoValue);
    }

    if (filters.castrado !== undefined && filters.castrado !== '') {
      const castradoValue = filters.castrado === 'true' || filters.castrado === true;
      filtered = filtered.filter(cat => cat.castrado === castradoValue);
    }

    if (filters.apadrinado !== undefined && filters.apadrinado !== '') {
      const apadrinadoValue = filters.apadrinado === 'true' || filters.apadrinado === true;
      filtered = filtered.filter(cat => cat.apadrinado === apadrinadoValue);
    }

    if (filters.lugarRecogida) {
      filtered = filtered.filter(cat => 
        cat.lugarRecogida.toLowerCase().includes(filters.lugarRecogida.toLowerCase())
      );
    }

    setFilteredCats(filtered);
  };

  const searchCats = async (filters) => {
    try {
      setLoading(true);
      
      // Realizar búsqueda en la API
      const data = await catService.searchCats(filters);
      setFilteredCats(data);
      
      // Guardar filtros activos
      setActiveFilters(filters);
    } catch (err) {
      console.error('Error buscando gatos:', err);
      setError('Error en la búsqueda de gatos');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cats,
    filteredCats,
    selectedCat,
    loading,
    error,
    setSelectedCat,
    createCat,
    updateCat,
    deleteCat,
    searchCats,
    loadCats,
    clearError: () => setError(null),
  };

  return (
    <CatContext.Provider value={value}>
      {children}
    </CatContext.Provider>
  );
};