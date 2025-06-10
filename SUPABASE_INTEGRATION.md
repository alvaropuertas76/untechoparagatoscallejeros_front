# Integración con Supabase para Un Techo Para Gatos Callejeros

Este documento proporciona instrucciones sobre cómo la aplicación "Un Techo Para Gatos Callejeros" se integra con Supabase, una plataforma de base de datos PostgreSQL en la nube.

## ¿Qué es Supabase?

Supabase es una alternativa de código abierto a Firebase que proporciona:
- Base de datos PostgreSQL gestionada
- Autenticación y autorización
- API generada automáticamente
- Almacenamiento de archivos
- Funciones en tiempo real

## Configuración

### Requisitos Previos

1. Una cuenta en [Supabase](https://supabase.com/)
2. Un proyecto creado en Supabase
3. Node.js y npm instalados

### Datos de Conexión

La aplicación utiliza los siguientes datos de conexión a Supabase:

- **URL**: `https://ixgtldylhlfjvgpilcbi.supabase.co`
- **Clave anónima**: Almacenada en el archivo de configuración
- **Esquema**: `gatoscallejeros`

### Archivos de Configuración

- `src/services/supabaseClient.js`: Contiene la configuración del cliente de Supabase
- `src/database/supabase_schema.sql`: Script SQL para crear las tablas en Supabase
- `src/database/uploadUsersToSupabase.js`: Script para cargar usuarios del JSON a Supabase

## Modelo de Datos

### Tabla de Usuarios (`users`)

- `id`: ID único del usuario (clave primaria)
- `username`: Nombre de usuario (único)
- `password`: Contraseña (en producción debería estar hasheada)
- `nombre`: Nombre del usuario
- `apellidos`: Apellidos del usuario
- `rol`: Rol del usuario (`admin`, `voluntario`, `adopcion`, `veterinario`)
- `email`: Correo electrónico (único)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

## Scripts Disponibles

- `npm run supabase:upload-users`: Carga los usuarios del archivo JSON a Supabase

## Cómo Funciona la Integración

1. El cliente de Supabase se configura en `supabaseClient.js`
2. Los servicios de la aplicación utilizan este cliente para comunicarse con Supabase
3. El contexto de autenticación utiliza el servicio de usuarios para autenticar a los usuarios

## Migración desde la versión anterior

La aplicación anteriormente utilizaba archivos JSON para almacenar datos y luego migró a una base de datos PostgreSQL local. Ahora, utiliza Supabase como solución en la nube para:

1. Eliminar la necesidad de configurar y mantener una base de datos local
2. Proporcionar acceso a los datos desde cualquier lugar
3. Aprovechar las características adicionales de Supabase como la autenticación, almacenamiento y funciones en tiempo real

## Próximos Pasos

- Migrar la tabla de gatos y fotos a Supabase
- Implementar autenticación segura con hashing de contraseñas
- Utilizar el sistema de almacenamiento de Supabase para las fotos de los gatos
- Configurar políticas de seguridad a nivel de fila (RLS) para proteger los datos
