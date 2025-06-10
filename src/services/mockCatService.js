// Servicio de gatos que utiliza datos mockeados en lugar de Supabase
import { mockCats, getNextId, simulateNetworkDelay } from './mockData';

// Implementación del servicio con datos mockeados
class MockCatService {
  // Obtener todos los gatos
  async getAllCats() {
    // Simular un pequeño delay de red para que sea más realista
    await simulateNetworkDelay();
    return [...mockCats];
  }

  // Obtener un gato por ID
  async getCatById(id) {
    await simulateNetworkDelay();
    const cat = mockCats.find(cat => cat.id === parseInt(id));
    if (!cat) {
      throw new Error(`Gato con ID ${id} no encontrado`);
    }
    return { ...cat };
  }

  // Crear un nuevo gato
  async createCat(catData) {
    await simulateNetworkDelay();
    
    // Validar datos requeridos
    if (!catData.nombre || !catData.fechaNacimiento || !catData.lugarRecogida || !catData.anoLlegada) {
      throw new Error('Faltan campos obligatorios');
    }

    // Crear nuevo gato con ID único
    const newCat = {
      ...catData,
      id: getNextId(),
      fotos: catData.fotos || []
    };

    // Añadir a la lista de gatos mockeados (solo en memoria)
    mockCats.push(newCat);
    
    return { ...newCat };
  }

  // Actualizar un gato existente
  async updateCat(id, catData) {
    await simulateNetworkDelay();
    
    // Validar datos requeridos
    if (!catData.nombre || !catData.fechaNacimiento || !catData.lugarRecogida || !catData.anoLlegada) {
      throw new Error('Faltan campos obligatorios');
    }

    // Encontrar el índice del gato a actualizar
    const index = mockCats.findIndex(cat => cat.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Gato con ID ${id} no encontrado`);
    }

    // Actualizar el gato
    const updatedCat = {
      ...mockCats[index],
      ...catData,
      id: parseInt(id) // Asegurar que el ID no cambie
    };

    mockCats[index] = updatedCat;
    
    return { ...updatedCat };
  }

  // Eliminar un gato (solo marcar como fallecido en el caso de esta app)
  async deleteCat(id) {
    await simulateNetworkDelay();
    
    // Encontrar el índice del gato
    const index = mockCats.findIndex(cat => cat.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Gato con ID ${id} no encontrado`);
    }

    // En lugar de eliminar, establecer la fecha de fallecimiento
    const today = new Date().toISOString().split('T')[0];
    mockCats[index] = {
      ...mockCats[index],
      fechaFallecido: today
    };
    
    return { message: 'Gato marcado como fallecido correctamente' };
  }

  // Buscar gatos con filtros
  async searchCats(filters = {}) {
    await simulateNetworkDelay();
    
    // Aplicar filtros localmente
    let result = [...mockCats];

    // Filtrar por nombre
    if (filters.nombre) {
      result = result.filter(cat => 
        cat.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
      );
    }
    
    // Filtrar por sexo
    if (filters.sexo !== undefined && filters.sexo !== '') {
      const sexoValue = filters.sexo === 'true' || filters.sexo === true;
      result = result.filter(cat => cat.sexo === sexoValue);
    }
    
    // Filtrar por estado de adopción
    if (filters.adoptado !== undefined && filters.adoptado !== '') {
      const adoptadoValue = filters.adoptado === 'true' || filters.adoptado === true;
      result = result.filter(cat => cat.adoptado === adoptadoValue);
    }
    
    // Filtrar por lugar de recogida
    if (filters.lugarRecogida) {
      result = result.filter(cat => 
        cat.lugarRecogida.toLowerCase().includes(filters.lugarRecogida.toLowerCase())
      );
    }
    
    return result;
  }

  // Obtener estadísticas de gatos
  async getStats() {
    await simulateNetworkDelay();
    
    const total = mockCats.length;
    const adoptados = mockCats.filter(cat => cat.adoptado).length;
    const apadrinados = mockCats.filter(cat => cat.apadrinado).length;
    const disponibles = mockCats.filter(cat => !cat.adoptado && !cat.fechaFallecido && !cat.desaparecido).length;
    const fallecidos = mockCats.filter(cat => cat.fechaFallecido).length;
    const desaparecidos = mockCats.filter(cat => cat.desaparecido).length;
    const sinTestar = mockCats.filter(cat => !cat.testado && !cat.fechaFallecido).length;
    const sinCastrar = mockCats.filter(cat => !cat.castrado && !cat.fechaFallecido).length;

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
  }
}

// Exportar una instancia singleton del servicio
export const mockCatService = new MockCatService();
