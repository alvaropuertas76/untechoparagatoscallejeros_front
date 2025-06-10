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
│   │   ├── TestLoginComponent.jsx # Componente para probar login
│   │   ├── PhotoManager.jsx # Gestor de fotos
│   │   └── SearchFilters.jsx # Filtros de búsqueda
│   ├── context/          # Contextos de React
│   │   ├── AuthContext.jsx # Contexto de autenticación
│   │   ├── CatContext.jsx  # Contexto de datos de gatos
│   │   └── LanguageContext.jsx # Contexto de idioma
│   ├── database/         # Scripts de base de datos para Supabase
│   │   ├── configurar_rls_manual.sql # Políticas RLS para Supabase
│   │   ├── configurarRLS.js # Script para configurar RLS
│   │   ├── consultarUsuario.js # Script para consultar usuario específico
│   │   ├── listarUsuarios.js # Script para listar usuarios
│   │   └── crearUsuarioElena.js # Script para crear usuario de prueba
│   ├── services/         # Servicios
│   │   ├── catService.js # Servicio de API para gatos
│   │   ├── supabaseClient.js # Cliente de conexión a Supabase
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

La aplicación utiliza Supabase (PostgreSQL en la nube) con las siguientes tablas principales:

### Tabla `user`
Almacena la información de los usuarios de la aplicación:
- **id**: Identificador único del usuario
- **username**: Nombre de usuario para iniciar sesión
- **password**: Contraseña del usuario
- **nombre**: Nombre real del usuario
- **apellidos**: Apellidos del usuario
- **rol**: Rol del usuario (admin, voluntario, adopcion, veterinario)
- **email**: Correo electrónico del usuario


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



## API REST

La aplicación incluye servicios que utilizan el cliente de Supabase para proporcionar los siguientes endpoints:

### Autenticación
- Login con nombre de usuario y contraseña a través de Supabase

### Usuarios
- Obtener lista de usuarios (requiere autenticación)
- Crear, actualizar y eliminar usuarios (requiere rol de administrador)

### Gatos
- Obtener lista de gatos con filtros opcionales (nombre, sexo, adoptado, lugarRecogida)
- Obtener detalles de un gato específico
- Crear un nuevo gato
- Actualizar información de un gato existente
- Marcar un gato como fallecido (no elimina el registro)

Los servicios utilizan Supabase para garantizar la integridad de los datos y el control de acceso mediante políticas de Row Level Security (RLS).

## Configuración de Supabase

Para configurar la conexión con Supabase, se necesitan los siguientes pasos:

1. **Crear una cuenta y proyecto en Supabase**
   - Registrarse en [Supabase](https://supabase.com/)
   - Crear un nuevo proyecto
   - Obtener la URL y la API Key del proyecto

2. **Configurar variables de entorno**
   - Crear un archivo `.env` en la raíz del proyecto con:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_KEY=tu-api-key
   ```

3. **Configurar Row Level Security (RLS)**
   - Ejecutar el script: `npm run supabase:configurar-rls`
   - O seguir las instrucciones en `SUPABASE_LOGIN.md`

4. **Verificar la configuración**
   - Ejecutar: `npm run supabase:test-connection`
   - Comprobar que se puede acceder a los datos con: `npm run supabase:listar-usuarios`

Para instrucciones más detalladas, consulte:
- `SUPABASE_INTEGRATION.md` - Guía completa de integración
- `SUPABASE_LOGIN.md` - Implementación del sistema de login
- `GUIA_EXEC_SQL.md` - Configuración de funciones SQL personalizadas

## Scripts Disponibles
- `npm install` - Instalar dependencias
- `npm run dev` - Iniciar servidor de desarrollo frontend
- `npm run build` - Construir la aplicación para producción
- `npm run lint` - Ejecutar linter en archivos fuente

### Scripts de Supabase
- `npm run supabase:create-tables` - Crear tablas en Supabase
- `npm run supabase:direct-sql` - Ejecutar SQL directo en Supabase
- `npm run supabase:configurar-rls` - Configurar políticas RLS
- `npm run supabase:listar-usuarios` - Listar todos los usuarios
- `npm run supabase:consultar-usuario` - Consultar usuario específico
- `npm run supabase:crear-usuario-elena` - Crear usuario de prueba
- `npm run supabase:test-login` - Probar login con Supabase
- `npm run supabase:upload-users` - Cargar usuarios a Supabase

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
- Supabase (PostgreSQL en la nube)
- Context API para gestión de estado
- ESLint
- JavaScript
