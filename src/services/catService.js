// Servicio para gestionar los gatos mediante Supabase
import supabase from './supabaseClient';

// Servicio para operaciones CRUD de gatos
class CatService {
  // Obtener todos los gatos
  async getAllCats() {
    try {
      const { data, error } = await supabase
        .from('cats')
        .select(`
          *,
          fotos:cat_photos(*)
        `)
        .order('id');
      
      if (error) throw error;
      
      return data.map(this.transformApiCat);
    } catch (error) {
      console.error('Error al obtener todos los gatos:', error);
      throw error;
    }
  }

  // Obtener un gato por ID
  async getCatById(id) {
    try {
      const { data, error } = await supabase
        .from('cats')
        .select(`
          *,
          fotos:cat_photos(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return this.transformApiCat(data);
    } catch (error) {
      console.error(`Error al obtener gato con ID ${id}:`, error);
      throw error;
    }
  }

  // Crear un nuevo gato
  async createCat(catData) {
    try {
      // Validar datos requeridos
      if (!catData.nombre || !catData.fechaNacimiento || !catData.lugarRecogida || !catData.anoLlegada) {
        throw new Error('Faltan campos obligatorios');
      }

      // Transformar al formato de la API
      const apiData = this.transformToApiFormat(catData);
      delete apiData.fotos; // Eliminar las fotos para insertarlas por separado
      
      // Insertar el gato
      const { data, error } = await supabase
        .from('cats')
        .insert(apiData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Si hay fotos, insertarlas
      if (catData.fotos && catData.fotos.length > 0) {
        await this.uploadCatPhotos(data.id, catData.fotos);
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
      // Validar datos requeridos
      if (!catData.nombre || !catData.fechaNacimiento || !catData.lugarRecogida || !catData.anoLlegada) {
        throw new Error('Faltan campos obligatorios');
      }

      // Transformar al formato de la API
      const apiData = this.transformToApiFormat(catData);
      delete apiData.fotos; // Eliminar las fotos para gestionarlas por separado
      
      // Actualizar el gato
      const { error } = await supabase
        .from('cats')
        .update({
          ...apiData,
          updated_at: new Date()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Si hay fotos nuevas, actualizarlas
      if (catData.fotos && catData.fotos.length > 0) {
        // Primero eliminamos las fotos existentes
        await supabase
          .from('cat_photos')
          .delete()
          .eq('cat_id', id);
          
        // Luego subimos las nuevas
        await this.uploadCatPhotos(id, catData.fotos);
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
      // Primero eliminamos las fotos asociadas
      const { error: photoError } = await supabase
        .from('cat_photos')
        .delete()
        .eq('cat_id', id);
        
      if (photoError) throw photoError;
      
      // Luego eliminamos el gato
      const { error } = await supabase
        .from('cats')
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
      let query = supabase
        .from('cats')
        .select(`
          *,
          fotos:cat_photos(*)
        `);
      
      // Aplicar filtros
      if (filters.nombre) {
        query = query.ilike('nombre', `%${filters.nombre}%`);
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
      
      return data.map(this.transformApiCat);
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

  // Método auxiliar para subir fotos de un gato
  async uploadCatPhotos(catId, fotos) {
    try {
      const photosToInsert = fotos.map((foto, index) => ({
        cat_id: catId,
        url: foto.url || foto,
        es_principal: index === 0 // La primera foto es la principal
      }));
      
      const { error } = await supabase
        .from('cat_photos')
        .insert(photosToInsert);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Error al subir fotos para el gato ${catId}:`, error);
      throw error;
    }
  }

  // Transformar el formato de la API al formato usado en el frontend
  transformApiCat(apiCat) {
    return {
      id: apiCat.id,
      nombre: apiCat.nombre,
      fechaNacimiento: apiCat.fecha_nacimiento,
      lugarRecogida: apiCat.lugar_recogida,
      testado: apiCat.testado,
      castrado: apiCat.castrado,
      sexo: apiCat.sexo,
      caracter: apiCat.caracter,
      gatoAireLibre: apiCat.gato_aire_libre,
      gatoInterior: apiCat.gato_interior,
      familia: apiCat.familia,
      compatibleNinos: apiCat.compatible_ninos,
      casaTranquila: apiCat.casa_tranquila,
      historia: apiCat.historia,
      apadrinado: apiCat.apadrinado,
      adoptado: apiCat.adoptado,
      desaparecido: apiCat.desaparecido,
      fechaFallecido: apiCat.fecha_fallecido,
      anoLlegada: apiCat.ano_llegada,
      notasSalud: apiCat.notas_salud,
      // Transformar las fotos para mantener la compatibilidad
      fotos: apiCat.fotos ? apiCat.fotos.map(foto => foto.url) : []
    };
  }

  // Transformar del formato del frontend al formato de la API
  transformToApiFormat(catData) {
    return {
      nombre: catData.nombre,
      fecha_nacimiento: catData.fechaNacimiento,
      lugar_recogida: catData.lugarRecogida,
      testado: catData.testado || false,
      castrado: catData.castrado || false,
      sexo: catData.sexo !== undefined ? catData.sexo : true,
      caracter: catData.caracter || '',
      gato_aire_libre: catData.gatoAireLibre || false,
      gato_interior: catData.gatoInterior || false,
      familia: catData.familia || false,
      compatible_ninos: catData.compatibleNinos || false,
      casa_tranquila: catData.casaTranquila || false,
      historia: catData.historia || '',
      apadrinado: catData.apadrinado || false,
      adoptado: catData.adoptado || false,
      desaparecido: catData.desaparecido || false,
      fecha_fallecido: catData.fechaFallecido || null,
      ano_llegada: catData.anoLlegada,
      notas_salud: catData.notasSalud || '',
      fotos: catData.fotos || [] // Lo guardamos aquí, pero se gestionará por separado
    };
  }
}

// Exportar una instancia singleton del servicio
export const catService = new CatService();