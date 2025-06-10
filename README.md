# Un Techo Para Gatos Callejeros - Aplicación de Gestión

Aplicación web para la gestión de gatos de la Asociación Protectora de Mallorca. Esta herramienta permite administrar la información de los gatos rescatados, incluyendo su estado, características y seguimiento.

## Estructura del Proyecto

```
├── public/               # Archivos estáticos
│   ├── assets/           # Recursos públicos
│   │   └── images/       # Imágenes
│   └── data/             # Datos JSON
├── src/                  # Código fuente
│   ├── components/       # Componentes React
│   │   ├── CatCard.jsx   # Tarjeta individual de gato
│   │   ├── CatDetail.jsx # Vista detallada de un gato
│   │   ├── CatForm.jsx   # Formulario para crear/editar gatos
│   │   ├── CatList.jsx   # Lista de gatos
│   │   ├── Dashboard.jsx # Panel principal de la aplicación
│   │   ├── Login.jsx     # Pantalla de inicio de sesión
│   │   ├── PhotoManager.jsx # Gestor de fotos
│   │   └── SearchFilters.jsx # Filtros de búsqueda
│   ├── context/          # Contextos de React
│   │   ├── AuthContext.jsx # Contexto de autenticación
│   │   └── CatContext.jsx  # Contexto de datos de gatos
│   ├── services/         # Servicios
│   │   ├── catService.js # Servicio de API para gatos
│   │   └── mockData.js   # Datos de ejemplo
│   ├── utils/            # Utilidades
│   │   └── constants.js  # Constantes y funciones auxiliares
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Punto de entrada
│   └── index.css         # Estilos globales (Tailwind)
├── index.html            # Plantilla HTML
├── vite.config.js        # Configuración de Vite
├── tailwind.config.js    # Configuración de Tailwind
├── postcss.config.js     # Configuración de PostCSS
└── eslint.config.js      # Configuración de ESLint
```

## Características

- **Gestión completa de gatos:** crear, ver, editar y marcar como fallecidos
- **Información detallada:** datos básicos, estado de salud, carácter y compatibilidad
- **Gestión de fotografías:** subir, ordenar y eliminar fotos
- **Filtros de búsqueda:** buscar por nombre, sexo, estado, etc.
- **Interfaz responsive:** diseñada para funcionar en dispositivos móviles y desktop

## Modelo de Datos

Cada gato tiene la siguiente información:

- **Datos básicos:** nombre, fecha de nacimiento, sexo, lugar de recogida, año de llegada
- **Estado de salud:** testado, castrado
- **Compatibilidad:** apto para familias, compatible con niños, necesita casa tranquila
- **Entorno:** gato de interior o exterior

## Scripts Disponibles
- `npm install` - Instalar dependencias
- `npm run dev` - Iniciar servidor de desarrollo
- `npm run lint` - Ejecutar linter en archivos fuente

### Solución de problemas

Si encuentras el error "vite no se reconoce como un comando interno o externo", sigue estos pasos:

1. Asegúrate de que Node.js esté instalado correctamente
2. Ejecuta `npm install` para instalar todas las dependencias
3. Si hay restricciones de ejecución de scripts en PowerShell, puedes usar:
   ```
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
   O ejecutar el símbolo del sistema (CMD) en lugar de PowerShell

## Tecnologías Utilizadas

- React
- Vite
- TailwindCSS
- ESLint
- JavaScript
