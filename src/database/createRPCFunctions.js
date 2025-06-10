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
    // Verificar primero si exec_sql existe
    console.log('Verificando si la función exec_sql existe...');
    const checkQuery = `
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_schema = 'public' AND routine_name = 'exec_sql';
    `;
    
    let { data: checkResult, error: checkError } = await supabase.rpc('exec_sql', { query: checkQuery });
    
    if (checkError) {
      console.error('Error al verificar exec_sql:', checkError.message);
      console.log('La función exec_sql no parece existir. Por favor, créala manualmente usando el script en GUIA_EXEC_SQL.md');
      return;
    }
    
    if (!checkResult || checkResult.length === 0) {
      console.log('La función exec_sql no existe. Por favor, créala manualmente usando el script en GUIA_EXEC_SQL.md');
      return;
    }
    
    console.log('La función exec_sql existe correctamente. Continuando con la creación de otras funciones...');
    
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
      
      // Omitir la función exec_sql ya que debería existir
      if (functionName && functionName[1] === 'exec_sql') {
        console.log(`\nOmitiendo función exec_sql ya que debería existir`);
        continue;
      }
      
      console.log(`\nCreando función ${i + 1}/${functions.length}: ${functionName ? functionName[1] : 'desconocida'}`);
      console.log('SQL a ejecutar:', functionSQL);
      
      // Ejecutar SQL directo mediante exec_sql
      const { data, error } = await supabase.rpc('exec_sql', { query: functionSQL });
      
      if (error) {
        console.error(`Error al crear la función ${functionName ? functionName[1] : 'desconocida'}:`, error);
      } else {
        console.log(`Función ${functionName ? functionName[1] : 'desconocida'} creada correctamente`);
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
