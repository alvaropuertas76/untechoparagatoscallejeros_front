// Script para listar todos los usuarios en la tabla user de Supabase
import supabase from '../services/supabaseClient.js';

async function listarUsuarios() {
  console.log('=== LISTADO DE TODOS LOS USUARIOS EN SUPABASE ===');
  
  try {
    // Consultar todos los usuarios sin filtro
    const { data, error } = await supabase
      .from('user')
      .select('*');
    
    if (error) {
      console.error('Error al consultar usuarios:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ NO HAY USUARIOS en la tabla "user"');
      console.log('Es necesario crear al menos un usuario para probar el login');
      return;
    }
    
    console.log(`✅ Se encontraron ${data.length} usuarios en la tabla:`);
    data.forEach((usuario, index) => {
      console.log(`\n--- Usuario ${index + 1} ---`);
      console.log(`ID: ${usuario.id}`);
      console.log(`Username: ${usuario.username}`);
      console.log(`Password: ${usuario.password}`);
      console.log(`Nombre: ${usuario.nombre || 'N/A'}`);
      console.log(`Apellidos: ${usuario.apellidos || 'N/A'}`);
      console.log(`Rol: ${usuario.rol || 'N/A'}`);
      console.log(`Email: ${usuario.email || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar la consulta
listarUsuarios();
