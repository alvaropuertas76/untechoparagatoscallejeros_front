// Script para probar el login de un usuario específico con Supabase
import supabase from '../services/supabaseClient.js';

async function testSimpleLogin() {
  console.log('=== PRUEBA DE LOGIN SIMPLIFICADA ===');
  console.log('URL de Supabase:', supabase.getUrl());
  
  try {
    const username = 'elena';
    const password = 'lopez';
    
    // Paso 1: Verificar conexión básica
    console.log('\n1. Verificando conexión básica con Supabase...');
    const { data: pingData, error: pingError } = await supabase.auth.getSession();
    
    if (pingError) {
      console.error('❌ Error de conexión básica:', pingError);
      return;
    }
    
    console.log('✅ Conexión básica OK');
    
    // Paso 2: Verificar si la tabla user existe
    console.log('\n2. Verificando si existe la tabla "user"...');
    const { data: userCheck, error: userCheckError } = await supabase
      .from('user')
      .select('count(*)', { count: 'exact', head: true });
    
    if (userCheckError) {
      console.error('❌ Error al verificar tabla "user":', userCheckError.message);
      
      // Comprobar si el error es de permisos o que la tabla no existe
      if (userCheckError.code === '42P01') {
        console.log('⚠️ La tabla "user" no existe. Debes crearla primero.');
      } else {
        console.log('⚠️ Es posible que no tengas permisos para acceder a la tabla "user"');
        console.log('Intenta activar el acceso público o configurar las políticas RLS.');
      }
      return;
    }
    
    console.log('✅ Tabla "user" existe y es accesible');
    
    // Paso 3: Buscar el usuario específico
    console.log('\n3. Buscando usuario específico (elena)...');
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('username', username);
    
    if (error) {
      console.error('❌ Error al buscar usuario:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('❌ Usuario "elena" no encontrado en la base de datos');
      
      // Intentar listar los primeros usuarios para depuración
      console.log('\nListando usuarios en la tabla para depuración:');
      const { data: allUsers, error: allUsersError } = await supabase
        .from('user')
        .select('username, password')
        .limit(10);
      
      if (allUsersError) {
        console.error('❌ Error al listar usuarios:', allUsersError.message);
      } else if (allUsers && allUsers.length > 0) {
        console.log('✅ Usuarios encontrados en la tabla:');
        allUsers.forEach(u => console.log(`- ${u.username} / ${u.password}`));
      } else {
        console.log('⚠️ No hay usuarios en la tabla "user"');
        console.log('Necesitas insertar al menos un usuario para probar el login');
      }
      
      return;
    }
    
    const user = data[0];
    console.log('✅ Usuario encontrado:', user.username);
    
    // Paso 4: Verificar contraseña
    console.log('\n4. Verificando contraseña...');
    if (user.password !== password) {
      console.log('❌ Contraseña incorrecta');
      console.log('Contraseña almacenada:', user.password);
      console.log('Contraseña proporcionada:', password);
      return;
    }
    
    console.log('✅ ¡LOGIN EXITOSO! Usuario autenticado:', user.username);
    console.log('Datos del usuario:', { 
      id: user.id, 
      nombre: user.nombre, 
      apellidos: user.apellidos, 
      rol: user.rol 
    });
    
  } catch (error) {
    console.error('Error general en la prueba de login:', error);
  }
}

// Ejecutar la función de prueba
testSimpleLogin();
