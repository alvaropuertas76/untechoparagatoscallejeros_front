// Mock data service para simular una base de datos de gatos
export const mockCats = [
  {
    id: 1,
    nombre: "Luna",
    fechaNacimiento: "2020-05-15",
    lugarRecogida: "Palma de Mallorca",
    testado: true,
    castrado: true,
    sexo: false, // false = hembra
    caracter: "Gata muy cariñosa y tranquila. Le encanta estar en el regazo y ronronea constantemente. Es muy sociable con otros gatos.",
    gatoAireLibre: false,
    gatoInterior: true,
    familia: true,
    compatibleNinos: true,
    casaTranquila: false,
    historia: "Luna fue encontrada en un parque de Palma cuando era muy pequeña. Llegó desnutrida pero se recuperó rápidamente. Ha demostrado ser una gata muy dulce y adaptable.",
    apadrinado: false,
    adoptado: false,
    desaparecido: false,
    fechaFallecido: null,
    anoLlegada: "2020-06-01",
    fotos: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 2,
    nombre: "Simba",
    fechaNacimiento: "2019-03-22",
    lugarRecogida: "Manacor",
    testado: true,
    castrado: true,
    sexo: true, // true = macho
    caracter: "Gato independiente pero muy juguetón. Le gusta explorar y es muy curioso. Puede ser un poco territorial al principio.",
    gatoAireLibre: true,
    gatoInterior: false,
    familia: false,
    compatibleNinos: false,
    casaTranquila: true,
    historia: "Simba vivía en las calles de Manacor durante varios años. Fue rescatado después de ser atropellado levemente. Se ha adaptado bien pero prefiere espacios tranquilos.",
    apadrinado: true,
    adoptado: false,
    desaparecido: false,
    fechaFallecido: null,
    anoLlegada: "2021-08-15",
    fotos: [
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 3,
    nombre: "Mimi",
    fechaNacimiento: "2021-12-10",
    lugarRecogida: "Alcúdia",
    testado: false,
    castrado: false,
    sexo: false,
    caracter: "Gatita muy joven y energética. Le encanta jugar y es muy sociable. Se lleva bien con otros gatos y perros pequeños.",
    gatoAireLibre: false,
    gatoInterior: true,
    familia: true,
    compatibleNinos: true,
    casaTranquila: false,
    historia: "Mimi fue abandonada siendo muy pequeña en una caja cerca de Alcúdia. Ha crecido en el refugio y está lista para encontrar su hogar definitivo.",
    apadrinado: false,
    adoptado: true,
    desaparecido: false,
    fechaFallecido: null,
    anoLlegada: "2022-01-05",
    fotos: [
      "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 4,
    nombre: "Garfield",
    fechaNacimiento: "2018-07-08",
    lugarRecogida: "Inca",
    testado: true,
    castrado: true,
    sexo: true,
    caracter: "Gato mayor muy tranquilo y sedentario. Perfecto para personas que buscan un compañero relajado. Le gusta dormir al sol.",
    gatoAireLibre: false,
    gatoInterior: true,
    familia: true,
    compatibleNinos: true,
    casaTranquila: true,
    historia: "Garfield perteneció a una familia durante años, pero tuvieron que entregarlo por problemas de salud. Es un gato muy bien educado y cariñoso.",
    apadrinado: true,
    adoptado: false,
    desaparecido: false,
    fechaFallecido: null,
    anoLlegada: "2023-02-20",
    fotos: [
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 5,
    nombre: "Nala",
    fechaNacimiento: "2020-11-30",
    lugarRecogida: "Sóller",
    testado: true,
    castrado: true,
    sexo: false,
    caracter: "Gata muy inteligente y observadora. Le gusta tener rutinas y puede ser selectiva con las personas, pero una vez que confía es muy leal.",
    gatoAireLibre: true,
    gatoInterior: true,
    familia: false,
    compatibleNinos: false,
    casaTranquila: true,
    historia: "Nala fue encontrada herida en una trampa para ratones en Sóller. Después de su recuperación ha mostrado ser una gata muy especial que necesita el hogar adecuado.",
    apadrinado: false,
    adoptado: false,
    desaparecido: false,
    fechaFallecido: null,
    anoLlegada: "2021-01-10",
    fotos: [
      "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1561948955-570b270e7c36?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 6,
    nombre: "Whiskers",
    fechaNacimiento: "2019-09-14",
    lugarRecogida: "Pollença",
    testado: false,
    castrado: false,
    sexo: true,
    caracter: "Gato muy activo y aventurero. Necesita mucho estímulo y ejercicio. Es perfecto para personas activas que puedan darle la atención que necesita.",
    gatoAireLibre: true,
    gatoInterior: false,
    familia: true,
    compatibleNinos: true,
    casaTranquila: false,
    historia: "Whiskers fue rescatado de una colonia de gatos callejeros en Pollença. Aunque ha sido socializado, mantiene su instinto aventurero y necesita espacio para explorar.",
    apadrinado: false,
    adoptado: false,
    desaparecido: true,
    fechaFallecido: null,
    anoLlegada: "2020-10-05",
    fotos: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop"
    ]
  }
];

// Función para obtener el siguiente ID disponible
export const getNextId = () => {
  return Math.max(...mockCats.map(cat => cat.id)) + 1;
};

// Función para simular delay de red
export const simulateNetworkDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};