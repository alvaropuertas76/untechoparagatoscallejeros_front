// Script para garantizar que las imágenes se copien correctamente al directorio raíz de gh-pages
import fs from 'fs';
import path from 'path';

// Directorio de origen y destino
const sourceDir = path.resolve('public');
const distDir = path.resolve('dist');

// Función para copiar archivos de manera recursiva
function copyFolderSync(from, to) {
  // Crear directorio de destino si no existe
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }

  // Leer el directorio de origen
  const files = fs.readdirSync(from);

  // Copiar cada archivo/directorio
  files.forEach(file => {
    const sourceFile = path.join(from, file);
    const destFile = path.join(to, file);
    
    // Verificar si es un directorio o un archivo
    const stats = fs.statSync(sourceFile);
    
    if (stats.isDirectory()) {
      // Si es un directorio, llamar recursivamente
      copyFolderSync(sourceFile, destFile);
    } else {
      // Si es un archivo, copiarlo
      fs.copyFileSync(sourceFile, destFile);
    }
  });
}

// Copiar directorio de assets
console.log('Copiando archivos estáticos para GitHub Pages...');
copyFolderSync(path.join(sourceDir, 'assets'), path.join(distDir, 'assets'));
console.log('¡Copia completada!');
