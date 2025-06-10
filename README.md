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
│   │   ├── LanguageSelector.jsx # Selector de idioma con banderas
│   │   ├── Login.jsx     # Pantalla de inicio de sesión
│   │   ├── PhotoManager.jsx # Gestor de fotos
│   │   └── SearchFilters.jsx # Filtros de búsqueda
│   ├── context/          # Contextos de React
│   │   ├── AuthContext.jsx # Contexto de autenticación
│   │   ├── CatContext.jsx  # Contexto de datos de gatos
│   │   └── LanguageContext.jsx # Contexto de idioma
│   ├── database/         # Configuración y scripts de base de datos
│   │   ├── db.js         # Configuración de conexión a PostgreSQL
│   │   ├── schema.sql    # Definición del esquema de la base de datos
│   │   └── seed.sql      # Datos iniciales para la base de datos
│   ├── services/         # Servicios
│   │   ├── catService.js # Servicio de API para gatos
│   │   └── userService.js # Servicio de API para usuarios
│   ├── translations/     # Archivos de traducción
│   │   ├── es.js         # Traducciones en español
│   │   ├── en.js         # Traducciones en inglés
│   │   └── de.js         # Traducciones en alemán
│   ├── utils/            # Utilidades
│   │   ├── constants.js  # Constantes y funciones auxiliares
│   │   └── flagIcons.js  # Iconos de banderas en base64
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Punto de entrada
│   ├── server.js         # Servidor Express para la API
│   └── index.css         # Estilos globales (Tailwind)
├── index.html            # Plantilla HTML
├── vite.config.js        # Configuración de Vite
├── tailwind.config.js    # Configuración de Tailwind
├── postcss.config.js     # Configuración de PostCSS
├── eslint.config.js      # Configuración de ESLint
├── .env                  # Variables de entorno (no comiteado)
└── DATABASE_SETUP.md     # Documentación de configuración de la base de datos
```

## Características

- **Gestión completa de gatos:** crear, ver, editar y marcar como fallecidos
- **Información detallada:** datos básicos, estado de salud, carácter y compatibilidad
- **Gestión de fotografías:** subir, ordenar y eliminar fotos
- **Filtros de búsqueda:** buscar por nombre, sexo, estado, etc.
- **Interfaz responsive:** diseñada para funcionar en dispositivos móviles y desktop
- **Multiidioma:** soporte para español, inglés y alemán con selector de banderas
- **Sistema de usuarios:** múltiples usuarios con diferentes roles y permisos

## Modelo de Datos

La aplicación utiliza una base de datos PostgreSQL con las siguientes tablas principales:

### Tabla `users`
Almacena la información de los usuarios de la aplicación:
- **id**: Identificador único del usuario
- **username**: Nombre de usuario para iniciar sesión
- **password**: Contraseña del usuario
- **nombre**: Nombre real del usuario
- **apellidos**: Apellidos del usuario
- **rol**: Rol del usuario (admin, voluntario, adopcion, veterinario)
- **email**: Correo electrónico del usuario
- **created_at**: Fecha de creación del registro
- **updated_at**: Fecha de última actualización

### Tabla `cats`
Almacena la información principal de cada gato:
- **id**: Identificador único del gato
- **nombre**: Nombre del gato
- **fecha_nacimiento**: Fecha aproximada de nacimiento
- **lugar_recogida**: Lugar donde fue recogido el gato
- **testado**: Indica si el gato ha sido testado (FIV/FELV)
- **castrado**: Indica si el gato está castrado/esterilizado
- **sexo**: Sexo del gato (false = hembra, true = macho)
- **caracter**: Descripción del carácter del gato
- **gato_aire_libre**: Indica si es apto para vivir al aire libre
- **gato_interior**: Indica si es apto para vivir en interior
- **familia**: Indica si es apto para familias
- **compatible_ninos**: Indica si es compatible con niños
- **casa_tranquila**: Indica si necesita una casa tranquila
- **historia**: Historia del gato
- **apadrinado**: Indica si está apadrinado
- **adoptado**: Indica si está adoptado
- **desaparecido**: Indica si está desaparecido
- **fecha_fallecido**: Fecha de fallecimiento (si aplica)
- **ano_llegada**: Año de llegada a la asociación
- **notas_salud**: Notas sobre la salud del gato
- **created_at**: Fecha de creación del registro
- **updated_at**: Fecha de última actualización

### Tabla `cat_photos`
Almacena las fotos asociadas a cada gato:
- **id**: Identificador único de la foto
- **cat_id**: ID del gato al que pertenece la foto
- **url**: URL de la foto
- **es_principal**: Indica si es la foto principal del gato
- **created_at**: Fecha de creación del registro

## API REST

La aplicación incluye un servidor API basado en Express que proporciona los siguientes endpoints:

### Autenticación
- `POST /api/login` - Iniciar sesión con nombre de usuario y contraseña

### Usuarios
- `GET /api/users` - Obtener lista de usuarios (requiere autenticación)

### Gatos
- `GET /api/cats` - Obtener lista de gatos con filtros opcionales (nombre, sexo, adoptado, lugarRecogida)
- `GET /api/cats/:id` - Obtener detalles de un gato específico
- `POST /api/cats` - Crear un nuevo gato
- `PUT /api/cats/:id` - Actualizar información de un gato existente
- `DELETE /api/cats/:id` - Marcar un gato como fallecido (no elimina el registro)

La API utiliza transacciones para operaciones complejas como la creación o actualización de gatos que incluyen gestión de fotos, garantizando la integridad de los datos.

## Configuración de la Base de Datos

Para configurar la base de datos PostgreSQL, consulte el archivo `DATABASE_SETUP.md` que contiene instrucciones detalladas sobre:

1. Instalación de PostgreSQL
2. Creación de la base de datos
3. Configuración de variables de entorno
4. Ejecución de scripts de creación de tablas e inserción de datos iniciales
5. Verificación de la instalación
6. Solución de problemas comunes

## Integración con Supabase

La aplicación ahora está integrada con Supabase, una plataforma de base de datos PostgreSQL en la nube. Esta integración proporciona:

- Base de datos PostgreSQL gestionada en la nube
- Acceso a los datos desde cualquier lugar
- Potencial para utilizar características adicionales como autenticación, almacenamiento y funciones en tiempo real

Para más detalles sobre la integración con Supabase, consulte el archivo `SUPABASE_INTEGRATION.md`.

## Scripts Disponibles
- `npm install` - Instalar dependencias
- `npm run dev` - Iniciar servidor de desarrollo frontend
- `npm run server` - Iniciar servidor API
- `npm run dev:full` - Iniciar simultáneamente el servidor frontend y la API
- `npm run db:setup` - Configurar y poblar la base de datos local
- `npm run supabase:upload-users` - Cargar usuarios a Supabase
- `npm run build` - Construir la aplicación para producción
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
- PostgreSQL (Supabase)
- Express
- Node.js
- ESLint
- JavaScript
- Supabase (Base de datos en la nube)
