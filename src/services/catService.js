// Servicio para gestionar los gatos mediante Supabase
import supabase from './supabaseClient';

// Servicio para operaciones CRUD de gatos
class CatService {
  // Obtener todos los gatos
  async getAllCats() {
    try {
      console.log('Consultando gatos en Supabase...');
      const { data, error } = await supabase
        .from('cat')
        .select('*')
        .order('id');
      
      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }
      
      console.log('Datos recibidos de Supabase:', data);
      
      // Transformar los datos
      const transformedCats = [];
      
      // Procesamos cada gato y buscamos sus fotos
      for (const cat of data) {
        // Transformar el gato
        const transformedCat = this.transformApiCat(cat);
        
        // Asegurarnos de que el objeto transformedCat no es null
        if (transformedCat && transformedCat.id && transformedCat.nombre) {
          // Inicializar el array de fotos como vacío
          transformedCat.fotos = [];
          
          // Intentar obtener las fotos del bucket
          const bucketPhotos = await this.getBucketPhotosForCat(transformedCat.nombre);
          
          if (bucketPhotos && bucketPhotos.length > 0) {
            // Asignar las fotos del bucket al array
            transformedCat.fotos = bucketPhotos;
          }
          
          // Si después de todo no hay fotos, usar una por defecto
          if (transformedCat.fotos.length === 0) {
            transformedCat.fotos = ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop"];
          }
          
          transformedCats.push(transformedCat);
        }
      }
      
      console.log('Datos transformados con fotos:', transformedCats);
      return transformedCats;
    } catch (error) {
      console.error('Error al obtener todos los gatos:', error);
      throw error;
    }
  }

  // Obtener un gato por ID
  async getCatById(id) {
    try {
      console.log(`Obteniendo datos actualizados del gato con ID ${id}`);
      
      // Obtener solo los datos básicos del gato sin intentar la relación que falla
      const { data, error } = await supabase
        .from('cat')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Transformar el gato
      const transformedCat = this.transformApiCat(data);
      
      // Si tenemos un gato válido, buscar fotos en el bucket
      if (transformedCat && transformedCat.nombre) {
        // Inicializar array de fotos vacío
        transformedCat.fotos = [];
        
        // Obtener fotos del bucket de storage
        const bucketPhotos = await this.getBucketPhotosForCat(transformedCat.nombre);
        
        if (bucketPhotos && bucketPhotos.length > 0) {
          // Asignar las fotos del bucket al array
          transformedCat.fotos = bucketPhotos;
        } 
        
        // Si después de todo no hay fotos, usar una por defecto
        if (transformedCat.fotos.length === 0) {
          transformedCat.fotos = ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop"];
        }
      }
      
      console.log(`Datos transformados del gato ${id}:`, transformedCat);
      return transformedCat;
    } catch (error) {
      console.error(`Error al obtener gato con ID ${id}:`, error);
      throw error;
    }
  }

  // Crear un nuevo gato
  async createCat(catData) {
    try {
      // Validar datos requeridos - solo el nombre es obligatorio
      if (!catData.nombre) {
        throw new Error('El nombre del gato es obligatorio');
      }

      // Transformar al formato de la API
      const apiData = this.transformToApiFormat(catData);
      delete apiData.fotos; // Eliminar las fotos para insertarlas por separado
      
      // Insertar el gato
      const { data, error } = await supabase
        .from('cat')
        .insert(apiData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Si hay fotos, almacenarlas en el storage
      if (catData.fotos && catData.fotos.length > 0) {
        // No hacemos nada con las fotos aquí, ya que ahora solo se suben al bucket
        // y no a una tabla que ya no existe
      }
      
      // Obtener el gato completo con sus fotos
      return this.getCatById(data.id);
    } catch (error) {
      console.error('Error al crear gato:', error);
      throw error;
    }
  }

  // Actualizar un gato existente
  async updateCat(id, catData) {
    try {
      // Validar datos requeridos - solo el nombre es obligatorio
      if (!catData.nombre) {
        throw new Error('El nombre del gato es obligatorio');
      }

      // Transformar al formato de la API
      const apiData = this.transformToApiFormat(catData);
      delete apiData.fotos; // Eliminar las fotos para gestionarlas por separado
      
      // Actualizar el gato
      const { error } = await supabase
        .from('cat')
        .update(apiData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Si hay fotos nuevas, actualizarlas
      if (catData.fotos && catData.fotos.length > 0) {
        // No hacemos nada con las fotos aquí, ya que ahora solo se suben al bucket
        // y no a una tabla que ya no existe
      }
      
      // Obtener el gato actualizado
      return this.getCatById(id);
    } catch (error) {
      console.error(`Error al actualizar gato con ID ${id}:`, error);
      throw error;
    }
  }

  // Eliminar un gato (borrado completo en Supabase)
  async deleteCat(id) {
    try {
      // Solo eliminamos el gato, ya que no hay tabla de fotos
      const { error } = await supabase
        .from('cat')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { message: 'Gato eliminado correctamente' };
    } catch (error) {
      console.error(`Error al eliminar gato con ID ${id}:`, error);
      throw error;
    }
  }

  // Buscar gatos con filtros
  async searchCats(filters = {}) {
    try {
      // Consulta básica sin relaciones
      let query = supabase
        .from('cat')
        .select('*');
      
      // Aplicar filtros
      if (filters.nombre) {
        query = query.ilike('name', `%${filters.nombre}%`);
      }
      
      if (filters.sexo !== undefined && filters.sexo !== '') {
        query = query.eq('sexo', filters.sexo);
      }
      
      if (filters.adoptado !== undefined && filters.adoptado !== '') {
        query = query.eq('adoptado', filters.adoptado);
      }
      
      if (filters.lugarRecogida) {
        query = query.ilike('lugar_recogida', `%${filters.lugarRecogida}%`);
      }
      
      // Ejecutar la consulta
      const { data, error } = await query.order('id');
      
      if (error) throw error;
      
      // Transformar los gatos y buscar fotos
      const transformedCats = [];
      
      for (const cat of data) {
        const transformedCat = this.transformApiCat(cat);
        
        if (transformedCat && transformedCat.id && transformedCat.nombre) {
          // Inicializar el array de fotos como vacío
          transformedCat.fotos = [];
          
          // Buscar fotos en el bucket
          const bucketPhotos = await this.getBucketPhotosForCat(transformedCat.nombre);
          
          if (bucketPhotos && bucketPhotos.length > 0) {
            // Asignar las fotos del bucket al array
            transformedCat.fotos = bucketPhotos;
          }
          
          // Si después de todo no hay fotos, usar una por defecto
          if (transformedCat.fotos.length === 0) {
            transformedCat.fotos = ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop"];
          }
        }
        
        transformedCats.push(transformedCat);
      }
      
      return transformedCats;
    } catch (error) {
      console.error('Error al buscar gatos:', error);
      throw error;
    }
  }

  // Obtener estadísticas de gatos
  async getStats() {
    try {
      const cats = await this.getAllCats();
      
      const total = cats.length;
      const adoptados = cats.filter(cat => cat.adoptado).length;
      const apadrinados = cats.filter(cat => cat.apadrinado).length;
      const disponibles = cats.filter(cat => !cat.adoptado && !cat.fechaFallecido && !cat.desaparecido).length;
      const fallecidos = cats.filter(cat => cat.fechaFallecido).length;
      const desaparecidos = cats.filter(cat => cat.desaparecido).length;
      const sinTestar = cats.filter(cat => !cat.testado && !cat.fechaFallecido).length;
      const sinCastrar = cats.filter(cat => !cat.castrado && !cat.fechaFallecido).length;

      return {
        total,
        adoptados,
        apadrinados,
        disponibles,
        fallecidos,
        desaparecidos,
        sinTestar,
        sinCastrar,
        porcentajeAdoptados: total > 0 ? Math.round((adoptados / total) * 100) : 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Transformar el formato de la API al formato usado en el frontend
  transformApiCat(apiCat) {
    // Verificar que apiCat existe y no es null o undefined
    if (!apiCat) {
      console.error('transformApiCat recibió un objeto nulo o indefinido');
      return null;
    }
    
    console.log('Transformando gato API:', apiCat);
    
    return {
      id: apiCat.id,
      nombre: apiCat.name || apiCat.nombre || '',
      fechaNacimiento: apiCat.fechaNacimiento || '',
      lugarRecogida: apiCat.lugarRecogida || '',
      testado: apiCat.testado || false,
      castrado: apiCat.castrado || false,
      sexo: apiCat.sexo !== undefined ? apiCat.sexo : true,
      caracter: apiCat.caracter || '',
      gatoAireLibre: apiCat.gatoAireLibre || false,
      gatoInterior: apiCat.gatoInterior || false,
      familia: apiCat.familia || false,
      compatibleNinos: apiCat.compatibleNinos || false,
      casaTranquila: apiCat.casaTranquila || false,
      historia: apiCat.historia || '',
      apadrinado: apiCat.apadrinado || false,
      adoptado: apiCat.adoptado || false,
      desaparecido: apiCat.desaparecido || false,
      fechaFallecido: apiCat.fechaFallecido || null,
      anoLlegada: apiCat.anoLlegada || apiCat.anoLlegada || '', // Considerar ambos formatos por compatibilidad
      // Transformar las fotos para mantener la compatibilidad con el formato que espera el frontend
      fotos: apiCat.fotos && apiCat.fotos.length > 0 
        ? apiCat.fotos.map(foto => foto.url || foto) 
        : []
    };
  }

  // Transformar del formato del frontend al formato de la API
  transformToApiFormat(catData) {
    return {
      name: catData.nombre, // Usar 'name' en lugar de 'nombre' para que coincida con la BD
      fechaNacimiento: catData.fechaNacimiento,
      lugarRecogida: catData.lugarRecogida,
      testado: catData.testado || false,
      castrado: catData.castrado || false,
      sexo: catData.sexo !== undefined ? catData.sexo : true,
      caracter: catData.caracter || '',
      gatoAireLibre: catData.gatoAireLibre || false,
      gatoInterior: catData.gatoInterior || false,
      familia: catData.familia || false,
      compatibleNinos: catData.compatibleNinos || false,
      casaTranquila: catData.casaTranquila || false,
      historia: catData.historia || '',
      apadrinado: catData.apadrinado || false,
      adoptado: catData.adoptado || false,
      desaparecido: catData.desaparecido || false,
      fechaFallecido: catData.fechaFallecido || null,
      anoLlegada: catData.anoLlegada, // Usar anoLlegada para que coincida con el nombre correcto en la BD
      fotos: catData.fotos || [] // Lo guardamos aquí, pero se gestionará por separado
    };
  }

  // Obtener todas las fotos de un gato desde el bucket
  async getBucketPhotosForCat(catName) {
    try {
      if (!catName) {
        console.error('No se proporcionó nombre de gato para buscar fotos');
        return null;
      }

      console.log(`Buscando todas las fotos para el gato: ${catName}`);
      
      // Listar los archivos en la carpeta con el nombre del gato dentro del bucket "cat-photos"
      const { data: files, error } = await supabase
        .storage
        .from('cat-photos')
        .list(catName);
      
      if (error) {
        console.error(`Error al listar fotos para ${catName}:`, error);
        return null;
      }
      
      if (!files || files.length === 0) {
        console.log(`No se encontraron fotos para ${catName}`);
        return null;
      }
      
      console.log(`Fotos encontradas para ${catName}:`, files);
      
      // Generar URLs para todas las fotos encontradas
      const photoUrls = [];
      
      for (const file of files) {
        const { data: publicUrl } = await supabase
          .storage
          .from('cat-photos')
          .getPublicUrl(`${catName}/${file.name}`);
          
        if (publicUrl) {
          photoUrls.push(publicUrl.publicUrl);
        }
      }
      
      console.log(`URLs públicas generadas para ${catName}:`, photoUrls);
      
      return photoUrls;
    } catch (error) {
      console.error(`Error al obtener fotos para ${catName}:`, error);
      return null;
    }
  }

  // Obtener la foto principal de un gato desde el bucket de Supabase
  async getMainPhotoFromBucket(catName) {
    try {
      if (!catName) {
        console.error('No se proporcionó nombre de gato para buscar fotos');
        return null;
      }

      console.log(`Buscando fotos para el gato: ${catName}`);
      
      // Listar los archivos en la carpeta con el nombre del gato dentro del bucket "cat-photos"
      const { data: files, error } = await supabase
        .storage
        .from('cat-photos')
        .list(catName);
      
      if (error) {
        console.error(`Error al listar fotos para ${catName}:`, error);
        return null;
      }
      
      if (!files || files.length === 0) {
        console.log(`No se encontraron fotos para ${catName}`);
        return null;
      }
      
      console.log(`Fotos encontradas para ${catName}:`, files);
      
      // Obtener la primera foto (considerada como la principal)
      const mainPhoto = files[0];
      
      // Generar la URL pública para la foto
      const { data: publicUrl } = await supabase
        .storage
        .from('cat-photos')
        .getPublicUrl(`${catName}/${mainPhoto.name}`);
      
      console.log(`URL pública generada para ${catName}:`, publicUrl);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error(`Error al obtener foto principal para ${catName}:`, error);
      return null;
    }
  }

  // Alias para getBucketPhotosForCat para mantener compatibilidad con componentes que pueden estar usando este nombre
  async getAllPhotosFromBucket(catName) {
    console.log(`Llamada a getAllPhotosFromBucket para ${catName}, redirigiendo a getBucketPhotosForCat`);
    return this.getBucketPhotosForCat(catName);
  }
}

// Exportar una instancia singleton del servicio
const catServiceInstance = new CatService();
export default catServiceInstance;