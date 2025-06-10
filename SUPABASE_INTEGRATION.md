# Integración con Supabase para Un Techo Para Gatos Callejeros

Este documento proporciona instrucciones detalladas sobre la integración del proyecto "Un Techo Para Gatos Callejeros" con Supabase, una plataforma de base de datos PostgreSQL en la nube.

## ¿Qué es Supabase?

Supabase es una alternativa de código abierto a Firebase que proporciona:
- Base de datos PostgreSQL gestionada
- Autenticación y autorización
- API generada automáticamente
- Almacenamiento de archivos
- Funciones en tiempo real
- Row Level Security (RLS)

## Configuración

### Requisitos Previos

1. Una cuenta en [Supabase](https://supabase.com/)
2. Un proyecto creado en Supabase
3. Node.js y npm instalados

### Variables de Entorno

Para conectarse a Supabase, la aplicación utiliza las siguientes variables de entorno:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_KEY=tu-api-key-anonima
```

Estas variables deben definirse en un archivo `.env` en la raíz del proyecto.

### Cliente de Supabase

El cliente de Supabase se configura en `src/services/supabaseClient.js`, que maneja:
- La conexión a la base de datos Supabase
- La detección del entorno (browser vs. Node.js)
- El manejo de las variables de entorno

```javascript
// Ejemplo de supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Detección del entorno
const isBrowser = typeof window !== 'undefined';

// Obtener variables de entorno según el entorno
const supabaseUrl = isBrowser 
  ? import.meta.env.VITE_SUPABASE_URL 
  : process.env.VITE_SUPABASE_URL;

const supabaseKey = isBrowser 
  ? import.meta.env.VITE_SUPABASE_KEY 
  : process.env.VITE_SUPABASE_KEY;

// Crear el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
```

## Modelo de Datos

### Tabla de Usuarios (`user`)

- `id`: ID único del usuario (clave primaria)
- `username`: Nombre de usuario (único)
- `password`: Contraseña
- `nombre`: Nombre del usuario
- `apellidos`: Apellidos del usuario
- `rol`: Rol del usuario (`admin`, `voluntario`, `adopcion`, `veterinario`)
- `email`: Correo electrónico (único)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

### Tabla de Gatos (`cats`)

- `id`: ID único del gato (clave primaria)
- `nombre`: Nombre del gato
- `fecha_nacimiento`: Fecha aproximada de nacimiento
- `lugar_recogida`: Lugar donde fue recogido
- `testado`: Si ha sido testado para FIV/FELV
- `castrado`: Si está castrado/esterilizado
- `sexo`: Sexo del gato (false = hembra, true = macho)
- `caracter`: Descripción del carácter
- `gato_aire_libre`: Si es apto para vivir al aire libre
- `gato_interior`: Si es apto para vivir en interior
- `familia`: Si es apto para familias
- `compatible_ninos`: Si es compatible con niños
- `casa_tranquila`: Si necesita una casa tranquila
- `historia`: Historia del gato
- `apadrinado`: Si está apadrinado
- `adoptado`: Si está adoptado
- `desaparecido`: Si está desaparecido
- `fecha_fallecido`: Fecha de fallecimiento (si aplica)
- `ano_llegada`: Año de llegada a la asociación
- `notas_salud`: Notas sobre la salud del gato
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

### Tabla de Fotos de Gatos (`cat_photos`)

- `id`: ID único de la foto (clave primaria)
- `cat_id`: ID del gato al que pertenece (clave foránea)
- `url`: URL de la foto
- `es_principal`: Si es la foto principal del gato
- `created_at`: Fecha de creación

## Row Level Security (RLS)

Supabase utiliza Row Level Security (RLS) para controlar el acceso a los datos. Se han configurado las siguientes políticas:

### Políticas para la tabla `user`

- **Lectura para usuarios anónimos**: Permite a usuarios no autenticados leer la tabla `user` para realizar el login
- **Acceso completo para administradores**: Los usuarios con rol de administrador pueden realizar todas las operaciones

```sql
-- Permitir SELECT para usuarios anónimos (necesario para el login)
CREATE POLICY "Allow anon SELECT on user table" 
ON "user" FOR SELECT 
TO anon 
USING (true);

-- Permitir INSERT/UPDATE/DELETE para usuarios autenticados con rol admin
CREATE POLICY "Allow all for admins on user table" 
ON "user" FOR ALL 
TO authenticated 
USING (auth.uid() IN (
  SELECT auth.uid() FROM "user" WHERE rol = 'admin'
));
```

## Scripts SQL Personalizados

Para facilitar ciertas operaciones, se han creado las siguientes funciones SQL personalizadas:

### Función `exec_sql`

Permite ejecutar SQL directo desde la aplicación (solo para administradores):

```sql
CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE 'SELECT json_agg(r) FROM (' || query || ') r' INTO result;
  IF result IS NULL THEN
    result := '[]'::jsonb;
  END IF;
  RETURN result;
EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'query', query
    );
