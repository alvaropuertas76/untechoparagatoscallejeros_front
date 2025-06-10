// Script para consultar directamente el usuario elena/lopez en la tabla user de Supabase
import supabase from '../services/supabaseClient.js';

async function consultarUsuario() {
  console.log('=== CONSULTA DIRECTA DE USUARIO ===');
  console.log('Buscando usuario elena con contraseña lopez en la tabla "user"');
  
  try {
    // Consultar directamente sin RLS ni complicaciones
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('username', 'elena');
    
    if (error) {
      console.error('Error al consultar usuario:', error);
      return;
    }
    
    console.log('Resultado de la consulta:', data);
    
    if (!data || data.length === 0) {
      console.log('No se encontró el usuario elena');
      return;
    }
    
    const usuario = data[0];
    console.log('Usuario encontrado:', usuario);
    
    // Verificar la contraseña
    if (usuario.password === 'lopez') {
      console.log('¡ÉXITO! La contraseña coincide');
    } else {
      console.log('La contraseña no coincide');
      console.log('Contraseña almacenada:', usuario.password);
    }
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar la consulta
consultarUsuario();
