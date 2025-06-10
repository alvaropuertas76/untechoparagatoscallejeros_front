import React, { createContext, useContext, useState, useEffect } from 'react';
import { catService } from '../services/catService';

const CatContext = createContext();

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
      setError('Error cargando los gatos');
    } finally {
      setLoading(false);
    }
  };

  const createCat = async (catData) => {
    try {
      const newCat = await catService.createCat(catData);
      setCats(prev => [...prev, newCat]);
      setFilteredCats(prev => [...prev, newCat]);
      return newCat;
    } catch (err) {
      setError('Error creando el gato');
      throw err;
    }
  };

  const updateCat = async (id, catData) => {
    try {
      const updatedCat = await catService.updateCat(id, catData);
      setCats(prev => prev.map(cat => cat.id === id ? updatedCat : cat));
      setFilteredCats(prev => prev.map(cat => cat.id === id ? updatedCat : cat));
      if (selectedCat && selectedCat.id === id) {
        setSelectedCat(updatedCat);
      }
      return updatedCat;
    } catch (err) {
      setError('Error actualizando el gato');
      throw err;
    }
  };

  const deleteCat = async (id) => {
    try {
      await catService.deleteCat(id);
      setCats(prev => prev.map(cat => 
        cat.id === id ? { ...cat, fechaFallecido: new Date().toISOString().split('T')[0] } : cat
      ));
      setFilteredCats(prev => prev.map(cat => 
        cat.id === id ? { ...cat, fechaFallecido: new Date().toISOString().split('T')[0] } : cat
      ));
    } catch (err) {
      setError('Error eliminando el gato');
      throw err;
    }
  };

  const searchCats = (filters) => {
    let filtered = cats.filter(cat => !cat.fechaFallecido); // Excluir gatos fallecidos por defecto

    if (filters.nombre) {
      filtered = filtered.filter(cat => 
        cat.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
      );
    }

    if (filters.sexo !== '') {
      filtered = filtered.filter(cat => cat.sexo === filters.sexo);
    }

    if (filters.adoptado !== '') {
      filtered = filtered.filter(cat => cat.adoptado === filters.adoptado);
    }

    if (filters.testado !== '') {
      filtered = filtered.filter(cat => cat.testado === filters.testado);
    }

    if (filters.castrado !== '') {
      filtered = filtered.filter(cat => cat.castrado === filters.castrado);
    }

    if (filters.apadrinado !== '') {
      filtered = filtered.filter(cat => cat.apadrinado === filters.apadrinado);
    }

    if (filters.lugarRecogida) {
      filtered = filtered.filter(cat => 
        cat.lugarRecogida.toLowerCase().includes(filters.lugarRecogida.toLowerCase())
      );
    }

    setFilteredCats(filtered);
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