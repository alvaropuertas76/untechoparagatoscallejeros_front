// Verificador de configuración de Supabase Storage
import supabase from './supabaseClient';

// Función para verificar el acceso al storage de Supabase
export async function testStorageAccess() {
  try {
    // Verificar que tenemos una conexión a Supabase
    console.log('Verificando configuración de Supabase...');
    const connectionInfo = await supabase.checkConnection();
    console.log('Estado de conexión a Supabase:', connectionInfo);

    // Probar a listar los buckets de storage
    console.log('Intentando listar buckets de storage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error al listar buckets:', bucketsError);
      return {
        success: false,
        error: bucketsError,
        message: `Error al listar buckets: ${bucketsError.message}`
      };
    }
    
    console.log('Buckets disponibles:', buckets);
    
    // Verificar si existe el bucket cat-photos
    const catPhotosBucket = buckets.find(b => b.name === 'cat-photos');
    
    if (!catPhotosBucket) {
      console.error('No se encontró el bucket cat-photos');
      return {
        success: false,
        error: 'bucket_not_found',
        message: 'No se encontró el bucket cat-photos'
      };
    }
    
    // Intentar listar el contenido del bucket cat-photos
    console.log('Intentando listar contenido del bucket cat-photos...');
    const { data: files, error: filesError } = await supabase
      .storage
      .from('cat-photos')
      .list();
    
    if (filesError) {
      console.error('Error al listar contenido del bucket cat-photos:', filesError);
      return {
        success: false,
        error: filesError,
        message: `Error al listar contenido del bucket: ${filesError.message}`
      };
    }
    
    console.log('Contenido del bucket cat-photos:', files);
    
    // Verificar detalladamente los permisos
    console.log('Verificando permisos del bucket...');
    
    // Intentar verificar carpetas específicas de prueba
    try {
      const testCats = ['Akira', 'Alan', 'Luna'];
      const results = {};
      
      for (const cat of testCats) {
        console.log(`Probando acceso a carpeta ${cat}...`);
        const { data: catFiles, error: catError } = await supabase
          .storage
          .from('cat-photos')
          .list(cat);
          
        results[cat] = {
          success: !catError,
          files: catFiles || [],
          error: catError ? catError.message : null
        };
        
        if (catError) {
          console.warn(`Error al listar archivos para ${cat}:`, catError);
        } else {
          console.log(`Archivos encontrados para ${cat}:`, catFiles);
        }
      }
      
      return {
        success: true,
        buckets,
        files,
        catTests: results,
        message: 'Acceso al storage verificado correctamente'
      };
    } catch (testError) {
      console.error('Error en las pruebas específicas:', testError);
      
      return {
        success: true, // Consideramos éxito general pero con advertencias
        buckets,
        files,
        testError,
        message: 'Acceso al storage verificado pero con advertencias en pruebas específicas'
      };
    }
  } catch (error) {
    console.error('Error inesperado al verificar storage:', error);
    return {
      success: false,
      error,
      message: `Error inesperado: ${error.message}`
    };
  }
}

// Función para verificar si un archivo es una imagen
export function isImageFile(filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const lowerFilename = filename.toLowerCase();
  return imageExtensions.some(ext => lowerFilename.endsWith(ext));
}

// Función de ayuda para normalizar nombres de carpetas
export function normalizeFolderName(name) {
  // Eliminar acentos y caracteres especiales
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
}

export default testStorageAccess;
