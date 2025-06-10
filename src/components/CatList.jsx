import React from 'react';
import { useCats } from '../context/CatContext';
import CatCard from './CatCard';

const CatList = ({ onViewDetail }) => {
  const { filteredCats, loading, setSelectedCat } = useCats();

  const handleViewDetail = (cat) => {
    setSelectedCat(cat);
    onViewDetail(cat);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (filteredCats.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No se encontraron gatos</div>
        <p className="text-gray-400">Prueba ajustando los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Gatos Disponibles ({filteredCats.length})
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCats.map((cat) => (
          <CatCard 
            key={cat.id} 
            cat={cat} 
            onViewDetail={() => handleViewDetail(cat)}
          />
        ))}
      </div>
    </div>
  );
};

export default CatList;