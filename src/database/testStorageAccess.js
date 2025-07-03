// Prueba para verificar acceso al bucket de storage
import { testStorageAccess } from './testStorageAccess';

async function runTest() {
  console.log('Iniciando prueba de acceso al storage de Supabase...');
  
  const result = await testStorageAccess();
  
  console.log('Resultado de la prueba:', result);
  
  if (result.success) {
    console.log('✅ Prueba exitosa! Se puede acceder al storage de Supabase.');
  } else {
    console.error('❌ Error en la prueba. No se puede acceder al storage de Supabase.');
  }
}

// Ejecutar la prueba
runTest()
  .catch(error => console.error('Error al ejecutar la prueba:', error));
