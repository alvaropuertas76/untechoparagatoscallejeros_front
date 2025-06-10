// Configuración del cliente de Supabase
import { createClient } from '@supabase/supabase-js';

// Definir variables para las credenciales de Supabase
let supabaseUrl, supabaseKey;

// Detectar el entorno (browser o Node.js)
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  // Estamos en el navegador, usar import.meta.env (Vite)
  supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || 'https://ixgtldylhlfjvgpilcbi.supabase.co';
  supabaseKey = import.meta?.env?.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z3RsZHlsaGxmanZncGlsY2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzE1NTgsImV4cCI6MjA2NTE0NzU1OH0._D9-5NDLEHchQmQqwVEobYaMpuzkfrI9deZrRmT5H8g';
} else {
  // Estamos en Node.js, usar process.env
  try {
    const dotenv = require('dotenv');
    dotenv.config();
    supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ixgtldylhlfjvgpilcbi.supabase.co';
    supabaseKey = process.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z3RsZHlsaGxmanZncGlsY2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzE1NTgsImV4cCI6MjA2NTE0NzU1OH0._D9-5NDLEHchQmQqwVEobYaMpuzkfrI9deZrRmT5H8g';
  } catch (e) {
    // Fallback si hay algún error con dotenv
    supabaseUrl = 'https://ixgtldylhlfjvgpilcbi.supabase.co';
    supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z3RsZHlsaGxmanZncGlsY2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzE1NTgsImV4cCI6MjA2NTE0NzU1OH0._D9-5NDLEHchQmQqwVEobYaMpuzkfrI9deZrRmT5H8g';
  }
}

console.log('Inicializando Supabase con URL:', supabaseUrl);
console.log('Usando clave de Supabase (primeros 10 caracteres):', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'No disponible');

// Crear el cliente de Supabase con opciones mínimas
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Agregar método de utilidad para obtener la URL
supabase.getUrl = () => supabaseUrl;

// Exponer variables para scripts que las necesiten (aunque no debería ser necesario si configuramos bien)
supabase.supabaseUrl = supabaseUrl;
supabase.supabaseKey = supabaseKey;

// Añadir un método para verificar credenciales
supabase.checkConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { 
      ok: !error, 
      data, 
      error,
      url: supabaseUrl,
      key: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'No disponible'
    };
  } catch (e) {
    return { 
      ok: false, 
      error: e,
      url: supabaseUrl,
      key: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'No disponible'
    };
  }
};

export default supabase;
