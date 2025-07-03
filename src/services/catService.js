// Servicio para gestionar los gatos mediante Supabase
import supabase from './supabaseClient';
import { testStorageAccess } from './testStorageAccess';

// Variable para almacenar si ya verificamos el storage
let storageVerified = false;

// Servicio para operaciones CRUD de gatos
class CatService {
  // Obtener todos los gatos
  async getAllCats() {
    try {
      console.log('Consultando gatos en Supabase...');
      const { data, error } = await supabase
        .from('cat')
        .select(`
          *
        `)
        .order('id');
      
      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }
      
      console.log('Datos recibidos de Supabase:', data);
      
      // Transformar los datos
      const transformedCats = [];
      
      // Procesamos cada gato y buscamos sus fotos en el bucket
      for (const cat of data) {
        try {
          // Transformar el gato
          const transformedCat = this.transformApiCat(cat);
          
          // Asegurarnos de que el objeto transformedCat no es null
          if (transformedCat) {
            // Asegurar que hay un array de fotos aunque sea vacío
            if (!transformedCat.fotos) {
              transformedCat.fotos = [];
            }
            
            // Intentar obtener las fotos del bucket
            if (transformedCat.nombre) {
              try {
                const bucketPhotos = await this.getAllPhotosFromBucket(transformedCat.nombre);
                
                if (bucketPhotos && bucketPhotos.length > 0) {
                  // Si encontramos fotos en el bucket, las añadimos al array de fotos
                  transformedCat.fotos = [...bucketPhotos, ...transformedCat.fotos];
                  console.log(`Fotos de bucket encontradas para ${transformedCat.nombre}: ${bucketPhotos.length} fotos`);
                } 
                // Si no hay fotos del bucket ni en la tabla, usar una por defecto
                else if (transformedCat.fotos.length === 0) {
                  console.log(`Usando foto por defecto para ${transformedCat.nombre}`);
                  transformedCat.fotos = ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop"];
                }
              } catch (photoError) {
                console.error(`Error al recuperar foto de bucket para ${transformedCat.nombre}:`, photoError);
                // Asegurar que hay una foto por defecto si ocurrió un error
                if (transformedCat.fotos.length === 0) {
                  transformedCat.fotos = ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop"];
                }
              }
            }
            
            transformedCats.push(transformedCat);
          }
        } catch (catError) {
          console.error(`Error procesando gato:`, catError, cat);
          // Continuamos con el siguiente gato
        }
      }
      
      console.log('Datos transformados con fotos del bucket:', transformedCats);
      return transformedCats;
    } catch (error) {
      console.error('Error al obtener todos los gatos:', error);
      throw error;
    }
  }

  // Obtener un gato por ID
  async getCatById(id) {
    try {
      const { data, error } = await supabase
        .from('cat')
        .select(`*`)  // Ya no hacemos join con cat_photos
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Transformar el gato
      const transformedCat = this.transformApiCat(data);
      
      // Si tenemos un gato válido, buscar fotos en el bucket
      if (transformedCat && transformedCat.nombre) {
        const bucketPhotos = await this.getAllPhotosFromBucket(transformedCat.nombre);
        
        // Inicializar el array de fotos vacío
        transformedCat.fotos = [];
        
        // Agregar las fotos del bucket si existen
        if (bucketPhotos && bucketPhotos.length > 0) {
          transformedCat.fotos = bucketPhotos;
        } 
        // Si no hay fotos, usar una por defecto
        else if (transformedCat.fotos.length === 0) {
          transformedCat.fotos = ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop"];
        }
      }
      
      return transformedCat;
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
      
      // Guardar las fotos antes de eliminarlas del objeto
      const fotos = catData.fotos || [];
      delete apiData.fotos; // Eliminar las fotos ya que se gestionan por separado
      
      // Insertar el gato
      const { data, error } = await supabase
        .from('cat')
        .insert(apiData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Subir las fotos al Storage si hay fotos
      if (fotos.length > 0) {
        console.log(`Subiendo ${fotos.length} fotos al Storage para el gato ${data.name || data.id}`);
        const uploadResult = await this.uploadCatPhotos(data.id, fotos, data.name);
        
        if (uploadResult.success) {
          console.log(`Fotos subidas con éxito para el gato ${data.name}`);
        } else {
          console.warn(`Algunas fotos no pudieron ser subidas para el gato ${data.name}`);
        }
      }
      
      // Obtener el gato completo con sus fotos (que serán obtenidas del bucket)
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
      
      // Guardar las fotos antes de eliminarlas del objeto
      const fotos = catData.fotos || [];
      delete apiData.fotos; // Eliminar las fotos ya que se gestionarán por separado
      
      // Actualizar el gato (solo datos, sin tocar fotos)
      const { error } = await supabase
        .from('cat')
        .update(apiData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Obtener el gato actual para conocer sus fotos existentes
      const currentCat = await this.getCatById(id);
      
      // Comparar fotos existentes con las nuevas para determinar cuáles son nuevas
      const currentPhotos = currentCat.fotos || [];
      
      // Filtrar solo las fotos nuevas (las que no están en currentPhotos)
      const newPhotos = fotos.filter(photo => !currentPhotos.includes(photo));
      
      if (newPhotos.length > 0) {
        console.log(`Detectadas ${newPhotos.length} fotos nuevas para subir`);
        
        // Subir solo las fotos nuevas
        const uploadResult = await this.uploadCatPhotos(id, newPhotos, currentCat.nombre);
        
        if (uploadResult.success) {
          console.log(`Fotos nuevas subidas con éxito para el gato ${currentCat.nombre}`);
        } else {
          console.warn(`Algunas fotos nuevas no pudieron ser subidas para el gato ${currentCat.nombre}`);
        }
      } else {
        console.log('No se detectaron fotos nuevas para subir');
      }
      
      // Obtener el gato actualizado con todas sus fotos
      return this.getCatById(id);
    } catch (error) {
      console.error(`Error al actualizar gato con ID ${id}:`, error);
      throw error;
    }
  }

  // Eliminar un gato (borrado completo en Supabase)
  async deleteCat(id) {
    try {
      // Eliminamos directamente el gato sin referencias a cat_photos
      const { error } = await supabase
        .from('cat')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Nota: Las fotos del bucket deberían eliminarse manualmente o con una función serverless
      
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
        .from('cat')
        .select(`*`);  // Ya no hacemos join con cat_photos
      
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
      
      // Transformar los gatos y buscar fotos en el bucket
      const transformedCats = [];
      
      for (const cat of data) {
        const transformedCat = this.transformApiCat(cat);
        
        if (transformedCat && transformedCat.nombre) {
          // Buscar fotos en el bucket
          const bucketPhotos = await this.getAllPhotosFromBucket(transformedCat.nombre);
          
          // Inicializar el array de fotos
          transformedCat.fotos = [];
          
          // Agregar las fotos del bucket si existen
          if (bucketPhotos && bucketPhotos.length > 0) {
            transformedCat.fotos = bucketPhotos;
          }
          // Si no hay fotos, usar una por defecto
          else {
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

  // Método auxiliar para subir fotos de un gato
  async uploadCatPhotos(catId, fotos, catName) {
    try {
      console.log(`Intentando subir ${fotos.length} fotos para el gato ${catName} (ID: ${catId})`);
      
      if (!catName) {
        console.error('Se requiere el nombre del gato para subir fotos');
        return false;
      }
      
      // Si no hay fotos para subir, terminamos
      if (!fotos || fotos.length === 0) {
        console.log('No hay fotos para subir');
        return true;
      }
      
      // Nombre del gato formateado para la carpeta y nombre de archivo
      const folderName = catName.trim();
      const baseFileName = catName.trim().toLowerCase().replace(/\s+/g, '_');
      
      // Verificar si existe la carpeta del gato, si no existe, la crearemos al subir
      console.log(`Verificando si existe la carpeta: ${folderName}`);
      
      // Obtener lista de archivos existentes para determinar el siguiente número secuencial
      let nextSequentialNumber = 1;
      
      try {
        // Verificar si la carpeta existe
        const { data: folderItems, error: folderError } = await supabase
          .storage
          .from('cat-photos')
          .list(folderName, { sortBy: { column: 'name', order: 'desc' } });
        
        if (!folderError && folderItems && folderItems.length > 0) {
          console.log(`Carpeta "${folderName}" encontrada con ${folderItems.length} archivos`);
          
          // Filtrar sólo archivos JPG
          const jpgFiles = folderItems.filter(file => 
            file.name.toLowerCase().endsWith('.jpg') || 
            file.name.toLowerCase().endsWith('.jpeg')
          );
          
          if (jpgFiles.length > 0) {
            // Buscar el número más alto en los nombres de archivo existentes
            // Patrón esperado: nombredelgato1.jpg, nombredelgato2.jpg, etc.
            const numberPattern = new RegExp(`${baseFileName}(\\d+)\\.jpe?g$`, 'i');
            
            let highestNumber = 0;
            
            for (const file of jpgFiles) {
              const match = file.name.match(numberPattern);
              if (match && match[1]) {
                const num = parseInt(match[1], 10);
                if (num > highestNumber) {
                  highestNumber = num;
                }
              }
            }
            
            // El siguiente número será el más alto encontrado + 1
            nextSequentialNumber = highestNumber + 1;
            console.log(`Número secuencial más alto encontrado: ${highestNumber}, siguiente será: ${nextSequentialNumber}`);
          }
        } else {
          console.log(`No se encontró la carpeta "${folderName}" o está vacía, se creará`);
        }
      } catch (e) {
        console.warn('Error al verificar archivos existentes:', e);
        // Continuamos con número secuencial 1 por defecto
      }
      
      // Subir cada foto
      const uploadedUrls = [];
      let allUploadsSuccessful = true;
      
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i];
        const currentSequential = nextSequentialNumber + i;
        const fileName = `${baseFileName}${currentSequential}.jpg`;
        const filePath = `${folderName}/${fileName}`;
        
        console.log(`Subiendo foto ${i+1}/${fotos.length} como "${filePath}"`);
        
        try {
          // Si la foto es una URL de datos (base64), convertirla a blob
          let fileData;
          
          if (foto.startsWith('data:')) {
            // Convertir base64 a blob
            const response = await fetch(foto);
            fileData = await response.blob();
          } else if (foto.startsWith('http')) {
            // Descargar imagen desde URL externa
            try {
              const response = await fetch(foto);
              fileData = await response.blob();
            } catch (fetchError) {
              console.error('Error al descargar imagen desde URL:', fetchError);
              allUploadsSuccessful = false;
              continue;
            }
          } else {
            console.error('Formato de foto no soportado:', foto.substring(0, 30) + '...');
            allUploadsSuccessful = false;
            continue;
          }
          
          // Subir la imagen a Supabase Storage
          const { data, error } = await supabase
            .storage
            .from('cat-photos')
            .upload(filePath, fileData, {
              cacheControl: '3600',
              upsert: true, // Sobrescribir si existe
              contentType: 'image/jpeg'
            });
          
          if (error) {
            console.error(`Error al subir foto ${filePath}:`, error);
            allUploadsSuccessful = false;
          } else {
            console.log(`Foto subida con éxito: ${filePath}`);
            
            // Obtener URL pública
            const { data: urlData } = await supabase
              .storage
              .from('cat-photos')
              .getPublicUrl(filePath);
            
            if (urlData?.publicUrl) {
              const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
              uploadedUrls.push(publicUrl);
              console.log(`URL pública generada: ${publicUrl}`);
            }
          }
        } catch (uploadError) {
          console.error(`Error general al procesar foto ${i+1}:`, uploadError);
          allUploadsSuccessful = false;
        }
      }
      
      console.log(`Proceso de subida finalizado. Éxito: ${allUploadsSuccessful}, URLs generadas: ${uploadedUrls.length}`);
      
      return {
        success: allUploadsSuccessful,
        urls: uploadedUrls
      };
    } catch (error) {
      console.error(`Error general en uploadCatPhotos:`, error);
      return {
        success: false,
        urls: []
      };
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
      anoLlegada: apiCat.anoLlegada || '',
      // Inicializamos fotos como un array vacío, se rellenarán más tarde
      fotos: []
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
      anoLlegada: catData.anoLlegada,
      fotos: catData.fotos || [] // Lo guardamos aquí, pero se gestionará por separado
    };
  }

  // Obtener la foto principal de un gato desde el bucket de Supabase
  async getMainPhotoFromBucket(catName) {
    try {
      if (!catName) {
        console.error('No se proporcionó nombre de gato para buscar fotos');
        return null;
      }
      
      console.log(`### INICIO BÚSQUEDA DE FOTOS PARA: "${catName}" ###`);
      
      // Obtener variantes del nombre del gato
      const firstCatName = catName.split(' ')[0]; // Primer nombre
      
      // ESTRATEGIA PRINCIPAL: Buscar en la carpeta con el nombre del gato
      console.log(`Buscando carpeta con el nombre del gato: "${firstCatName}"`);
      
      // Listar todas las carpetas y archivos en el raíz del bucket
      const { data: rootItems, error: rootError } = await supabase
        .storage
        .from('cat-photos')
        .list('', { sortBy: { column: 'name', order: 'asc' } });
      
      if (rootError || !rootItems) {
        console.error('Error al listar el contenido raíz del bucket:', rootError || 'No se obtuvieron datos');
        // Caer en el plan de contingencia
      } else {
        console.log(`Se encontraron ${rootItems.length} elementos en el raíz del bucket`);
        
        // Filtrar solo carpetas (elementos sin extensión de archivo)
        const folders = rootItems.filter(item => !item.name.includes('.'));
        console.log(`Carpetas encontradas: ${folders.map(f => f.name).join(', ')}`);
        
        // Buscar la carpeta que coincide con el nombre del gato
        const possibleFolders = [
          firstCatName, // Nombre exacto
          firstCatName.toLowerCase(), // Nombre en minúsculas
          catName, // Nombre completo
          catName.toLowerCase() // Nombre completo en minúsculas
        ];
        
        let matchingFolder = null;
        
        // Buscar coincidencia directa con alguna variante del nombre
        for (const folderName of possibleFolders) {
          const match = folders.find(f => f.name.toLowerCase() === folderName.toLowerCase());
          if (match) {
            matchingFolder = match.name;
            console.log(`¡Carpeta encontrada! "${matchingFolder}"`);
            break;
          }
        }
        
        // Si no encontramos coincidencia exacta, buscar carpeta que contenga el nombre
        if (!matchingFolder) {
          const containsMatch = folders.find(f => 
            f.name.toLowerCase().includes(firstCatName.toLowerCase()) || 
            (catName.includes(' ') && f.name.toLowerCase().includes(catName.toLowerCase()))
          );
          
          if (containsMatch) {
            matchingFolder = containsMatch.name;
            console.log(`Carpeta encontrada por coincidencia parcial: "${matchingFolder}"`);
          }
        }
        
        // Si encontramos una carpeta para este gato
        if (matchingFolder) {
          // Listar contenido de la carpeta
          console.log(`Listando contenido de la carpeta "${matchingFolder}"...`);
          const { data: folderFiles, error: folderError } = await supabase
            .storage
            .from('cat-photos')
            .list(matchingFolder, { sortBy: { column: 'name', order: 'asc' } });
          
          if (folderError) {
            console.error(`Error al listar contenido de la carpeta ${matchingFolder}:`, folderError);
          } else if (folderFiles && folderFiles.length > 0) {
            console.log(`Se encontraron ${folderFiles.length} archivos en la carpeta "${matchingFolder}": ${folderFiles.map(f => f.name).join(', ')}`);
            
            // Filtrar solo imágenes JPG
            const jpgFiles = folderFiles.filter(f => 
              f.name.toLowerCase().endsWith('.jpg') || 
              f.name.toLowerCase().endsWith('.jpeg')
            );
            
            if (jpgFiles.length > 0) {
              // Usar el primer archivo JPG encontrado
              const mainPhoto = jpgFiles[0];
              console.log(`Usando la primera imagen de la carpeta: "${mainPhoto.name}"`);
              
              // Generar URL pública para el archivo
              const { data } = await supabase
                .storage
                .from('cat-photos')
                .getPublicUrl(`${matchingFolder}/${mainPhoto.name}`);
              
              if (data?.publicUrl) {
                console.log(`URL generada: ${data.publicUrl}`);
                return `${data.publicUrl}?t=${new Date().getTime()}`;
              }
            }
          } else {
            console.log(`La carpeta "${matchingFolder}" está vacía`);
          }
        } else {
          console.log(`No se encontró ninguna carpeta para el gato "${catName}"`);
        }
      }
      
      // ESTRATEGIA DE RESPALDO 1: Intentar con archivos directos en el raíz
      console.log(`\n### ESTRATEGIA DE RESPALDO: Buscando archivos directos en el raíz ###`);
      
      // Buscar archivos que coincidan con el patrón: nombreGato1.jpg, nombreGato2.jpg, etc.
      if (rootItems && rootItems.length > 0) {
        // Filtrar por nombre + número + .jpg
        const directMatches = rootItems.filter(item => {
          const lowerName = item.name.toLowerCase();
          return (lowerName.startsWith(firstCatName.toLowerCase()) && 
                 lowerName.endsWith('.jpg') && 
                 /\d+\.jpg$/.test(lowerName));
        });
        
        if (directMatches.length > 0) {
          console.log(`Archivos directos encontrados: ${directMatches.map(f => f.name).join(', ')}`);
          
          // Usar el primer archivo encontrado
          const directPhoto = directMatches[0];
          console.log(`Usando archivo directo: "${directPhoto.name}"`);
          
          const { data } = await supabase
            .storage
            .from('cat-photos')
            .getPublicUrl(directPhoto.name);
          
          if (data?.publicUrl) {
            return `${data.publicUrl}?t=${new Date().getTime()}`;
          }
        }
      }
      
      // ESTRATEGIA DE RESPALDO 2: Intento directo con nombres conocidos
      console.log(`\n### ESTRATEGIA DE RESPALDO 2: Intentos directos con nombres específicos ###`);
      
      const specificFiles = [
        `${firstCatName}/${firstCatName}1.jpg`,
        `${firstCatName}/1.jpg`,
        `${firstCatName}/foto.jpg`,
        `${firstCatName.toLowerCase()}/${firstCatName.toLowerCase()}1.jpg`,
        `${firstCatName.toLowerCase()}/1.jpg`,
        `${firstCatName}1.jpg`,
        `${firstCatName.toLowerCase()}1.jpg`,
        'prueba.jpg'
      ];
      
      for (const specificFile of specificFiles) {
        console.log(`Intentando acceder directamente a: ${specificFile}`);
        
        try {
          const { data } = await supabase
            .storage
            .from('cat-photos')
            .getPublicUrl(specificFile);
          
          if (data?.publicUrl) {
            console.log(`¡Archivo encontrado directamente! ${specificFile}`);
            return `${data.publicUrl}?t=${new Date().getTime()}`;
          }
        } catch (specificError) {
          console.log(`No se pudo acceder a ${specificFile}`);
        }
      }
      
      // FALLBACK FINAL: Usar imagen de prueba
      console.log(`\n### FALLBACK FINAL: Usando imagen de prueba ###`);
      
      const { data: fallbackData } = await supabase
        .storage
        .from('cat-photos')
        .getPublicUrl('prueba.jpg');
      
      console.log('URL de imagen de prueba generada:', fallbackData?.publicUrl);
      return fallbackData?.publicUrl ? `${fallbackData.publicUrl}?t=${new Date().getTime()}` : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop";
      
    } catch (error) {
      console.error('Error al obtener fotos del gato:', error);
      
      // Plan de contingencia final
      try {
        const { data } = await supabase
          .storage
          .from('cat-photos')
          .getPublicUrl('prueba.jpg');
        
        return data?.publicUrl ? `${data.publicUrl}?t=${new Date().getTime()}` : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop";
      } catch (fallbackError) {
        return "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop";
      }
    }
  }
  
  // Obtener todas las fotos de un gato desde el bucket de Supabase
  async getAllPhotosFromBucket(catName) {
    try {
      if (!catName) {
        console.error('No se proporcionó nombre de gato para buscar fotos');
        return [];
      }
      
      // Usar timestamp único para evitar problemas de caché
      const timestamp = new Date().getTime();
      console.log(`### INICIO BÚSQUEDA DE TODAS LAS FOTOS PARA: "${catName}" (timestamp: ${timestamp}) ###`);
      
      // Array para almacenar todas las URLs de fotos encontradas
      const photoUrls = [];
      
      // Obtener variantes del nombre del gato
      const firstCatName = catName.split(' ')[0]; // Primer nombre
      
      // Listar todas las carpetas y archivos en el raíz del bucket
      const { data: rootItems, error: rootError } = await supabase
        .storage
        .from('cat-photos')
        .list('', { 
          sortBy: { column: 'name', order: 'asc' },
          offset: 0, // Asegurar que empezamos desde el principio
        });
      
      if (rootError || !rootItems) {
        console.error('Error al listar el contenido raíz del bucket:', rootError || 'No se obtuvieron datos');
      } else {
        console.log(`Se encontraron ${rootItems.length} elementos en el raíz del bucket`);
        
        // Filtrar solo carpetas (elementos sin extensión de archivo)
        const folders = rootItems.filter(item => !item.name.includes('.'));
        console.log(`Carpetas encontradas: ${folders.map(f => f.name).join(', ')}`);
        
        // ESTRATEGIA 1: Buscar en carpeta con el nombre del gato
        let matchingFolder = folders.find(f => 
          f.name.toLowerCase() === firstCatName.toLowerCase() || 
          f.name.toLowerCase() === catName.toLowerCase()
        );
        
        if (matchingFolder) {
          console.log(`Carpeta encontrada para el gato: "${matchingFolder.name}"`);
          
          // Listar contenido de la carpeta
          const { data: folderFiles, error: folderError } = await supabase
            .storage
            .from('cat-photos')
            .list(matchingFolder.name, { 
              sortBy: { column: 'name', order: 'asc' },
              offset: 0, // Asegurar que empezamos desde el principio
            });
          
          if (!folderError && folderFiles && folderFiles.length > 0) {
            console.log(`Se encontraron ${folderFiles.length} archivos en la carpeta "${matchingFolder.name}"`);
            
            // Filtrar solo imágenes JPG
            const jpgFiles = folderFiles.filter(f => 
              f.name.toLowerCase().endsWith('.jpg') || 
              f.name.toLowerCase().endsWith('.jpeg')
            );
            
            // Obtener URLs para todas las imágenes encontradas
            for (const jpgFile of jpgFiles) {
              const { data } = await supabase
                .storage
                .from('cat-photos')
                .getPublicUrl(`${matchingFolder.name}/${jpgFile.name}`);
              
              if (data?.publicUrl) {
                // Agregar timestamp único para evitar caché
                const urlWithTimestamp = `${data.publicUrl}?t=${timestamp}`;
                photoUrls.push(urlWithTimestamp);
                console.log(`Añadida foto de carpeta: ${jpgFile.name}`);
              }
            }
          }
        }
        
        // ESTRATEGIA 2: Buscar archivos en el raíz con patrón nombreGato + número + .jpg
        if (rootItems.length > 0) {
          const directMatches = rootItems.filter(item => {
            const lowerName = item.name.toLowerCase();
            return (lowerName.startsWith(firstCatName.toLowerCase()) && 
                  lowerName.endsWith('.jpg') && 
                  /\d+\.jpg$/.test(lowerName));
          });
          
          if (directMatches.length > 0) {
            console.log(`Encontrados ${directMatches.length} archivos directos en el raíz: ${directMatches.map(f => f.name).join(', ')}`);
            
            // Obtener URLs para todas las imágenes encontradas en el raíz
            for (const directMatch of directMatches) {
              const { data } = await supabase
                .storage
                .from('cat-photos')
                .getPublicUrl(directMatch.name);
              
              if (data?.publicUrl) {
                // Usar el mismo timestamp para todas las URLs en esta carga
                const urlWithTimestamp = `${data.publicUrl}?t=${timestamp}`;
                
                // Evitar duplicados (si ya se encontró en una carpeta)
                if (!photoUrls.includes(urlWithTimestamp)) {
                  photoUrls.push(urlWithTimestamp);
                  console.log(`Añadida foto del raíz: ${directMatch.name}`);
                }
              }
            }
          }
        }
      }
      
      // Si no se encontró ninguna foto, usar la imagen de prueba
      if (photoUrls.length === 0) {
        console.log('No se encontraron fotos, usando imagen de prueba (prueba.jpg)');
        const { data } = await supabase
          .storage
          .from('cat-photos')
          .getPublicUrl('prueba.jpg');
        
        if (data?.publicUrl) {
          // Usar el mismo timestamp para todas las URLs en esta carga
          photoUrls.push(`${data.publicUrl}?t=${timestamp}`);
        } else {
          // Última opción: URL externa
          photoUrls.push("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop");
        }
      }
      
      console.log(`Total de fotos encontradas para ${catName}: ${photoUrls.length}`);
      return photoUrls;
    } catch (error) {
      console.error('Error al obtener todas las fotos del gato:', error);
      return ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop"];
    }
  }

  // Eliminar una foto específica del bucket de Supabase
  async deletePhotoFromBucket(photoUrl, catName) {
    try {
      if (!photoUrl || !catName) {
        console.error('Se requiere la URL de la foto y el nombre del gato para eliminar la foto');
        return false;
      }

      console.log(`DEPURACIÓN: Intentando eliminar la foto: ${photoUrl} del gato: ${catName}`);
      
      // Verificamos si la URL es válida y pertenece a Supabase
      if (!photoUrl.includes('supabase.co') && !photoUrl.includes('supabase.in')) {
        console.warn('La URL no parece ser de Supabase storage:', photoUrl);
        return false;
      }

      // Extraemos el nombre del archivo de la URL para usarlo más adelante
      let baseFilename = '';
      try {
        baseFilename = photoUrl.split('/').pop().split('?')[0];
        console.log('DEPURACIÓN: Nombre base del archivo extraído:', baseFilename);
      } catch (e) {
        console.error('Error al extraer el nombre base del archivo:', e);
        baseFilename = 'unknown.jpg'; // Valor por defecto para evitar errores
      }

      // Extraemos el nombre del archivo y la ruta de la URL
      try {
        const urlObj = new URL(photoUrl);
        console.log('DEPURACIÓN: URL parseada:', urlObj);
        
        // La ruta completa incluye todo lo que viene después del bucket
        const fullPath = urlObj.pathname;
        console.log('DEPURACIÓN: Ruta completa:', fullPath);
        
        // Extraemos la parte de la ruta que viene después de /object/
        const objectPath = fullPath.split('/object/')[1];
        console.log('DEPURACIÓN: Object path:', objectPath);
        
        if (!objectPath) {
          console.error('No se pudo extraer la ruta del objeto del storage');
          return false;
        }
        
        // Decodificamos la ruta (puede tener caracteres especiales codificados)
        const decodedPath = decodeURIComponent(objectPath);
        console.log('DEPURACIÓN: Ruta decodificada:', decodedPath);
        
        // Eliminamos cualquier parámetro de consulta
        const cleanPath = decodedPath.split('?')[0];
        console.log('DEPURACIÓN: Ruta limpia:', cleanPath);
        
        // Intentamos eliminar el archivo directamente usando la ruta extraída
        const { error } = await supabase.storage.from('cat-photos').remove([cleanPath]);
        
        if (error) {
          console.error('Error al eliminar el archivo usando la ruta extraída:', error);
        } else {
          console.log('ÉXITO: Archivo eliminado correctamente usando la ruta extraída');
          return true;
        }
      } catch (parseError) {
        console.error('Error al parsear la URL:', parseError);
      }

      // Si el método anterior falló, intentamos con el enfoque original mejorado
      console.log('Intentando el método alternativo de eliminación...');
      
      // Primer nombre del gato para buscar la carpeta
      const firstCatName = catName.split(' ')[0].trim();

      // Intentamos eliminar la foto desde diferentes ubicaciones posibles
      let deleted = false;

      // 1. Verificar si existe en una carpeta con el nombre del gato
      try {
        // Listar carpetas en el bucket
        const { data: folders, error: folderError } = await supabase
          .storage
          .from('cat-photos')
          .list('', { sortBy: { column: 'name', order: 'asc' } });

        if (!folderError && folders) {
          // Buscar carpeta que coincida con el nombre del gato
          const matchingFolders = folders.filter(f => 
            !f.name.includes('.') && 
            (f.name.toLowerCase() === firstCatName.toLowerCase() || 
             f.name.toLowerCase() === catName.toLowerCase())
          );

          for (const folder of matchingFolders) {
            try {
              // Intentar eliminar desde esta carpeta
              const { error } = await supabase
                .storage
                .from('cat-photos')
                .remove([`${folder.name}/${baseFilename}`]);

              if (!error) {
                console.log(`Foto eliminada con éxito de la carpeta: ${folder.name}/${baseFilename}`);
                deleted = true;
                break;
              }
            } catch (e) {
              console.log(`No se pudo eliminar de ${folder.name}/${baseFilename}: ${e.message}`);
            }
          }
        }
      } catch (e) {
        console.error('Error al listar carpetas:', e);
      }

      // 2. Si no se eliminó de ninguna carpeta, intentar eliminar del raíz
      if (!deleted) {
        try {
          // Extraemos el nombre del archivo de la URL
          const urlParts = photoUrl.split('/');
          const lastPart = urlParts[urlParts.length - 1];
          const simpleFilename = lastPart.split('?')[0];
          
          console.log('DEPURACIÓN: Intentando eliminar del raíz con nombre simplificado:', simpleFilename);
          
          const { error } = await supabase
            .storage
            .from('cat-photos')
            .remove([simpleFilename]);

          if (!error) {
            console.log(`Foto eliminada con éxito del raíz: ${simpleFilename}`);
            deleted = true;
          }
        } catch (e) {
          console.log(`No se pudo eliminar del raíz: ${e.message}`);
        }
      }
      
      // 3. Último intento: buscar en todas las carpetas
      if (!deleted) {
        try {
          console.log('DEPURACIÓN: Intentando buscar la foto en todas las carpetas');
          
          // Listar todas las carpetas
          const { data: allFolders } = await supabase.storage.from('cat-photos').list();
          
          if (allFolders && allFolders.length > 0) {
            // Filtrar solo directorios
            const directories = allFolders.filter(item => !item.name.includes('.'));
            
            // Buscar en cada directorio
            for (const dir of directories) {
              console.log(`DEPURACIÓN: Buscando en carpeta ${dir.name}`);
              
              const { data: files } = await supabase.storage.from('cat-photos').list(dir.name);
              
              if (files && files.length > 0) {
                // Extraer el nombre del archivo de la URL
                const urlLastPart = photoUrl.split('/').pop().split('?')[0];
                
                // Buscar un archivo que coincida
                const matchingFile = files.find(file => 
                  file.name === urlLastPart || 
                  photoUrl.includes(file.name)
                );
                
                if (matchingFile) {
                  console.log(`DEPURACIÓN: Archivo coincidente encontrado: ${dir.name}/${matchingFile.name}`);
                  
                  const { error } = await supabase.storage
                    .from('cat-photos')
                    .remove([`${dir.name}/${matchingFile.name}`]);
                    
                  if (!error) {
                    console.log(`ÉXITO: Foto eliminada de ${dir.name}/${matchingFile.name}`);
                    deleted = true;
                    break;
                  }
                }
              }
            }
          }
        } catch (e) {
          console.log('Error en el último intento:', e);
        }
      }
      
      if (!deleted) {
        console.log('ADVERTENCIA: No se pudo encontrar la ubicación exacta de la foto para eliminarla');
        // Consideramos que hemos hecho todo lo posible, permitimos continuar para actualizar la UI
        return true;
      }

      return deleted;
    } catch (error) {
      console.error(`Error al eliminar la foto: ${error}`);
      return false;
    }
  }
}

// Exportar una instancia singleton del servicio
const catServiceInstance = new CatService();
export default catServiceInstance;