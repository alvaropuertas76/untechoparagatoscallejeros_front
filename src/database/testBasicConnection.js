// Script para probar solamente la conexión básica a Supabase
import supabase from '../services/supabaseClient.js';

async function testBasicConnection() {
  console.log('=== PRUEBA BÁSICA DE CONEXIÓN A SUPABASE ===');
  console.log('URL de Supabase:', supabase.getUrl());
  
  try {
    // Verificar que podemos conectarnos a Supabase
    console.log('\nIntentando conectarse a Supabase...');
    
    // Usar la API de autenticación para una operación simple
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error al conectar con Supabase:', error);
      return;
    }
    
    console.log('✅ Conexión básica establecida correctamente');
    console.log('Información de sesión:', data);
    
    // Intentar una operación simple de lectura
    console.log('\nVerificando tablas existentes (si hay permisos)...');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(5);
    
    if (tablesError) {
      console.error('❌ Error al consultar tablas:', tablesError);
    } else {
      console.log('✅ Consulta de tablas exitosa');
      console.log('Tablas en el esquema public:', tables);
    }
    
    // Imprimir información de configuración completa
    console.log('\n=== INFORMACIÓN DE CONFIGURACIÓN ===');
    console.log('URL de Supabase:', supabase.getUrl());
    console.log('API Key (primeros 10 caracteres):', 
      process.env.VITE_SUPABASE_KEY ? process.env.VITE_SUPABASE_KEY.substring(0, 10) + '...' : 'No disponible');
    
  } catch (error) {
    console.error('Error general en la prueba de conexión:', error);
  }
}

// Ejecutar la prueba
testBasicConnection();
