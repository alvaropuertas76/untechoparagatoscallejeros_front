// Script para configurar las políticas de acceso al bucket de storage
import supabase from '../services/supabaseClient';

/**
 * Configura las políticas de acceso para el bucket de fotos de gatos.
 * Este script debe ejecutarse con un usuario con privilegios de administrador.
 */
async function configureStorageBucketPolicy() {
  try {
    console.log('Configurando políticas de acceso para el bucket cat-photos...');
    
    // 1. Verificar si el bucket existe
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error al listar buckets:', bucketsError);
      return {
        success: false,
        message: 'Error al listar buckets',
        error: bucketsError
      };
    }
    
    const catPhotosBucket = buckets.find(b => b.name === 'cat-photos');
    
    if (!catPhotosBucket) {
      console.log('El bucket cat-photos no existe. Creándolo...');
      
      // Crear el bucket si no existe
      const { data: newBucket, error: createError } = await supabase
        .storage
        .createBucket('cat-photos', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
          fileSizeLimit: 5242880 // 5MB
        });
      
      if (createError) {
        console.error('Error al crear el bucket cat-photos:', createError);
        return {
          success: false,
          message: 'Error al crear el bucket cat-photos',
          error: createError
        };
      }
      
      console.log('Bucket cat-photos creado exitosamente:', newBucket);
    } else {
      console.log('El bucket cat-photos ya existe.');
    }
    
    // 2. Actualizar las políticas del bucket para permitir acceso público (solo lectura)
    console.log('Configurando políticas de acceso público para el bucket cat-photos...');
    
    // Nota: La actualización de políticas solo puede hacerse a través de la interfaz de Supabase
    // o usando la API de administración con privilegios adecuados.
    // Aquí mostramos instrucciones para hacerlo manualmente.
    
    return {
      success: true,
      message: 'Para configurar el acceso público al bucket, sigue estos pasos:',
      instructions: [
        '1. Accede al panel de Supabase y ve a la sección Storage',
        '2. Selecciona el bucket "cat-photos"',
        '3. Ve a la pestaña "Policies" o "Políticas"',
        '4. Agrega una nueva política para permitir acceso anónimo de lectura:',
        '   - Policy name: allow_public_read',
        '   - For template: GET',
        '   - For authenticated users: NO',
        '   - For anonymous users: YES',
        '   - Policy definition: true (permitir todo)'
      ]
    };
  } catch (error) {
    console.error('Error al configurar políticas de bucket:', error);
    return {
      success: false,
      message: 'Error inesperado al configurar políticas de bucket',
      error: error
    };
  }
}

export default configureStorageBucketPolicy;
