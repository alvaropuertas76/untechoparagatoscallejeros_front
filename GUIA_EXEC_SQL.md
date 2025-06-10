# Guía para Solucionar el Problema de exec_sql en Supabase

Este documento proporciona instrucciones detalladas para crear la función `exec_sql` en Supabase y solucionar el error "Could not find the function public.exec_sql(query) in the schema cache".

## Instrucciones para crear la función exec_sql manualmente

1. **Accede al Panel de Supabase**:
   - Inicia sesión en [Supabase](https://app.supabase.com/)
   - Selecciona tu proyecto "Un Techo Para Gatos Callejeros"

2. **Abre el Editor SQL**:
   - En el menú izquierdo, haz clic en "SQL Editor"
   - Crea un nuevo script (botón "New query")

3. **Copia y pega el siguiente código SQL**:
   ```sql
   -- Función para ejecutar SQL directo (bypass RLS) para administradores
   CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
   RETURNS JSONB
   LANGUAGE plpgsql
   SECURITY DEFINER -- Ejecuta con los permisos del creador (superusuario)
   AS $$
   DECLARE
     result JSONB;
   BEGIN
     -- Ejecutar la consulta dinámica y capturar el resultado como JSON
     EXECUTE 'SELECT json_agg(r) FROM (' || query || ') r' INTO result;
     
     -- Si la consulta no devuelve filas, devolveremos un objeto vacío
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

4. **Ejecuta el código SQL**:
   - Haz clic en el botón "Run" (o presiona Ctrl+Enter)
   - Deberías ver un mensaje que indica que la función se ha creado correctamente

5. **Crea la función insert_user**:
   - Crea otro nuevo script
   - Copia y pega el siguiente código:
   ```sql
   -- Función para insertar un usuario saltando las políticas RLS
   CREATE OR REPLACE FUNCTION insert_user(user_data JSONB)
   RETURNS JSONB
   LANGUAGE plpgsql
   SECURITY DEFINER -- Esto hace que la función se ejecute con los permisos del creador
   AS $$
   BEGIN
     INSERT INTO "user" (id, username, password, nombre, apellidos, rol, email)
     VALUES (
       (user_data->>'id')::integer,
       user_data->>'username',
       user_data->>'password',
       user_data->>'nombre',
       user_data->>'apellidos',
       user_data->>'rol',
       user_data->>'email'
     );
     
     RETURN jsonb_build_object(
       'success', true,
       'message', 'Usuario insertado correctamente'
     );
   EXCEPTION
     WHEN others THEN
       RETURN jsonb_build_object(
         'success', false,
         'error', SQLERRM
       );
   END;
   $$;
   ```

6. **Crea la función setup_user_policies**:
   - Crea otro nuevo script
   - Copia y pega el siguiente código:
   ```sql
   -- Función para habilitar políticas RLS que permitan operaciones básicas
   CREATE OR REPLACE FUNCTION setup_user_policies()
   RETURNS VOID
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     -- Primero eliminamos cualquier política existente
     DROP POLICY IF EXISTS "Allow select for authenticated users" ON "user";
     DROP POLICY IF EXISTS "Allow insert for authenticated users" ON "user";
     DROP POLICY IF EXISTS "Allow update for authenticated users" ON "user";
     DROP POLICY IF EXISTS "Allow delete for authenticated users" ON "user";
     
     -- Creamos políticas que permitan todas las operaciones a usuarios autenticados
     CREATE POLICY "Allow select for authenticated users" 
       ON "user" FOR SELECT 
       USING (auth.role() = 'authenticated');
       
     CREATE POLICY "Allow insert for authenticated users" 
       ON "user" FOR INSERT 
       WITH CHECK (auth.role() = 'authenticated');
       
     CREATE POLICY "Allow update for authenticated users" 
       ON "user" FOR UPDATE 
       USING (auth.role() = 'authenticated');
       
     CREATE POLICY "Allow delete for authenticated users" 
       ON "user" FOR DELETE 
       USING (auth.role() = 'authenticated');
   END;
   $$;
   ```

## Verificación de la Creación de Funciones

Para verificar que las funciones se han creado correctamente, ejecuta el siguiente script SQL en el Editor SQL:

```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

Deberías ver las funciones `exec_sql`, `insert_user` y `setup_user_policies` en los resultados.

## Prueba las Funciones

Una vez creadas las funciones, puedes probar si funcionan correctamente ejecutando:

```bash
npm run supabase:direct-sql
npm run supabase:setup-rls
npm run supabase:upload-users-alt
npm run supabase:test-login
```

## Solución de Problemas Comunes

1. **Error "Could not find the function public.exec_sql(query)"**:
   - Este error significa que la función `exec_sql` no existe o no es accesible
   - Asegúrate de haber creado la función como se indica arriba
   - Verifica que esté en el esquema `public`

2. **Errores de Permisos RLS**:
   - Si encuentras errores relacionados con RLS, ejecuta `npm run supabase:setup-rls`
   - Asegúrate de que todas las funciones tengan `SECURITY DEFINER`

3. **Errores al Subir Usuarios**:
   - Si `npm run supabase:upload-users` falla, intenta `npm run supabase:upload-users-alt`
   - Revisa los mensajes de error para identificar problemas específicos

4. **Error "relation 'user' does not exist"**:
   - Ejecuta `npm run supabase:direct-sql` para crear la tabla `user`
