// Script para verificar que la función exec_sql se ha creado correctamente
import supabase from '../services/supabaseClient.js';

async function verifyExecSQLFunction() {
  console.log('Verificando que la función exec_sql existe en Supabase...');
  
  try {
    // Consulta para verificar si la función exec_sql existe
    const query = `
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_schema = 'public' AND routine_name = 'exec_sql';
    `;
    
    // Intentar ejecutar la consulta directamente usando exec_sql
    // Si esto funciona, significa que la función existe
    const { data, error } = await supabase.rpc('exec_sql', { query });
    
    if (error) {
      console.error('Error al verificar la función exec_sql:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log('✅ La función exec_sql existe correctamente:', data);
      return true;
    } else {
      console.log('❌ La función exec_sql no existe o no se pudo verificar');
      return false;
    }
    
  } catch (error) {
    console.error('Error al verificar la función exec_sql:', error);
    return false;
  }
}

// Ejecutar la verificación
verifyExecSQLFunction()
  .then(exists => {
    if (exists) {
      console.log('\n👍 Todo está listo para usar las funciones RPC en Supabase');
    } else {
      console.log('\n⚠️ Necesitas crear la función exec_sql manualmente en Supabase');
    }
  });
