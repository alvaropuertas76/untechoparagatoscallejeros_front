# Implementación de Login con Supabase

Este documento describe la implementación completa del sistema de login para la aplicación "Un Techo para Gatos Callejeros" utilizando Supabase como backend.

## Arquitectura del Sistema de Login

### 1. Cliente de Supabase
- **Archivo**: `src/services/supabaseClient.js`
- **Función**: Configura la conexión con Supabase usando las credenciales correctas
- **Mejoras realizadas**:
  - Detección automática del entorno (browser vs. Node.js)
  - Manejo robusto de las variables de entorno

### 2. Row Level Security (RLS)
- **Archivo**: `src/database/configurar_rls_manual.sql`
- **Función**: Configura las políticas de seguridad para permitir el acceso a la tabla "user"
- **Políticas implementadas**:
  - Acceso de lectura para usuarios anónimos (para el login)
  - Acceso completo para usuarios autenticados con rol de administrador

### 3. Servicio de Usuario
- **Archivo**: `src/services/userService.js`
- **Función**: Proporciona métodos para interactuar con los usuarios en Supabase
- **Métodos principales**:
  - `login(username, password)`: Verifica las credenciales y devuelve los datos del usuario
  - `getUsers()`: Obtiene todos los usuarios (para administradores)
  - `createUser(userData)`: Crea un nuevo usuario
  - `updateUser(id, userData)`: Actualiza un usuario existente
  - `deleteUser(id)`: Elimina un usuario

### 4. Contexto de Autenticación
- **Archivo**: `src/context/AuthContext.jsx`
- **Función**: Proporciona el estado global de autenticación para toda la aplicación
- **Características**:
  - Gestión del estado de autenticación (isAuthenticated, user, loading, error)
  - Persistencia de la sesión a través de sessionStorage
  - Carga de permisos basados en el rol del usuario

### 5. Componente de Login
- **Archivo**: `src/components/Login.jsx`
- **Función**: Interfaz de usuario para iniciar sesión
- **Características**:
  - Formulario para introducir username y password
  - Manejo de estados de carga y errores
  - Redirección al Dashboard tras el login exitoso

### 6. Scripts de Prueba y Utilidades
- **Archivos**: 
  - `src/components/TestLoginComponent.jsx`: Componente para probar el login
  - `src/database/consultarUsuario.js`: Script para consultar un usuario específico
  - `src/database/listarUsuarios.js`: Script para listar todos los usuarios

## Paso a paso para configurar el login

1. **Crear la tabla 'user' en Supabase**
   - Ejecutar el script: `npm run supabase:direct-sql`

2. **Configurar Row Level Security (RLS) para la tabla 'user'**
   - Ejecutar en SQL Editor de Supabase: `configurar_rls_manual.sql`

3. **Verificar la existencia de usuarios**
   - Ejecutar: `npm run supabase:listar-usuarios`

4. **Crear usuario de prueba si es necesario**
   - Ejecutar: `npm run supabase:crear-usuario-elena`

5. **Probar el login**
   - Acceder a: `/test-login` en la aplicación
   - O ejecutar: `npm run supabase:consultar-usuario`

## Solución a Problemas Comunes

### Error "process is not defined"
- **Causa**: Intentar acceder a `process.env` en un entorno de navegador
- **Solución**: Usar detección de entorno como se implementó en `supabaseClient.js`

### Error "Row Level Security Policy"
- **Causa**: RLS bloquea el acceso a la tabla "user"
- **Solución**: Configurar políticas RLS como se describe en `configurar_rls_manual.sql`

### Error "Credenciales incorrectas"
- **Causa**: El usuario o contraseña no existen en la tabla "user"
- **Solución**: Verificar que el usuario existe con `supabase:listar-usuarios`
