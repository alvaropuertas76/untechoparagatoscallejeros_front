// Script para configurar políticas RLS para la tabla "user"
import supabase from '../services/supabaseClient.js';

async function configurarPoliticasRLS() {
  console.log('=== CONFIGURANDO POLÍTICAS RLS PARA LA TABLA USER ===');
  
  try {
    // 1. Verificar que RLS está habilitado
    console.log('1. Verificando el estado de RLS...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('user')
      .select('count(*)', { count: 'exact', head: true });
    
    if (rlsError && rlsError.message.includes('permission denied')) {
      console.log('✅ RLS está activo y bloqueando el acceso (comportamiento esperado)');
    } else {
      console.log('ℹ️ Pudo acceder a la tabla, lo que significa que RLS está deshabilitado o hay políticas permisivas');
    }
    
    // 2. Crear una política para permitir SELECT (lectura) a todos los usuarios anónimos
    console.log('\n2. Creando política de lectura pública...');
    
    // Usamos SQL directo a través de REST API
    const resp = await fetch(`${supabase.getUrl()}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabase.supabaseKey || process.env.VITE_SUPABASE_KEY,
        'Authorization': `Bearer ${supabase.supabaseKey || process.env.VITE_SUPABASE_KEY}`
      },
      body: JSON.stringify({
        query: `
          -- Eliminar política si ya existe para evitar errores
          DROP POLICY IF EXISTS "Allow public read access" ON "user";
          
          -- Crear política que permita a todos leer la tabla user
          CREATE POLICY "Allow public read access" 
          ON "user" 
          FOR SELECT 
          USING (true);
          
          -- Retornar confirmación
          SELECT 'Política de lectura pública creada' as result;
        `
      })
    });
    
    if (!resp.ok) {
      const errorData = await resp.json();
      console.error('❌ Error al crear política de lectura:', errorData);
      
      // Si el error es porque exec_sql no existe, damos instrucciones para crearlo manualmente
      if (errorData.message && errorData.message.includes('exec_sql')) {
        console.log('\n⚠️ La función exec_sql no existe. Debes crearla primero usando las instrucciones en GUIA_EXEC_SQL.md');
        
        // Alternativa: intentar configurar políticas a través de SQL Editor en el panel de Supabase
        console.log('\n🔧 Alternativa: Configura las políticas manualmente a través del panel de Supabase:');
        console.log('1. Inicia sesión en https://app.supabase.com');
        console.log('2. Ve a tu proyecto > Authentication > Policies');
        console.log('3. Busca la tabla "user" y haz clic en "New Policy"');
        console.log('4. Selecciona "Enable read access to everyone" y guarda');
      }
      
      console.log('\nIntentando método alternativo utilizando ALTER...');
      // Intento alternativo: deshabilitar RLS completamente para la tabla user
      const respAlt = await fetch(`${supabase.getUrl()}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey || process.env.VITE_SUPABASE_KEY,
          'Authorization': `Bearer ${supabase.supabaseKey || process.env.VITE_SUPABASE_KEY}`
        },
        body: JSON.stringify({
          query: `ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;`
        })
      });
      
      if (!respAlt.ok) {
        console.error('❌ También falló el método alternativo');
        return;
      } else {
        console.log('✅ Se deshabilitó RLS para la tabla "user" (método alternativo)');
      }
    } else {
      console.log('✅ Política de lectura pública creada correctamente');
    }
    
    // 3. Verificar que ahora podemos acceder a la tabla
    console.log('\n3. Verificando acceso a la tabla "user"...');
    const { data: testData, error: testError } = await supabase
      .from('user')
      .select('*')
      .limit(3);
    
    if (testError) {
      console.error('❌ Todavía no se puede acceder a la tabla:', testError.message);
      console.log('\n⚠️ Es posible que necesites modificar las políticas manualmente desde el panel de Supabase.');
    } else {
      console.log('✅ ¡Éxito! Se puede acceder a la tabla "user"');
      console.log('Usuarios recuperados:', testData);
    }
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar la configuración
configurarPoliticasRLS();
