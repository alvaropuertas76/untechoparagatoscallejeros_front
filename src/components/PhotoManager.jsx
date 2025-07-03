import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import catService from '../services/catService'; // Importamos el servicio de gatos

const PhotoManager = ({ catId, catName, photos = [], onPhotosChange, readOnly = false }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [uploading, setUploading] = useState(false);
  const languageContext = useLanguage();
  const t = languageContext?.t || (key => key);

  // Función para mostrar notificaciones temporales
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Función para recargar todas las fotos del gato desde el storage
  const reloadPhotosFromStorage = async () => {
    if (!catId || !catName) {
      console.log('No se puede recargar fotos sin catId o catName');
      return;
    }
    
    try {
      console.log(`Recargando fotos para el gato ${catName} (ID: ${catId})`);
      
      // Agregar un timestamp a la solicitud para evitar cachés
      const timestamp = new Date().getTime();
      console.log(`Recargar fotos con timestamp: ${timestamp}`);
      
      // Obtenemos las fotos directamente del bucket
      const storagePhotos = await catService.getAllPhotosFromBucket(catName);
      
      if (storagePhotos && storagePhotos.length > 0) {
        console.log(`Se recargaron ${storagePhotos.length} fotos del storage:`, storagePhotos);
        
        // Usar una nueva referencia de array para forzar la actualización del estado
        const updatedPhotos = [...storagePhotos];
        onPhotosChange?.(updatedPhotos);
        
        // Asegurarse de que la foto seleccionada siga siendo válida
        if (selectedPhoto >= updatedPhotos.length) {
          setSelectedPhoto(Math.max(0, updatedPhotos.length - 1));
        }
        
        return updatedPhotos;
      } else {
        console.log('No se encontraron fotos en el storage');
        onPhotosChange?.([]);
        return [];
      }
    } catch (error) {
      console.error('Error al recargar fotos desde el storage:', error);
      return [];
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    setUploading(true);
    showNotification(t('photoManager.uploadingPhotos'), 'info');
    
    try {
      const tempPhotos = [];
      
      // Primero leemos los archivos como base64 para mostrarlos en la UI
      for (const file of files) {
        const base64 = await readFileAsBase64(file);
        tempPhotos.push(base64);
      }
      
      // Actualizamos la UI con las fotos temporales
      const updatedPhotos = [...photos, ...tempPhotos];
      onPhotosChange?.(updatedPhotos);
      
      // Si tenemos el ID y nombre del gato, subimos las fotos al storage
      if (catId && catName) {
        const uploadResult = await catService.uploadCatPhotos(catId, tempPhotos, catName);
        
        if (uploadResult.success) {
          // Si la subida fue exitosa, recargamos todas las fotos del storage
          // para asegurarnos de tener la lista actualizada y sin caché
          console.log('Subida exitosa, recargando todas las fotos desde el storage...');
          const freshPhotos = await reloadPhotosFromStorage();
          
          console.log('Fotos recargadas desde storage:', freshPhotos);
          
          // Verificar que realmente tenemos las fotos actualizadas
          if (freshPhotos && freshPhotos.length > 0) {
            console.log(`Se cargaron ${freshPhotos.length} fotos frescas del storage`);
            showNotification(t('photoManager.uploadSuccess'), 'success');
          } else {
            console.warn('No se obtuvieron fotos frescas, intentando recargar nuevamente...');
            // Intentar una segunda recarga con un pequeño retraso
            setTimeout(async () => {
              const retryPhotos = await reloadPhotosFromStorage();
              if (retryPhotos && retryPhotos.length > 0) {
                console.log(`Segundo intento: se cargaron ${retryPhotos.length} fotos`);
              }
            }, 1000);
            showNotification(t('photoManager.uploadSuccess'), 'success');
          }
        } else {
          showNotification(t('photoManager.uploadPartialError'), 'warning');
        }
      } else {
        // Si no tenemos ID o nombre (gato nuevo), mantenemos las fotos base64 temporalmente
        showNotification(t('photoManager.photoAddedTemporarily'), 'info');
      }
    } catch (error) {
      console.error('Error al subir fotos:', error);
      showNotification(t('photoManager.uploadError'), 'error');
    } finally {
      setUploading(false);
    }
  };
  
  // Función auxiliar para leer un archivo como base64
  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleUrlAdd = async () => {
    const url = prompt(t('photoManager.enterImageUrl'));
    if (!url || !url.trim()) return;
    
    setUploading(true);
    showNotification(t('photoManager.processingUrl'), 'info');
    
    try {
      // Actualizamos la UI primero con la URL proporcionada
      const updatedPhotos = [...photos, url.trim()];
      onPhotosChange?.(updatedPhotos);
      
      // Si tenemos el ID y nombre del gato, intentamos subir la foto al storage
      if (catId && catName) {
        const uploadResult = await catService.uploadCatPhotos(catId, [url.trim()], catName);
        
        if (uploadResult.success) {
          // Si la subida fue exitosa, recargamos todas las fotos del storage
          console.log('URL subida exitosamente, recargando todas las fotos desde el storage...');
          const freshPhotos = await reloadPhotosFromStorage();
          
          console.log('Fotos recargadas desde storage después de subir URL:', freshPhotos);
          
          // Verificar que realmente tenemos las fotos actualizadas
          if (freshPhotos && freshPhotos.length > 0) {
            console.log(`Se cargaron ${freshPhotos.length} fotos frescas del storage después de subir URL`);
            showNotification(t('photoManager.urlUploadSuccess'), 'success');
          } else {
            console.warn('No se obtuvieron fotos frescas después de subir URL, intentando recargar nuevamente...');
            // Intentar una segunda recarga con un pequeño retraso
            setTimeout(async () => {
              const retryPhotos = await reloadPhotosFromStorage();
              if (retryPhotos && retryPhotos.length > 0) {
                console.log(`Segundo intento después de subir URL: se cargaron ${retryPhotos.length} fotos`);
              }
            }, 1000);
            showNotification(t('photoManager.urlUploadSuccess'), 'success');
          }
        } else {
          showNotification(t('photoManager.urlUploadError'), 'warning');
        }
      } else {
        // Si no tenemos ID o nombre, mantenemos la URL original
        showNotification(t('photoManager.photoAddedTemporarily'), 'info');
      }
    } catch (error) {
      console.error('Error al procesar URL:', error);
      showNotification(t('photoManager.urlProcessError'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (index) => {
    if (window.confirm(t('photoManager.confirmDeletePhoto'))) {
      // Obtener la URL de la foto que queremos eliminar
      const photoUrl = photos[index];
      
      try {
        // Si es una foto de Supabase Storage (tiene una URL de Supabase)
        if (photoUrl.includes('supabase.co')) {
          // Usamos el nombre del gato proporcionado como prop o un fallback
          const actualCatName = catName || (catId ? `gato-${catId}` : 'unknown');
          
          console.log(`Eliminando foto ${photoUrl} del gato ${actualCatName}`);
          
          // Eliminar la foto del storage de Supabase
          const deleted = await catService.deletePhotoFromBucket(photoUrl, actualCatName);
          
          if (deleted) {
            console.log(`Foto eliminada con éxito del storage`);
            
            // Recargar las fotos para tener la lista actualizada
            if (catId && catName) {
              console.log('Recargando fotos después de eliminar...');
              const freshPhotos = await reloadPhotosFromStorage();
              
              console.log('Fotos recargadas después de eliminar:', freshPhotos);
              
              // Si no se obtuvieron fotos, intentar una segunda recarga con retraso
              if (!freshPhotos || freshPhotos.length === 0) {
                console.warn('No se obtuvieron fotos después de eliminar, intentando recargar nuevamente...');
                setTimeout(async () => {
                  await reloadPhotosFromStorage();
                }, 1000);
              }
            } else {
              // Si no tenemos ID o nombre, simplemente actualizamos la UI
              const updatedPhotos = photos.filter((_, i) => i !== index);
              onPhotosChange?.(updatedPhotos);
              
              // Ajustar la foto seleccionada si es necesario
              if (selectedPhoto >= updatedPhotos.length) {
                setSelectedPhoto(Math.max(0, updatedPhotos.length - 1));
              }
            }
            
            showNotification(t('photoManager.photoDeleted'), 'success');
          } else {
            console.warn(`No se pudo eliminar la foto del storage, pero se eliminará de la UI`);
            
            // Actualizar solo la UI
            const updatedPhotos = photos.filter((_, i) => i !== index);
            onPhotosChange?.(updatedPhotos);
            
            // Ajustar la foto seleccionada si es necesario
            if (selectedPhoto >= updatedPhotos.length) {
              setSelectedPhoto(Math.max(0, updatedPhotos.length - 1));
            }
            
            showNotification(t('photoManager.photoDeletedUIOnly'), 'warning');
          }
        } else {
          // Para fotos que no son de Supabase, simplemente actualizamos la UI
          const updatedPhotos = photos.filter((_, i) => i !== index);
          onPhotosChange?.(updatedPhotos);
          
          // Ajustar la foto seleccionada si es necesario
          if (selectedPhoto >= updatedPhotos.length) {
            setSelectedPhoto(Math.max(0, updatedPhotos.length - 1));
          }
          
          showNotification(t('photoManager.photoDeleted'), 'success');
        }
      } catch (error) {
        console.error('Error al eliminar la foto del storage:', error);
        showNotification(t('photoManager.errorDeletingPhoto'), 'error');
        
        // Aún así actualizamos la UI
        const updatedPhotos = photos.filter((_, i) => i !== index);
        onPhotosChange?.(updatedPhotos);
        
        // Ajustar la foto seleccionada si es necesario
        if (selectedPhoto >= updatedPhotos.length) {
          setSelectedPhoto(Math.max(0, updatedPhotos.length - 1));
        }
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

  useEffect(() => {
    // Ocultar la notificación al cambiar las fotos
    if (photos.length > 0) {
      setNotification({ show: false, message: '', type: '' });
    }
  }, [photos]);

  // Efecto para recargar las fotos cuando el componente se monta o cambia el catId/catName
  useEffect(() => {
    if (catId && catName) {
      console.log(`Cargando fotos al montar o cambiar gato: ${catName} (ID: ${catId})`);
      
      // Reiniciar la foto seleccionada al cambiar de gato
      setSelectedPhoto(0);
      
      // Pequeño retraso para asegurarse de que la recarga ocurra después de cualquier otra operación
      const timeoutId = setTimeout(() => {
        reloadPhotosFromStorage().then(freshPhotos => {
          console.log(`Fotos recargadas en useEffect: ${freshPhotos?.length || 0} fotos`);
          
          // Si no hay fotos, intentar otra vez después de un retraso más largo
          if (!freshPhotos || freshPhotos.length === 0) {
            console.warn('No se obtuvieron fotos en la primera carga, intentando recargar nuevamente...');
            setTimeout(() => {
              reloadPhotosFromStorage();
            }, 1500);
          }
        });
      }, 500);
      
      // Limpiar el timeout si el componente se desmonta
      return () => clearTimeout(timeoutId);
    }
  }, [catId, catName]);

  if (photos.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-lg">{t('photoManager.noPhotos')}</p>
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
                {t('photoManager.uploadPhotos')}
              </label>
            </div>
            
            <button
              type="button"
              onClick={handleUrlAdd}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              {t('photoManager.addByUrl')}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notificación */}
      {notification.show && (
        <div className={`px-4 py-3 rounded-md mb-4 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 text-red-800' :
          notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Indicador de carga */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg font-medium text-gray-800">{t('photoManager.uploadingPhotos')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Foto principal */}
      <div className="relative">
        <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={photos[selectedPhoto]}
            alt={`Foto ${selectedPhoto + 1}`}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZMMTAuNTg2IDkuNDE0QzExLjM2NyA4LjYzMyAxMi42MzMgOC42MzMgMTMuNDE0IDkuNDE0TDE2IDEyTTEyIDhIMTJNNiAyMEgxOEMyMC4yMDkxIDIwIDIyIDE4LjIwOTEgMjIgMTZWOEMyMiA1Ljc5MDg2IDIwLjIwOTEgNCA1IDRINkM0Ljc5MDg2IDQgNCA0Ljc5MDg2IDQgNlYxNkM0IDE4LjIwOTEgNS43OTA4NiAyMCA4IDIwWiIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
            }}
          />
        </div>
        
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setSelectedPhoto(prev => prev > 0 ? prev - 1 : photos.length - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setSelectedPhoto(prev => prev < photos.length - 1 ? prev + 1 : 0)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {!readOnly && (
          <button
            onClick={() => removePhoto(selectedPhoto)}
            className="absolute top-3 right-3 bg-red-600 bg-opacity-80 text-white p-2 rounded-full hover:bg-opacity-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
          {selectedPhoto + 1} / {photos.length}
        </div>
      </div>

      {/* Miniaturas */}
      {photos.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-3 justify-center">
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
                className={`w-24 h-24 rounded border-2 overflow-hidden transition ${
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
              disabled={uploading}
            />
            <label
              htmlFor={`file-upload-${catId}`}
              className={`w-full flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                uploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
              } transition`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('photoManager.uploadingPhotos')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('photoManager.addMorePhotos')}
                </>
              )}
            </label>
          </div>
          
          <button
            type="button"
            onClick={handleUrlAdd}
            className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
              uploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
            } transition`}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 inline-block h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('photoManager.processingUrl')}
              </>
            ) : (
              t('photoManager.addByUrl')
            )}
          </button>
        </div>
      )}

      {/* Notificación */}
      {notification.show && (
        <div className={`fixed bottom-5 right-5 mb-4 mr-4 p-3 rounded-lg shadow-lg text-sm ${notification.type === 'success' ? 'bg-green-100 text-green-800' : notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default PhotoManager;