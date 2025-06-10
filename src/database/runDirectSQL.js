// Script para ejecutar una sentencia SQL directa en Supabase
import supabase from '../services/supabaseClient.js';

// Ejecutar una consulta SQL para crear la tabla de usuarios
async function runSQL() {
  console.log('Ejecutando SQL directo en Supabase...');
  
  try {    // Consulta para crear la tabla de usuarios
    const createUserTableSQL = `
    CREATE TABLE IF NOT EXISTS "user" (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      apellidos VARCHAR(100) NOT NULL,
      rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'voluntario', 'adopcion', 'veterinario')),
      email VARCHAR(100) UNIQUE NOT NULL
    );`;
    
    // Usar la API RESTful para crear la tabla
    const { data, error } = await supabase.rpc('exec_sql', { 
      query: createUserTableSQL 
    });
    
    if (error) {
      console.error('Error al ejecutar SQL:', error);
    } else {
      console.log('SQL ejecutado correctamente:', data);
      
      // Intentar listar las tablas
      console.log('\nVerificando si la tabla se creó:');
      const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
      
      if (tablesError) {
        console.error('Error al listar tablas:', tablesError);
      } else {
        console.log('Tablas existentes:');
        console.table(tables);
      }
    }
  } catch (error) {
    console.error('Error en la ejecución:', error);
  }
}

// Ejecutar la función
runSQL();
