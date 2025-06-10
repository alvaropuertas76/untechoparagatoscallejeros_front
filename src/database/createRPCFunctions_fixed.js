// Script para ejecutar las funciones RPC en Supabase
import supabase from '../services/supabaseClient.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createRPCFunctions() {
  console.log('Creando funciones RPC en Supabase...');
  
  try {
    // Leer el archivo SQL con las funciones RPC
    const sqlFilePath = path.join(__dirname, 'supabase_rpc_functions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Dividir el contenido en declaraciones SQL individuales
    // Tomamos cada bloque CREATE OR REPLACE FUNCTION ... $$ como una función separada
    const functionRegex = /(CREATE\s+OR\s+REPLACE\s+FUNCTION[\s\S]+?;\s*)/gi;
    const functions = sqlContent.match(functionRegex);
    
    if (!functions || functions.length === 0) {
      throw new Error('No se encontraron declaraciones de funciones en el archivo SQL');
    }
    
    console.log(`Se encontraron ${functions.length} funciones para crear`);
    
    // Ejecutar cada función por separado
    for (let i = 0; i < functions.length; i++) {
      const functionSQL = functions[i].trim();
      const functionName = functionSQL.match(/FUNCTION\s+([a-z0-9_]+)/i);
      
      console.log(`\nCreando función ${i + 1}/${functions.length}: ${functionName ? functionName[1] : 'desconocida'}`);
      console.log('SQL a ejecutar:', functionSQL);
      
      try {
        // Ejecutar SQL directo mediante REST API
        const response = await supabase.rpc('exec_sql', { query: functionSQL });
        
        if (response.error) {
          // Si falla porque exec_sql no existe, intentamos crearlo primero
          if (response.error.message && response.error.message.includes('exec_sql')) {
            console.log('La función exec_sql no existe. Intentando crearla primero mediante REST API...');
            
            // Intentar crear la función exec_sql mediante una llamada REST directa
            try {
              // Utilizar una solicitud fetch directa a la API REST de Supabase
              const supabaseUrl = process.env.VITE_SUPABASE_URL || supabase.supabaseUrl;
              const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || supabase.supabaseKey;
              
              // Extraer la definición de exec_sql del archivo
              const execSqlDefinition = sqlContent.match(/(CREATE\s+OR\s+REPLACE\s+FUNCTION\s+exec_sql[\s\S]+?;\s*)/i);
              
              if (!execSqlDefinition) {
                throw new Error('No se encontró la definición de exec_sql en el archivo');
              }
              
              const fetchResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`
                },
                body: JSON.stringify({ query: execSqlDefinition[1] })
              });
              
              if (!fetchResponse.ok) {
                const errorData = await fetchResponse.json();
                throw new Error(`Error al crear exec_sql: ${JSON.stringify(errorData)}`);
              }
              
              console.log('Función exec_sql creada correctamente mediante REST API');
              
              // Intentar nuevamente la función original
              const retryResponse = await supabase.rpc('exec_sql', { query: functionSQL });
              if (retryResponse.error) {
                throw new Error(`Error al volver a intentar después de crear exec_sql: ${retryResponse.error.message}`);
              }
              console.log(`Función ${functionName ? functionName[1] : 'desconocida'} creada correctamente en el segundo intento`);
            } catch (directError) {
              console.error('Error al intentar crear exec_sql mediante REST API:', directError);
              
              // Mostrar instrucciones para creación manual
              console.log(`
                ⚠️ IMPORTANTE: La función exec_sql no pudo ser creada automáticamente.
                
                Por favor, sigue estos pasos manualmente:
                
                1. Inicia sesión en el panel de Supabase (https://app.supabase.com)
                2. Ve a tu proyecto > SQL Editor
                3. Copia y pega el siguiente código:
                
                ${functions.find(f => f.includes('FUNCTION exec_sql'))}
                
                4. Ejecuta el código
                5. Vuelve a ejecutar este script
              `);
              
              throw new Error('Es necesario crear la función exec_sql manualmente');
            }
          } else {
            console.error(`Error al crear la función ${functionName ? functionName[1] : 'desconocida'}:`, response.error);
          }
        } else {
          console.log(`Función ${functionName ? functionName[1] : 'desconocida'} creada correctamente`);
        }
      } catch (functionError) {
        console.error(`Error al procesar la función ${functionName ? functionName[1] : 'desconocida'}:`, functionError);
      }
    }
    
    console.log('\n✅ Proceso completado. Funciones RPC creadas en Supabase.');
    
  } catch (error) {
    console.error('Error al crear funciones RPC:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
createRPCFunctions();
