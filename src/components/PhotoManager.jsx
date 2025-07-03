import React, { useState, useEffect } from 'react';
import catService from '../services/catService';

const PhotoManager = ({ catId, photos = [], onPhotosChange, readOnly = false, catName }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  
  // Función para recargar fotos desde el storage
  const reloadPhotosFromStorage = async () => {
    if (!catName) return;
    
    try {
      setLoadingPhotos(true);
      const storagePhotos = await catService.getBucketPhotosForCat(catName);
      
      if (storagePhotos && storagePhotos.length > 0) {
        // Si tenemos un callback para actualizar las fotos, lo usamos
        if (onPhotosChange) {
          onPhotosChange(storagePhotos);
        }
      }
    } catch (error) {
      console.error('Error al cargar fotos desde el storage:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };
  
  // Cargar fotos cuando cambia el catId o catName
  useEffect(() => {
    if (catName) {
      reloadPhotosFromStorage();
    }
  }, [catName]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto = event.target.result;
        const updatedPhotos = [...photos, newPhoto];
        onPhotosChange?.(updatedPhotos);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUrlAdd = () => {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url && url.trim()) {
      const updatedPhotos = [...photos, url.trim()];
      onPhotosChange?.(updatedPhotos);
    }
  };

  const removePhoto = (index) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
      const updatedPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange?.(updatedPhotos);
      
      // Ajustar la foto seleccionada si es necesario
      if (selectedPhoto >= updatedPhotos.length) {
        setSelectedPhoto(Math.max(0, updatedPhotos.length - 1));
      }
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const updatedPhotos = [...photos];
    const draggedPhoto = updatedPhotos[draggedIndex];
    
    // Remover el elemento arrastrado
    updatedPhotos.splice(draggedIndex, 1);
    
    // Insertarlo en la nueva posición
    updatedPhotos.splice(dropIndex, 0, draggedPhoto);
    
    onPhotosChange?.(updatedPhotos);
    setSelectedPhoto(dropIndex);
    setDraggedIndex(null);
  };

  if (photos.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm">No hay fotos disponibles</p>
          </div>
        </div>
        
        {!readOnly && (
          <div className="space-y-2">
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id={`file-upload-${catId}`}
              />
              <label
                htmlFor={`file-upload-${catId}`}
                className="w-full flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Subir Fotos
              </label>
            </div>

          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Foto principal */}
      <div className="relative">
        <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={photos[selectedPhoto]}
            alt={`Foto ${selectedPhoto + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZMMTAuNTg2IDkuNDE0QzExLjM2NyA4LjYzMyAxMi42MzMgOC42MzMgMTMuNDE0IDkuNDE0TDE2IDEyTTEyIDhIMTJNNiAyMEgxOEMyMC4yMDkxIDIwIDIyIDE4LjIwOTEgMjIgMTZWOEMyMiA1Ljc5MDg2IDIwLjIwOTEgNCA1IDRINkM0Ljc5MDg2IDQgNCA0Ljc5MDg2IDQgNlYxNkM0IDE4LjIwOTEgNS43OTA4NiAyMCA4IDIwWiIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
            }}
          />
        </div>
        
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setSelectedPhoto(prev => prev > 0 ? prev - 1 : photos.length - 1)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setSelectedPhoto(prev => prev < photos.length - 1 ? prev + 1 : 0)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {!readOnly && (
          <button
            onClick={() => removePhoto(selectedPhoto)}
            className="absolute top-2 right-2 bg-red-600 bg-opacity-80 text-white p-1 rounded-full hover:bg-opacity-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
          {selectedPhoto + 1} / {photos.length}
        </div>
      </div>

      {/* Miniaturas */}
      {photos.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <div
              key={index}
              className={`relative flex-shrink-0 cursor-pointer ${!readOnly ? 'cursor-move' : ''}`}
              draggable={!readOnly}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div
                className={`w-16 h-16 rounded border-2 overflow-hidden transition ${
                  selectedPhoto === index ? 'border-indigo-500' : 'border-gray-300'
                }`}
                onClick={() => setSelectedPhoto(index)}
              >
                <img
                  src={photo}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZMMTAuNTg2IDkuNDE0QzExLjM2NyA4LjYzMyAxMi42MzMgOC42MzMgMTMuNDE0IDkuNDE0TDE2IDEyTTEyIDhIMTJNNiAyMEgxOEMyMC4yMDkxIDIwIDIyIDE4LjIwOTEgMjIgMTZWOEMyMiA1Ljc5MDg2IDIwLjIwOTEgNCA1IDRINkM0Ljc5MDg2IDQgNCA0Ljc5MDg2IDQgNlYxNkM0IDE4LjIwOTEgNS43OTA4NiAyMCA4IDIwWiIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controles de subida */}
      {!readOnly && (
        <div className="space-y-2">
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id={`file-upload-${catId}`}
            />
            <label
              htmlFor={`file-upload-${catId}`}
              className="w-full flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir más fotos
            </label>
          </div>

        </div>
      )}
    </div>
  );
};

export default PhotoManager;