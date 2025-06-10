// Script para crear únicamente la función exec_sql en Supabase
import supabase from '../services/supabaseClient.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createExecSQLFunction() {
  console.log('Verificando la existencia de la función exec_sql en Supabase...');
  
  try {
    // Leer el archivo específico para exec_sql
    const sqlFilePath = path.join(__dirname, 'exec_sql_function.sql');
    let sqlContent;
    
    try {
      sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    } catch (fileError) {
      // Si el archivo específico no existe, buscamos en el archivo general
      console.log('Archivo exec_sql_function.sql no encontrado, buscando en supabase_rpc_functions.sql...');
      const rpcFilePath = path.join(__dirname, 'supabase_rpc_functions.sql');
      sqlContent = fs.readFileSync(rpcFilePath, 'utf8');
      
      // Extraer solo la función exec_sql
      const execSqlRegex = /(CREATE\s+OR\s+REPLACE\s+FUNCTION\s+exec_sql[\s\S]+?;\s*)/i;
      const execSqlMatch = sqlContent.match(execSqlRegex);
      
      if (!execSqlMatch) {
        throw new Error('No se encontró la definición de exec_sql en los archivos SQL');
      }
      
      sqlContent = execSqlMatch[1];
    }
    
    console.log('Verificando si la función exec_sql ya existe...');
    
    // Intentamos usar la función para verificar si existe
    const checkQuery = `
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_name = 'exec_sql'
    `;
    
    try {
      // Intentamos llamar a exec_sql para ver si existe
      const { data, error } = await supabase.rpc('exec_sql', { 
        query: checkQuery 
      });
      
      if (error) {
        throw new Error(`La función exec_sql no existe o no funciona: ${error.message}`);
      }
      
      console.log('La función exec_sql ya existe en Supabase:', data);
      return true;
    } catch (checkError) {
      console.log('La función exec_sql no existe. Intentando crearla...');
      
      // Intentar crearla directamente mediante REST API
      try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || supabase.supabaseUrl;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || supabase.supabaseKey;
        
        console.log('Creando función exec_sql mediante SQL directo...');
        console.log('SQL a ejecutar:', sqlContent);
        
        // Si no podemos usar exec_sql (porque no existe), intentamos crear la función directamente
        // ejecutando SQL en el backend de Supabase
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'params=single-object'
          },
          body: JSON.stringify({
            query: sqlContent
          })
        });
        
        // Esto probablemente fallará porque la API REST no permite ejecutar SQL arbitrario
        // pero lo intentamos de todas formas
        if (!response.ok) {
          console.log('Error al crear exec_sql mediante REST API directa:', await response.text());
          throw new Error('No se pudo crear la función exec_sql mediante API REST');
        }
        
        console.log('Función exec_sql creada correctamente mediante REST API');
        return true;
      } catch (directError) {
        console.error('Error al intentar crear exec_sql mediante REST API:', directError);
        
        // Mostrar instrucciones para creación manual
        console.log(`
          ⚠️ IMPORTANTE: La función exec_sql debe ser creada manualmente.
          
          Por favor, sigue estos pasos:
          
          1. Inicia sesión en el panel de Supabase (https://app.supabase.com)
          2. Ve a tu proyecto > SQL Editor
          3. Copia y pega el siguiente código:
          
          ${sqlContent}
          
          4. Ejecuta el código
          5. Vuelve a ejecutar los scripts de creación de funciones
        `);
        
        return false;
      }
    }
  } catch (error) {
    console.error('Error al crear la función exec_sql:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
createExecSQLFunction();
