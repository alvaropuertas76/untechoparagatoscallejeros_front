// Script para crear las tablas en Supabase
import fs from 'fs';
import path from 'path';
import supabase from '../services/supabaseClient.js';

// Leer el archivo de esquema SQL
const schemaPath = path.join(process.cwd(), 'src', 'database', 'supabase_schema.sql');
console.log('Leyendo archivo de esquema SQL:', schemaPath);
const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

// Dividir en consultas individuales
const queries = schemaSQL
  .replace(/\/\/.*$/gm, '') // Eliminar comentarios de una línea
  .replace(/--.*$/gm, '')   // Eliminar comentarios SQL
  .split(';')
  .map(query => query.trim())
  .filter(query => query.length > 0);

// Función para ejecutar cada consulta
async function executeQueries() {
  console.log(`Intentando ejecutar ${queries.length} consultas SQL en Supabase...`);
  console.log('URL de Supabase:', supabase.getUrl());
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`\nEjecutando consulta ${i + 1}/${queries.length}:`);
    console.log(query);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { query });
      
      if (error) {
        console.error('Error al ejecutar consulta:', error);
      } else {
        console.log('Consulta ejecutada correctamente');
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      // Continuar con la siguiente consulta
    }
  }
  
  console.log('\nFinalizó la ejecución de las consultas SQL');
}

// Ejecutar las consultas
executeQueries()
  .catch(error => console.error('Error en el proceso:', error));