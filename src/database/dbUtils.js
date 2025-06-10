/**
 * Utilidades para el manejo de transacciones y errores en la base de datos
 */
const { pool } = require('./db');

/**
 * Ejecuta una función dentro de una transacción de base de datos
 * 
 * @param {Function} callback - Función que recibe un cliente de transacción y realiza operaciones
 * @returns {Promise<any>} - El resultado de la función callback
 * @throws {Error} - Si ocurre un error, la transacción se revierte
 */
const withTransaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Maneja errores HTTP y los registra
 * 
 * @param {Error} error - El error que ocurrió
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} operacion - Descripción de la operación que falló
 * @param {number} [status=500] - Código de estado HTTP a devolver
 */
const handleError = (error, res, operacion, status = 500) => {
  console.error(`Error en ${operacion}:`, error);
  
  // Determinar el tipo de error para dar respuestas más específicas
  if (error.code === '23505') { // Error de violación de unicidad
    return res.status(400).json({ 
      error: 'Violación de restricción de unicidad',
      detalle: error.detail
    });
  } else if (error.code === '23503') { // Error de violación de clave foránea
    return res.status(400).json({ 
      error: 'Violación de restricción de clave foránea',
      detalle: error.detail
    });
  } else if (error.code === '23502') { // Error de no nulidad
    return res.status(400).json({ 
      error: 'Valor nulo en campo obligatorio',
      detalle: error.detail
    });
  } else if (error.code === '22P02') { // Error de sintaxis
    return res.status(400).json({ 
      error: 'Error de sintaxis en los datos',
      detalle: error.message
    });
  }
  
  // Error genérico
  res.status(status).json({ 
    error: 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

module.exports = {
  withTransaction,
  handleError
};