END;
$$;
```

## Scripts Disponibles

La aplicación incluye varios scripts para gestionar la integración con Supabase:

### Configuración de la Base de Datos
- `npm run supabase:create-tables`: Crea las tablas en Supabase
- `npm run supabase:create-exec-sql`: Crea la función SQL personalizada `exec_sql`
- `npm run supabase:setup-rls`: Configura las políticas RLS
- `npm run supabase:direct-sql`: Ejecuta SQL directo en Supabase

### Gestión de Datos
- `npm run supabase:upload-users`: Carga usuarios a Supabase
- `npm run supabase:upload-cats`: Carga datos de gatos a Supabase
- `npm run supabase:listar-usuarios`: Lista todos los usuarios
- `npm run supabase:crear-usuario-elena`: Crea un usuario de prueba
- `npm run supabase:consultar-usuario`: Consulta un usuario específico

### Pruebas
- `npm run supabase:test-connection`: Prueba la conexión a Supabase
- `npm run supabase:test-login`: Prueba el proceso de login
- `npm run supabase:test-direct-login`: Prueba el login directo sin RLS

## Autenticación con Supabase

El sistema de autenticación utiliza:

1. **Context API de React**: Proporciona el estado global de autenticación a toda la aplicación
2. **Servicio de Usuario**: Interactúa con Supabase para verificar credenciales
3. **Componente de Login**: Interfaz de usuario para iniciar sesión

El flujo de autenticación es:
1. El usuario introduce username y password
2. Se consulta la tabla `user` para verificar las credenciales
3. Si son correctas, se almacena el usuario en el AuthContext
4. Se redirige al usuario al Dashboard

Para más detalles sobre la implementación del login, consulta el archivo `SUPABASE_LOGIN.md`.

## Migración desde PostgreSQL Local

La aplicación ha migrado desde una base de datos PostgreSQL local a Supabase. Esta migración ofrece varias ventajas:

1. **Eliminación de la complejidad de configuración local**:
   - Ya no es necesario instalar y configurar PostgreSQL localmente
   - No se requiere configurar puertos, usuarios ni contraseñas

2. **Acceso a la base de datos desde cualquier lugar**:
   - Los desarrolladores pueden acceder a los datos desde cualquier ubicación
   - Facilita el trabajo en equipo y el desarrollo remoto

3. **Características adicionales de Supabase**:
   - Row Level Security (RLS) para control de acceso granular
   - Funciones SQL personalizadas para operaciones complejas
   - Potencial para implementar almacenamiento para fotos de gatos
   - APIs autogeneradas para operaciones CRUD

4. **Adaptaciones realizadas**:
   - Sustitución de conexiones PostgreSQL por el cliente de Supabase
   - Configuración de políticas RLS para gestionar permisos
   - Creación de scripts para facilitar la gestión de Supabase
   - Actualización de servicios para utilizar el cliente de Supabase

## Solución de Problemas Comunes

### Error "process is not defined"
- **Causa**: Intentar acceder a `process.env` en el navegador
- **Solución**: Usar la detección de entorno en `supabaseClient.js`

### Error de Políticas RLS
- **Causa**: Restricciones de acceso a tablas por RLS
- **Solución**: Ejecutar `npm run supabase:configurar-rls`

### Error "Function exec_sql not found"
- **Causa**: Falta la función SQL personalizada
- **Solución**: Seguir las instrucciones en `GUIA_EXEC_SQL.md`

## Próximos Pasos

- Mejorar la seguridad del sistema de autenticación
- Implementar almacenamiento de fotos en Supabase Storage
- Añadir suscripciones en tiempo real para actualizaciones automáticas
- Crear vistas y funciones SQL adicionales para consultas complejas
