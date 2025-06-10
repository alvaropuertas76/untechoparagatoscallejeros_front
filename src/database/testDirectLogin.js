// Script muy simplificado para probar directamente el login con elena/lopez
import supabase from '../services/supabaseClient.js';

async function testDirectLogin() {
  console.log('=== PRUEBA DE LOGIN DIRECTA ELENA/LOPEZ ===');
  
  try {
    // Primero verificamos la conexión
    const connectionCheck = await supabase.checkConnection();
    console.log('Estado de conexión:', connectionCheck.ok ? 'OK' : 'ERROR');
    console.log('Detalles de conexión:', connectionCheck);
    
    if (!connectionCheck.ok) {
      console.error('No se puede continuar sin conexión a Supabase');
      return;
    }
    
    // Verificar si la tabla user existe y está accesible
    console.log('\nVerificando tabla user...');
    const { error: tableError } = await supabase
      .from('user')
      .select('count(*)', { head: true });
      
    if (tableError) {
      console.error('Error al acceder a la tabla user:', tableError);
      console.log('⚠️ Es posible que la tabla no exista o que no tengas permisos para acceder a ella');
      console.log('⚠️ Revisa los permisos RLS en Supabase');
      return;
    }
    
    // Consulta directa para el usuario elena
    console.log('\nConsultando directamente usuario elena...');
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('username', 'elena')
      .maybeSingle();
    
    if (userError) {
      console.error('Error al consultar usuario elena:', userError);
      return;
    }
    
    if (!user) {
      console.log('❌ Usuario elena no encontrado');
      
      // Consultar los primeros usuarios para depurar
      console.log('\nListando los primeros usuarios (máximo 5):');
      const { data: users, error: usersError } = await supabase
        .from('user')
        .select('username, password')
        .limit(5);
      
      if (usersError) {
        console.error('Error al listar usuarios:', usersError);
      } else {
        console.log(users?.length ? users : 'No hay usuarios');
      }
      
      return;
    }
    
    console.log('✅ Usuario elena encontrado en la base de datos:', user);
    
    // Verificar contraseña
    if (user.password === 'lopez') {
      console.log('✅ Contraseña correcta. LOGIN EXITOSO!');
    } else {
      console.log('❌ Contraseña incorrecta');
      console.log('Contraseña almacenada:', user.password);
      console.log('Contraseña esperada: lopez');
    }
    
  } catch (error) {
    console.error('Error general en la prueba:', error);
  }
}

testDirectLogin();
