import React, { useState, useEffect } from 'react';
import { calculateAge } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';
import catService from '../services/catService';

const CatCard = ({ cat, onViewDetail }) => {
  const age = calculateAge(cat.fechaNacimiento);
  const [mainPhoto, setMainPhoto] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useLanguage();
  
  // Cargar foto del gato desde el bucket cuando se renderiza el componente
  useEffect(() => {
    // Solo intentar cargar foto si tenemos un nombre de gato
    if (cat && cat.nombre) {
      const loadCatPhoto = async () => {
        try {
          // Intentamos obtener la foto principal del bucket
          const photoUrl = await catService.getMainPhotoFromBucket(cat.nombre);
          
          // Verificar si la URL contiene ".emptyFolderPlaceholder" (esto no es una imagen real)
          if (photoUrl && !photoUrl.includes('.emptyFolderPlaceholder')) {
            console.log(`Intentando cargar imagen para ${cat.nombre}: ${photoUrl}`);
            setMainPhoto(photoUrl);
          } else if (cat.fotos && cat.fotos.length > 0) {
            // Si no hay foto en el bucket o es un placeholder, usar la primera foto del array
            const validPhotos = cat.fotos.filter(url => !url.includes('.emptyFolderPlaceholder'));
            if (validPhotos.length > 0) {
              setMainPhoto(validPhotos[0]);
            } else {
              setImageError(true);
            }
          } else {
            setImageError(true);
          }
        } catch (error) {
          console.error(`Error al cargar imagen para el gato ${cat.nombre}:`, error);
          setImageError(true);
        }
      };
      
      loadCatPhoto();
    }
  }, [cat.nombre, cat.fotos]);

  const handleImageLoad = () => {
    console.log(`Imagen cargada correctamente para ${cat.nombre}`);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error(`Error al cargar imagen para el gato ${cat.nombre}: ${mainPhoto}`);
    setImageError(true);
    setMainPhoto(null);
  };

  const getStatusBadges = () => {
    const badges = [];
    
    if (cat.adoptado) badges.push({ text: t('catDetail.adopted'), color: 'bg-green-100 text-green-800' });
    if (cat.apadrinado) badges.push({ text: t('catDetail.sponsored'), color: 'bg-blue-100 text-blue-800' });
    if (cat.desaparecido) badges.push({ text: t('catDetail.deceased'), color: 'bg-red-100 text-red-800' });
    if (!cat.testado) badges.push({ text: t('searchFilters.tested') + ': ' + t('searchFilters.no'), color: 'bg-yellow-100 text-yellow-800' });
    if (!cat.castrado) badges.push({ text: t('searchFilters.neutered') + ': ' + t('searchFilters.no'), color: 'bg-orange-100 text-orange-800' });
    
    return badges;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Foto */}
      <div className="h-48 bg-gray-200 relative">
        {mainPhoto && !imageError ? (
          <img
            src={mainPhoto}
            alt={cat.nombre}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Badge de sexo */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            cat.sexo ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
          }`}>
            {cat.sexo ? t('catForm.male') : t('catForm.female')}
          </span>
   
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {cat.nombre}
          </h3>
          <span className="text-sm text-gray-500">
            {age}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          {cat.lugarRecogida}
        </p>

        {/* Características principales */}
        <div className="space-y-1 mb-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">{t('searchFilters.tested')}:</span>
            <span className={cat.testado ? 'text-green-600' : 'text-red-600'}>
              {cat.testado ? t('searchFilters.yes') : t('searchFilters.no')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t('searchFilters.neutered')}:</span>
            <span className={cat.castrado ? 'text-green-600' : 'text-red-600'}>
              {cat.castrado ? t('searchFilters.yes') : t('searchFilters.no')}
            </span>
          </div>
        </div>

        {/* Badges de estado */}
        <div className="flex flex-wrap gap-1 mb-3">
          {getStatusBadges().slice(0, 2).map((badge, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
            >
              {badge.text}
            </span>
          ))}
        </div>

        {/* Carácter */}
        {cat.caracter && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {cat.caracter}
          </p>
        )}

        {/* Botón ver detalles */}
        <button
          onClick={onViewDetail}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 text-sm font-medium"
        >
          {t('catList.viewDetails')}
        </button>
      </div>
    </div>
  );
};

export default CatCard;