// Script para insertar los usuarios del archivo JSON a Supabase
import supabase from '../services/supabaseClient.js';
import fs from 'fs';
import path from 'path';

// Leer el archivo JSON de usuarios
const usersFilePath = path.join(process.cwd(), 'public', 'data', 'users.json');
console.log('Leyendo archivo de usuarios:', usersFilePath);
const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));

// Función para insertar usuarios en Supabase
async function insertUsers() {
  const { users } = usersData;
  
  console.log(`Intentando insertar ${users.length} usuarios en Supabase...`);
  console.log('URL de Supabase:', supabase.getUrl());
  // Insertar cada usuario
  for (const user of users) {
    console.log(`Insertando usuario: ${user.username} (${user.rol})`);
    
    // Usar la función rpc para insertar el usuario saltando las políticas RLS
    const { data, error } = await supabase.rpc('insert_user', {
      user_data: {
        id: user.id,
        username: user.username, 
        password: user.password,
        nombre: user.nombre,
        apellidos: user.apellidos,
        rol: user.rol,
        email: user.email
      }
    });
    
    if (error) {
      console.error(`Error al insertar usuario ${user.username}:`, error);
    } else {
      console.log(`Usuario ${user.username} insertado correctamente:`, data);
    }
  }
    // Verificar que los usuarios se han insertado
  const { data: insertedUsers, error: queryError } = await supabase
    .from('user')
    .select('id, username, nombre, rol')
    .order('id');
    
  if (queryError) {
    console.error('Error al verificar usuarios insertados:', queryError);
  } else {
    console.log('Usuarios insertados en la base de datos:');
    console.table(insertedUsers);
  }
  
  console.log('Proceso de inserción de usuarios completado');
}

// Ejecutar la función
insertUsers()
  .catch(error => console.error('Error en el proceso:', error));
