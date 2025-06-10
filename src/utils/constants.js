// Utility functions and constants for the cat management application

// Función para calcular la edad de un gato
export const calculateAge = (birthDate) => {
  if (!birthDate) return 'Desconocida';
  
  const birth = new Date(birthDate);
  const today = new Date();
  const diffTime = Math.abs(today - birth);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} días`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    } else {
      return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
    }
  }
};

// Función para formatear fechas
export const formatDate = (dateString) => {
  if (!dateString) return 'No especificada';
  
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('es-ES', options);
};

// Función para formatear fechas de forma corta
export const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

// Función para obtener la fecha actual en formato YYYY-MM-DD
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Función para validar si una fecha es válida
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Función para calcular días desde una fecha
export const daysSince = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today - date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Constantes para opciones de formularios
export const CAT_FORM_OPTIONS = {
  sexo: [
    { value: true, label: 'Macho' },
    { value: false, label: 'Hembra' }
  ],
  booleanos: [
    { value: true, label: 'Sí' },
    { value: false, label: 'No' }
  ]
};

// Constantes para filtros
export const FILTER_OPTIONS = {
  sexo: [
    { value: '', label: 'Todos' },
    { value: true, label: 'Macho' },
    { value: false, label: 'Hembra' }
  ],
  adoptado: [
    { value: '', label: 'Todos' },
    { value: true, label: 'Adoptado' },
    { value: false, label: 'Disponible' }
  ],
  testado: [
    { value: '', label: 'Todos' },
    { value: true, label: 'Sí' },
    { value: false, label: 'No' }
  ],
  castrado: [
    { value: '', label: 'Todos' },
    { value: true, label: 'Sí' },
    { value: false, label: 'No' }
  ],
  apadrinado: [
    { value: '', label: 'Todos' },
    { value: true, label: 'Sí' },
    { value: false, label: 'No' }
  ]
};

// Función para obtener el color del badge según el estado
export const getBadgeColor = (type, value) => {
  const colors = {
    adoptado: value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
    apadrinado: value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800',
    testado: value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
    castrado: value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
    sexo: value ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800',
    desaparecido: value ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800',
    fallecido: 'bg-gray-500 text-white'
  };
  
  return colors[type] || 'bg-gray-100 text-gray-800';
};

// Función para obtener el texto del badge
export const getBadgeText = (type, value) => {
  const texts = {
    sexo: value ? 'Macho' : 'Hembra',
    adoptado: value ? 'Adoptado' : 'Disponible',
    apadrinado: value ? 'Apadrinado' : 'Sin apadrinar',
    testado: value ? 'Testado' : 'Sin testar',
    castrado: value ? 'Castrado' : 'Sin castrar',
    desaparecido: value ? 'Desaparecido' : 'En refugio'
  };
  
  return texts[type] || (value ? 'Sí' : 'No');
};

// Función para truncar texto
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Función para capitalizar primera letra
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Función para validar URLs de imágenes
export const isValidImageUrl = (url) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  
  if (!urlPattern.test(url)) return false;
  
  const extension = url.split('.').pop().toLowerCase();
  return imageExtensions.includes(extension) || url.includes('unsplash.com') || url.includes('images.');
};

// Constantes de mensajes de error
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es obligatorio',
  INVALID_DATE: 'Fecha inválida',
  INVALID_URL: 'URL de imagen inválida',
  CAT_NOT_FOUND: 'Gato no encontrado',
  NETWORK_ERROR: 'Error de conexión',
  GENERIC_ERROR: 'Ha ocurrido un error inesperado'
};

// Constantes de mensajes de éxito
export const SUCCESS_MESSAGES = {
  CAT_CREATED: 'Gato creado exitosamente',
  CAT_UPDATED: 'Gato actualizado exitosamente',
  CAT_DELETED: 'Gato marcado como fallecido',
  PHOTO_UPLOADED: 'Foto subida exitosamente',
  PHOTO_DELETED: 'Foto eliminada exitosamente'
};

// Export default de funciones más utilizadas
export default {
  calculateAge,
  formatDate,
  formatDateShort,
  getCurrentDate,
  isValidDate,
  daysSince,
  getBadgeColor,
  getBadgeText,
  truncateText,
  capitalize,
  isValidImageUrl
};