// Script para insertar un usuario de prueba directamente en Supabase
import supabase from '../services/supabaseClient.js';

async function createTestUser() {
  console.log('Creando usuario de prueba (elena/lopez) en Supabase...');
  
  try {
    // Datos del usuario de prueba
    const testUser = {
      username: 'elena',
      password: 'lopez',
      nombre: 'Elena',
      apellidos: 'López',
      rol: 'admin',
      email: 'elena@ejemplo.com'
    };
    
    // Comprobar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('user')
      .select('*')
      .eq('username', testUser.username);
    
    if (checkError) {
      console.error('Error al verificar si el usuario existe:', checkError);
      return;
    }
    
    if (existingUser && existingUser.length > 0) {
      console.log('El usuario elena ya existe, actualizando contraseña...');
      
      // Actualizar contraseña
      const { data, error } = await supabase
        .from('user')
        .update({ password: 'lopez' })
        .eq('username', 'elena');
      
      if (error) {
        console.error('Error al actualizar contraseña:', error);
      } else {
        console.log('Contraseña actualizada correctamente');
      }
      
    } else {
      // Insertar el usuario de prueba
      const { data, error } = await supabase
        .from('user')
        .insert([testUser]);
      
      if (error) {
        console.error('Error al insertar usuario de prueba:', error);
      } else {
        console.log('Usuario de prueba creado correctamente:', data);
      }
    }
    
    // Verificar que el usuario existe
    const { data: verification, error: verificationError } = await supabase
      .from('user')
      .select('*')
      .eq('username', testUser.username);
    
    if (verificationError) {
      console.error('Error al verificar usuario:', verificationError);
    } else {
      console.log('Verificación: Usuario en la base de datos:', verification);
    }
    
  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
  }
}

// Ejecutar la función
createTestUser();
