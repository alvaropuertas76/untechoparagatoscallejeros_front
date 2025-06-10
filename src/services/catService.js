import { mockCats, getNextId, simulateNetworkDelay } from './mockData';

// Simulación de una API para operaciones CRUD de gatos
class CatService {
  constructor() {
    // En un entorno real, esto sería la URL base de la API
    this.baseUrl = '/api/cats';
    this.cats = [...mockCats]; // Copia de los datos mock
  }

  // Obtener todos los gatos
  async getAllCats() {
    await simulateNetworkDelay();
    return [...this.cats];
  }

  // Obtener un gato por ID
  async getCatById(id) {
    await simulateNetworkDelay();
    const cat = this.cats.find(cat => cat.id === parseInt(id));
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

    const newCat = {
      id: getNextId(),
      nombre: catData.nombre,
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
      fotos: catData.fotos || []
    };

    this.cats.push(newCat);
    return { ...newCat };
  }

  // Actualizar un gato existente
  async updateCat(id, catData) {
    await simulateNetworkDelay();
    
    const catIndex = this.cats.findIndex(cat => cat.id === parseInt(id));
    if (catIndex === -1) {
      throw new Error(`Gato con ID ${id} no encontrado`);
    }

    // Validar datos requeridos
    if (!catData.nombre || !catData.fechaNacimiento || !catData.lugarRecogida || !catData.anoLlegada) {
      throw new Error('Faltan campos obligatorios');
    }

    const updatedCat = {
      ...this.cats[catIndex],
      ...catData,
      id: parseInt(id) // Asegurar que el ID no cambie
    };

    this.cats[catIndex] = updatedCat;
    return { ...updatedCat };
  }

  // Eliminar un gato (borrado lógico - marcar como fallecido)
  async deleteCat(id) {
    await simulateNetworkDelay();
    
    const catIndex = this.cats.findIndex(cat => cat.id === parseInt(id));
    if (catIndex === -1) {
      throw new Error(`Gato con ID ${id} no encontrado`);
    }

    // Borrado lógico: establecer fecha de fallecimiento
    this.cats[catIndex].fechaFallecido = new Date().toISOString().split('T')[0];
    
    return { success: true, message: 'Gato marcado como fallecido' };
  }

  // Buscar gatos con filtros
  async searchCats(filters = {}) {
    await simulateNetworkDelay();
    
    let filteredCats = [...this.cats];

    // Excluir gatos fallecidos por defecto
    filteredCats = filteredCats.filter(cat => !cat.fechaFallecido);

    // Aplicar filtros
    if (filters.nombre) {
      filteredCats = filteredCats.filter(cat =>
        cat.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
      );
    }

    if (filters.sexo !== undefined && filters.sexo !== '') {
      filteredCats = filteredCats.filter(cat => cat.sexo === filters.sexo);
    }

    if (filters.adoptado !== undefined && filters.adoptado !== '') {
      filteredCats = filteredCats.filter(cat => cat.adoptado === filters.adoptado);
    }

    if (filters.testado !== undefined && filters.testado !== '') {
      filteredCats = filteredCats.filter(cat => cat.testado === filters.testado);
    }

    if (filters.castrado !== undefined && filters.castrado !== '') {
      filteredCats = filteredCats.filter(cat => cat.castrado === filters.castrado);
    }

    if (filters.apadrinado !== undefined && filters.apadrinado !== '') {
      filteredCats = filteredCats.filter(cat => cat.apadrinado === filters.apadrinado);
    }

    if (filters.lugarRecogida) {
      filteredCats = filteredCats.filter(cat =>
        cat.lugarRecogida.toLowerCase().includes(filters.lugarRecogida.toLowerCase())
      );
    }

    if (filters.desaparecido !== undefined && filters.desaparecido !== '') {
      filteredCats = filteredCats.filter(cat => cat.desaparecido === filters.desaparecido);
    }

    return filteredCats;
  }

  // Obtener estadísticas de gatos
  async getStats() {
    await simulateNetworkDelay();
    
    const total = this.cats.length;
    const adoptados = this.cats.filter(cat => cat.adoptado).length;
    const apadrinados = this.cats.filter(cat => cat.apadrinado).length;
    const disponibles = this.cats.filter(cat => !cat.adoptado && !cat.fechaFallecido && !cat.desaparecido).length;
    const fallecidos = this.cats.filter(cat => cat.fechaFallecido).length;
    const desaparecidos = this.cats.filter(cat => cat.desaparecido).length;
    const sinTestar = this.cats.filter(cat => !cat.testado && !cat.fechaFallecido).length;
    const sinCastrar = this.cats.filter(cat => !cat.castrado && !cat.fechaFallecido).length;

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

  // Restablecer datos mock (útil para testing)
  async resetData() {
    await simulateNetworkDelay();
    this.cats = [...mockCats];
    return { success: true, message: 'Datos restablecidos' };
  }
}

// Exportar una instancia singleton del servicio
export const catService = new CatService();

// Exportar la clase para testing si es necesario
export { CatService };