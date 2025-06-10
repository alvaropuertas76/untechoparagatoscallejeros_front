// Script para probar el login directamente con Supabase
import supabase from '../services/supabaseClient.js';

// Función para probar el login
async function testLogin() {
  try {
    const username = 'elena';
    const password = 'lopez';
    
    console.log(`Intentando login con usuario: ${username}`);
    console.log('URL de Supabase:', supabase.getUrl());
    
    // Verificar si la tabla existe y mostrar sus campos
    console.log('\nVerificando estructura de la tabla "user"...');
    const checkTableQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user' AND table_schema = 'public';
    `;
    
    const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', { 
      query: checkTableQuery 
    });
    
    if (tableError) {
      console.error('Error al verificar estructura de tabla:', tableError);
    } else {
      console.log('Estructura de la tabla "user":');
      console.table(tableInfo);
    }
    
    // Verificar contenido de la tabla con SQL directo
    console.log('\nVerificando contenido de la tabla con SQL directo...');
    const contentQuery = `
      SELECT id, username, password, nombre, rol
      FROM "user";
    `;
    
    const { data: contentInfo, error: contentError } = await supabase.rpc('exec_sql', { 
      query: contentQuery 
    });
    
    if (contentError) {
      console.error('Error al verificar contenido de tabla:', contentError);
    } else {
      console.log('Contenido de la tabla "user":');
      console.table(contentInfo);
    }
    
    // Buscar usuario específico con SQL directo
    console.log(`\nBuscando usuario '${username}' con SQL directo...`);
    const userQuery = `
      SELECT id, username, password, nombre, rol
      FROM "user"
      WHERE username = '${username}';
    `;
    
    const { data: userInfo, error: userError } = await supabase.rpc('exec_sql', { 
      query: userQuery 
    });
    
    if (userError) {
      console.error('Error al buscar usuario con SQL directo:', userError);
    } else if (userInfo && userInfo.length > 0) {
      console.log('Usuario encontrado con SQL directo:');
      console.table(userInfo);
    } else {
      console.log('No se encontró el usuario con SQL directo.');
    }
    
    // Buscar el usuario por nombre de usuario
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error en la consulta a Supabase:', error);
      return;
    }
    
    console.log('Respuesta de Supabase:', data ? 'Usuario encontrado' : 'Usuario no encontrado');
    
    if (!data) {
      console.log('Usuario no encontrado');
      return;
    }
    
    console.log('Datos del usuario:', {
      id: data.id,
      username: data.username,
      nombre: data.nombre,
      apellidos: data.apellidos,
      rol: data.rol,
      email: data.email
    });
    
    // Comparar contraseñas (solo para pruebas)
    if (data.password !== password) {
      console.log('Contraseña incorrecta');
      return;
    }
    
    console.log('¡Login exitoso!');
    
  } catch (error) {
    console.error('Error en la prueba de login:', error);
  }
}

// Ejecutar la prueba
testLogin();
