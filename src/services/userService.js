// Servicio para gestionar los usuarios mediante Supabase
import supabase from './supabaseClient';

// Servicio para operaciones relacionadas con usuarios
export const userService = {  
  // Iniciar sesión
  async login(username, password) {
    try {
      console.log(`Intentando iniciar sesión con usuario: ${username}`);
      console.log('Conectando a Supabase:', supabase.getUrl());
      
      // Buscar el usuario por nombre de usuario sin usar single()
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('username', username);

      if (error) {
        console.error('Error en la consulta a Supabase:', error);
        throw error;
      }
      
      console.log('Respuesta de Supabase:', data ? `Encontrados ${data.length} usuarios` : 'No se encontraron usuarios');
      
      if (!data || data.length === 0) {
        console.log('Usuario no encontrado');
        throw new Error('Credenciales incorrectas');
      }
      
      const user = data[0];
      
      // Comparar contraseñas (en producción debería usar hashing)
      if (user.password !== password) {
        console.log('Contraseña incorrecta');
        throw new Error('Credenciales incorrectas');
      }
      
      console.log('Inicio de sesión exitoso');
      
      // Eliminar la contraseña del objeto de usuario antes de devolverlo
      const { password: _, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      throw error;
    }
  },// Obtener todos los usuarios (solo para administradores)
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('user')
        .select('id, username, nombre, apellidos, rol, email')
        .order('id');
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },
  // Crear un nuevo usuario (solo para administradores)
  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('user')
        .insert(userData)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },
  // Actualizar un usuario existente (solo para administradores)
  async updateUser(id, userData) {
    try {
      const { data, error } = await supabase
        .from('user')
        .update(userData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  },
  // Eliminar un usuario (solo para administradores)
  async deleteUser(id) {
    try {
      const { error } = await supabase
        .from('user')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  }
};
