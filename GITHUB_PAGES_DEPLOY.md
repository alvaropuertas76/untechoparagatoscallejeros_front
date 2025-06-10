# Guía de Despliegue en GitHub Pages

Esta guía explica cómo desplegar la aplicación "Un Techo Para Gatos Callejeros" en GitHub Pages.

## Requisitos Previos

1. Tener un repositorio en GitHub con el código de la aplicación
2. Tener Git instalado en tu máquina local
3. Tener Node.js y npm instalados

## Proceso de Despliegue Automatizado

Hemos configurado un script de despliegue que automatiza todo el proceso. Solo necesitas ejecutar:

```bash
npm run deploy
```

Este comando realizará automáticamente los siguientes pasos:
1. Verificar si hay cambios sin confirmar
2. Construir la aplicación optimizada para producción
3. Crear o actualizar la rama `gh-pages`
4. Subir los archivos construidos a GitHub

## Verificación del Despliegue

Después de ejecutar el script de despliegue, tu aplicación estará disponible en:
```
https://[tu-usuario-github].github.io/untechoparagatoscallejeros_front/
```

Nota: Puede tardar unos minutos hasta que GitHub Pages procese los cambios y la aplicación esté disponible.

## Configuración Realizada

Para habilitar el despliegue en GitHub Pages, se han realizado las siguientes configuraciones:

1. **vite.config.js**: Configurado para usar la ruta base correcta en GitHub Pages
2. **404.html**: Añadido para manejar las rutas de la aplicación SPA
3. **index.html**: Modificado para gestionar redirecciones SPA
4. **deploy.ps1**: Script de PowerShell para automatizar el despliegue
5. **package.json**: Añadido el script `deploy`

## Solución de Problemas

Si encuentras problemas durante el despliegue:

1. **Error al construir la aplicación**: Verifica que no haya errores en el código
2. **Error al subir a GitHub**: Asegúrate de tener permisos de escritura en el repositorio
3. **La página muestra 404**: Verifica que la rama `gh-pages` se haya creado correctamente
4. **Rutas incorrectas**: Comprueba que el valor `base` en `vite.config.js` coincida con el nombre de tu repositorio

## Despliegue Manual

Si prefieres realizar el despliegue manualmente, estos son los pasos:

1. Construye la aplicación:
   ```bash
   npm run build
   ```

2. Crea o cambia a la rama gh-pages:
   ```bash
   git checkout -b gh-pages
   ```

3. Mueve los archivos construidos a la raíz:
   ```bash
   # En Windows
   xcopy /E /Y dist\* .
   
   # En Linux/Mac
   cp -R dist/* .
   ```

4. Añade un archivo .nojekyll:
   ```bash
   touch .nojekyll
   ```

5. Confirma y sube los cambios:
   ```bash
   git add -A
   git commit -m "Despliegue en GitHub Pages"
   git push -f origin gh-pages
   ```

6. Vuelve a tu rama principal:
   ```bash
   git checkout main
   ```
