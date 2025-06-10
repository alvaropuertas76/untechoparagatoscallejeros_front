-- Archivo SQL para crear funciones RPC para trabajar con usuarios
-- Se debe ejecutar en la consola SQL de Supabase

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
