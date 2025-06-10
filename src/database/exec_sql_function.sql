-- Script para crear la función exec_sql en Supabase
-- Copiar y pegar este script en el Editor SQL de Supabase

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

-- Verifica que la función se haya creado correctamente
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'exec_sql';
