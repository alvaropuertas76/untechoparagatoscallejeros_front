# Configuración de Supabase para Un Techo Para Gatos Callejeros

Este documento detalla los pasos para configurar y migrar la aplicación a Supabase.

## Credenciales de Supabase

Las credenciales de Supabase se configuran en el archivo `.env` en la raíz del proyecto:

```
VITE_SUPABASE_URL=https://ixgtldylhlfjvgpilcbi.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z3RsZHlsaGxmanZncGlsY2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzE1NTgsImV4cCI6MjA2NTE0NzU1OH0._D9-5NDLEHchQmQqwVEobYaMpuzkfrI9deZrRmT5H8g
```

## Pasos para Configurar Supabase

Sigue estos pasos en orden para configurar la aplicación con Supabase:

1. **Verifica la conexión con Supabase**:
   ```
   npm run supabase:test-connection
   ```

2. **Crea la función exec_sql necesaria primero**:
   ```
   npm run supabase:create-exec-sql
   ```
   
   > 📝 **NOTA:** Si la función `exec_sql` no puede crearse automáticamente, sigue las instrucciones que se muestran en la consola para crearla manualmente desde el panel de SQL de Supabase.

3. **Crea el resto de funciones RPC**:
   ```
   npm run supabase:create-rpc
   ```

4. **Crea las tablas en Supabase**:
   ```
   npm run supabase:direct-sql
   ```

4. **Configura las políticas de seguridad RLS**:
   ```
   npm run supabase:setup-rls
   ```

4. **Migra los usuarios a Supabase** (usando el método alternativo si es necesario):
   ```
   npm run supabase:upload-users
   ```
   
   Si encuentras problemas de permisos con RLS, intenta:
   ```
   npm run supabase:upload-users-alt
   ```

5. **Prueba el login con Supabase**:
   ```
   npm run supabase:test-login
   ```

6. **Migra los gatos a Supabase** (opcional):
   ```
   npm run supabase:upload-cats
   ```

## Problemas Comunes y Soluciones

### Error de políticas RLS

Si ves mensajes como: `new row violates row-level security policy for table "user"`, esto indica un problema con las políticas de seguridad RLS. Opciones para resolverlo:

1. **Ejecutar el script de configuración RLS**:
   ```
   npm run supabase:setup-rls
   ```

2. **Usar el método alternativo de carga**:
   ```
   npm run supabase:upload-users-alt
   ```

3. **Configurar manualmente las políticas RLS desde la interfaz de Supabase**:
   - Ve a la sección Authentication -> Policies
   - Selecciona la tabla "user"
   - Haz clic en "New Policy"
   - Habilita políticas para SELECT, INSERT, UPDATE, DELETE

### Problemas de credenciales

Si tienes problemas con las credenciales de Supabase:

1. Verifica que las variables de entorno estén correctamente definidas con el prefijo `VITE_`
2. Asegúrate de reiniciar el servidor de desarrollo después de actualizar el archivo `.env`
3. Verifica que el cliente de Supabase esté utilizando las variables de entorno correctamente

## Estructura de la Base de Datos

La aplicación utiliza las siguientes tablas en Supabase:

- `user`: Almacena la información de los usuarios del sistema
- `cats`: Almacena la información de los gatos
- `cat_photos`: Almacena las fotos de los gatos
