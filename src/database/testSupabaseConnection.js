// Script para verificar la conexión con Supabase y la tabla de usuarios
import supabase from '../services/supabaseClient.js';

// Función para verificar la conexión
async function testConnection() {
  try {
    console.log('Verificando conexión a Supabase...');
    console.log('URL de Supabase:', supabase.getUrl());
      // Intentar hacer una consulta simple
    const { data, error } = await supabase
      .from('user')
      .select('count(*)', { count: 'exact' });
    
    if (error) {
      console.error('Error al conectar con Supabase:', error);
      return;
    }
    
    console.log('Conexión exitosa a Supabase!');
    console.log('Número de usuarios en la tabla:', data.length > 0 ? data[0].count : 0);
      // Obtener la lista de usuarios para verificar
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('id, username, nombre, apellidos, rol')
      .order('id');
    
    if (usersError) {
      console.error('Error al obtener usuarios:', usersError);
      return;
    }
    
    console.log('Lista de usuarios en Supabase:');
    console.table(users);
      // Intentar obtener un usuario específico para prueba de login
    const testUsername = 'elena';
    const { data: testUser, error: testError } = await supabase
      .from('user')
      .select('*')
      .eq('username', testUsername)
      .single();
    
    if (testError) {
      console.error(`Error al buscar usuario de prueba '${testUsername}':`, testError);
      return;
    }
    
    if (testUser) {
      console.log(`Usuario de prueba '${testUsername}' encontrado:`, {
        id: testUser.id,
        username: testUser.username,
        nombre: testUser.nombre,
        rol: testUser.rol
      });
    } else {
      console.log(`Usuario de prueba '${testUsername}' NO encontrado`);
    }
    
    // Listar las tablas disponibles en la base de datos
    console.log('\nListando tablas en la base de datos:');
    const { data: tableList, error: tableError } = await supabase
      .rpc('get_tables');
    
    if (tableError) {
      console.error('Error al listar tablas:', tableError);
    } else if (tableList) {
      console.log('Tablas disponibles:');
      console.table(tableList);
    }
    
  } catch (error) {
    console.error('Error inesperado:', error);
  }
}

// Ejecutar la función de prueba
testConnection();
