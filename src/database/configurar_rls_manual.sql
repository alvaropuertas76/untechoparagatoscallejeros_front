-- Script para configurar RLS en la tabla "user" en Supabase
-- Copiar y pegar este script en el SQL Editor de Supabase

-- 1. Habilitar RLS en la tabla "user" (probablemente ya está habilitado)
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- 2. Crear política que permita operaciones SELECT a usuarios anónimos
DROP POLICY IF EXISTS "Allow anon select access" ON "user";
CREATE POLICY "Allow anon select access" 
ON "user" 
FOR SELECT 
TO anon
USING (true);

-- 3. Crear política que permita operaciones SELECT a usuarios autenticados
DROP POLICY IF EXISTS "Allow authenticated select access" ON "user";
CREATE POLICY "Allow authenticated select access" 
ON "user" 
FOR SELECT 
TO authenticated
USING (true);

-- 4. Crear políticas para INSERT, UPDATE, DELETE solo para administradores
-- Estas políticas son opcionales y deberías adaptarlas según tus necesidades

-- Política para INSERT 
DROP POLICY IF EXISTS "Allow insert for admins" ON "user";
CREATE POLICY "Allow insert for admins" 
ON "user" 
FOR INSERT 
TO authenticated
WITH CHECK (rol = 'admin');

-- Política para UPDATE
DROP POLICY IF EXISTS "Allow update for admins" ON "user";
CREATE POLICY "Allow update for admins" 
ON "user" 
FOR UPDATE 
TO authenticated
USING (rol = 'admin');

-- Política para DELETE
DROP POLICY IF EXISTS "Allow delete for admins" ON "user";
CREATE POLICY "Allow delete for admins" 
ON "user" 
FOR DELETE 
TO authenticated
USING (rol = 'admin');

-- 5. Verificar que las políticas se han creado correctamente
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'user';
