/**
 * Utilidades de validación para la API
 */

/**
 * Valida los datos de un gato
 * @param {Object} catData - Datos del gato a validar
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateCat = (catData) => {
  const errors = [];
  
  // Validar campos obligatorios
  if (!catData.nombre || catData.nombre.trim() === '') {
    errors.push('El nombre es obligatorio');
  }
  
  if (!catData.fecha_nacimiento) {
    errors.push('La fecha de nacimiento es obligatoria');
  }
  
  if (!catData.lugar_recogida || catData.lugar_recogida.trim() === '') {
    errors.push('El lugar de recogida es obligatorio');
  }
  
  if (catData.sexo === undefined || catData.sexo === null) {
    errors.push('El sexo es obligatorio');
  }
  
  if (!catData.ano_llegada) {
    errors.push('El año de llegada es obligatorio');
  }
  
  // Validar datos de tipo booleano
  const booleanFields = [
    'testado', 'castrado', 'gato_aire_libre', 'gato_interior',
    'familia', 'compatible_ninos', 'casa_tranquila',
    'apadrinado', 'adoptado', 'desaparecido'
  ];
  
  for (const field of booleanFields) {
    if (catData[field] !== undefined && typeof catData[field] !== 'boolean') {
      errors.push(`El campo ${field} debe ser un valor booleano`);
    }
  }
  
  // Validar fechas
  try {
    if (catData.fecha_nacimiento) {
      new Date(catData.fecha_nacimiento);
    }
    if (catData.fecha_fallecido) {
      new Date(catData.fecha_fallecido);
    }
    if (catData.ano_llegada) {
      new Date(catData.ano_llegada);
    }
  } catch (e) {
    errors.push('Formato de fecha inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida los datos de inicio de sesión
 * @param {Object} loginData - Datos de inicio de sesión
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateLogin = (loginData) => {
  const errors = [];
  
  if (!loginData.username || loginData.username.trim() === '') {
    errors.push('El nombre de usuario es obligatorio');
  }
  
  if (!loginData.password || loginData.password.trim() === '') {
    errors.push('La contraseña es obligatoria');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateCat,
  validateLogin
};
