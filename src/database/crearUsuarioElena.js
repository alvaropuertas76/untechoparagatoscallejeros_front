// Script para crear el usuario elena/lopez directamente en la tabla user
import supabase from '../services/supabaseClient.js';

async function crearUsuarioElena() {
  console.log('=== CREANDO USUARIO ELENA PARA PRUEBAS ===');
  
  try {
    // Definir el usuario
    const nuevoUsuario = {
      username: 'elena',
      password: 'lopez',
      nombre: 'Elena',
      apellidos: 'López',
      rol: 'admin',
      email: 'elena@example.com'
    };
    
    console.log('Datos del usuario a crear:', nuevoUsuario);
    
    // Intentar insertar el usuario
    const { data, error } = await supabase
      .from('user')
      .insert(nuevoUsuario)
      .select();
    
    if (error) {
      console.error('Error al crear usuario:', error);
      
      // Si el error es de violación de restricción única, es posible que el usuario ya exista
      if (error.code === '23505') {
        console.log('⚠️ El usuario elena ya existe. Intentando actualizar...');
        
        // Intentar actualizar el usuario existente
        const { data: updateData, error: updateError } = await supabase
          .from('user')
          .update({ password: 'lopez' })
          .eq('username', 'elena')
          .select();
        
        if (updateError) {
          console.error('Error al actualizar usuario:', updateError);
          return;
        }
        
        console.log('✅ Usuario elena actualizado correctamente:', updateData);
      }
      return;
    }
    
    console.log('✅ Usuario elena creado correctamente:', data);
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar la creación del usuario
crearUsuarioElena();
