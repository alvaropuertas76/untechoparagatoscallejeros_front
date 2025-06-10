// Script para habilitar las políticas RLS en Supabase
import supabase from '../services/supabaseClient.js';
import fs from 'fs';
import path from 'path';

// Leer el archivo SQL con las funciones RPC
const sqlFilePath = path.join(process.cwd(), 'src', 'database', 'supabase_rpc_functions.sql');
console.log('Leyendo archivo SQL de funciones RPC:', sqlFilePath);
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Dividir el contenido en consultas individuales
const queries = sqlContent
  .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar comentarios multi-línea
  .replace(/--.*$/gm, '') // Eliminar comentarios de una línea
  .split(';')
  .map(query => query.trim())
  .filter(query => query.length > 0);

// Función para ejecutar las consultas SQL
async function executeSQLQueries() {
  console.log(`Intentando ejecutar ${queries.length} consultas SQL en Supabase...`);
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`\nEjecutando consulta ${i + 1}/${queries.length}:`);
    console.log(query);
    
    try {
      // Ejecutar la consulta SQL
      const { data, error } = await supabase.rpc('exec_sql', { query });
      
      if (error) {
        console.error('Error al ejecutar consulta:', error);
      } else {
        console.log('Consulta ejecutada correctamente');
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
    }
  }
  
  // Ejecutar la función para configurar las políticas
  try {
    console.log('\nConfigurando políticas RLS para la tabla de usuarios...');
    const { data, error } = await supabase.rpc('setup_user_policies');
    
    if (error) {
      console.error('Error al configurar políticas RLS:', error);
    } else {
      console.log('Políticas RLS configuradas correctamente');
    }
  } catch (error) {
    console.error('Error al configurar políticas RLS:', error);
  }
  
  console.log('\nProceso de configuración RLS completado');
}

// Ejecutar el script
executeSQLQueries()
  .catch(error => console.error('Error en el proceso:', error));
