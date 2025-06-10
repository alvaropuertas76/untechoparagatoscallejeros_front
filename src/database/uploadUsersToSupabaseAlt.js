// Script alternativo para insertar usuarios en Supabase sin usar RPC
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
  
  // Primero, intentamos desactivar las políticas RLS para la tabla de usuarios
  console.log('Desactivando temporalmente las políticas RLS...');
  try {
    const disableRLSQuery = `
      ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;
    `;
    
    const { error: disableError } = await supabase.rpc('exec_sql', { 
      query: disableRLSQuery 
    });
    
    if (disableError) {
      console.error('Error al desactivar RLS:', disableError);
      console.log('Continuando con el método alternativo...');
    } else {
      console.log('Políticas RLS desactivadas temporalmente');
    }
  } catch (error) {
    console.error('Error al ejecutar consulta de desactivación RLS:', error);
  }
  
  // Insertar cada usuario directamente
  for (const user of users) {
    console.log(`Insertando usuario: ${user.username} (${user.rol})`);
    
    // Método 1: Usando el método insert directamente
    const { data, error } = await supabase
      .from('user')
      .insert({
        id: user.id,
        username: user.username,
        password: user.password,
        nombre: user.nombre,
        apellidos: user.apellidos,
        rol: user.rol,
        email: user.email
      })
      .select();
    
    if (error) {
      console.error(`Error al insertar usuario ${user.username} (Método 1):`, error);
      
      // Método 2: Intentar insertar usando una consulta SQL directa
      console.log(`Intentando insertar ${user.username} con SQL directo...`);
      const insertQuery = `
        INSERT INTO "user" (id, username, password, nombre, apellidos, rol, email)
        VALUES (
          ${user.id},
          '${user.username}',
          '${user.password}',
          '${user.nombre}',
          '${user.apellidos}',
          '${user.rol}',
          '${user.email}'
        )
        ON CONFLICT (id) DO UPDATE
        SET username = EXCLUDED.username,
            password = EXCLUDED.password,
            nombre = EXCLUDED.nombre,
            apellidos = EXCLUDED.apellidos,
            rol = EXCLUDED.rol,
            email = EXCLUDED.email;
      `;
      
      const { error: sqlError } = await supabase.rpc('exec_sql', { query: insertQuery });
      
      if (sqlError) {
        console.error(`Error al insertar usuario ${user.username} (Método 2):`, sqlError);
      } else {
        console.log(`Usuario ${user.username} insertado correctamente (Método 2)`);
      }
    } else {
      console.log(`Usuario ${user.username} insertado correctamente (Método 1):`, data);
    }
  }
  
  // Reactivar las políticas RLS
  try {
    console.log('Reactivando las políticas RLS...');
    const enableRLSQuery = `
      ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
    `;
    
    const { error: enableError } = await supabase.rpc('exec_sql', { 
      query: enableRLSQuery 
    });
    
    if (enableError) {
      console.error('Error al reactivar RLS:', enableError);
    } else {
      console.log('Políticas RLS reactivadas');
    }
  } catch (error) {
    console.error('Error al ejecutar consulta de reactivación RLS:', error);
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
