// Script para insertar los gatos del archivo JSON a Supabase
import supabase from '../services/supabaseClient.js';
import fs from 'fs';
import path from 'path';

// Leer el archivo JSON de gatos
const catsFilePath = path.join(process.cwd(), 'public', 'data', 'cats.json');
const catsData = JSON.parse(fs.readFileSync(catsFilePath, 'utf8'));

// Función para transformar los datos al formato de Supabase
function transformCatData(cat) {
  return {
    id: cat.id,
    nombre: cat.nombre,
    fecha_nacimiento: cat.fechaNacimiento,
    lugar_recogida: cat.lugarRecogida,
    testado: cat.testado || false,
    castrado: cat.castrado || false,
    sexo: cat.sexo !== undefined ? cat.sexo : true,
    caracter: cat.caracter || '',
    gato_aire_libre: cat.gatoAireLibre || false,
    gato_interior: cat.gatoInterior || false,
    familia: cat.familia || false,
    compatible_ninos: cat.compatibleNinos || false,
    casa_tranquila: cat.casaTranquila || false,
    historia: cat.historia || '',
    apadrinado: cat.apadrinado || false,
    adoptado: cat.adoptado || false,
    desaparecido: cat.desaparecido || false,
    fecha_fallecido: cat.fechaFallecido || null,
    ano_llegada: cat.anoLlegada,
    notas_salud: cat.notasSalud || '',
    created_at: new Date(),
    updated_at: new Date()
  };
}

// Función para transformar los datos de las fotos
function transformPhotosData(cat) {
  if (!cat.fotos || !Array.isArray(cat.fotos) || cat.fotos.length === 0) {
    return [];
  }
  
  return cat.fotos.map((foto, index) => ({
    cat_id: cat.id,
    url: foto,
    es_principal: index === 0,
    created_at: new Date()
  }));
}

// Función para insertar gatos en Supabase
async function insertCats() {
  const { cats } = catsData;
  
  console.log(`Intentando insertar ${cats.length} gatos...`);
  
  // Insertar cada gato
  for (const cat of cats) {
    // Transformar los datos
    const supabaseCat = transformCatData(cat);
    
    // Insertar el gato
    const { error } = await supabase
      .from('cats')
      .upsert(supabaseCat, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error al insertar gato ${cat.nombre}:`, error);
      continue;
    } else {
      console.log(`Gato ${cat.nombre} insertado correctamente`);
    }
    
    // Insertar fotos
    const photos = transformPhotosData(cat);
    if (photos.length > 0) {
      const { error: photoError } = await supabase
        .from('cat_photos')
        .upsert(photos, { onConflict: 'cat_id,url' });
      
      if (photoError) {
        console.error(`Error al insertar fotos para el gato ${cat.nombre}:`, photoError);
      } else {
        console.log(`${photos.length} fotos del gato ${cat.nombre} insertadas correctamente`);
      }
    }
  }
  
  console.log('Proceso de inserción de gatos completado');
}

// Ejecutar la función
insertCats()
  .catch(error => console.error('Error en el proceso:', error));
