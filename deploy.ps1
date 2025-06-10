#!/usr/bin/env powershell
# Script para desplegar la aplicación en GitHub Pages

# Colores para mensajes
$GREEN = @{ForegroundColor = "Green"}
$YELLOW = @{ForegroundColor = "Yellow"}
$RED = @{ForegroundColor = "Red"}

# Función para mostrar mensajes de estado
function Write-Status {
    param (
        [string]$Message,
        [hashtable]$Color = $GREEN
    )
    Write-Host $Message @Color
}

# Verificar si git está instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Status "❌ Error: Git no está instalado o no está en el PATH." $RED
    exit 1
}

# Verificar si hay cambios sin confirmar
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Status "⚠️ Hay cambios sin confirmar en tu repositorio." $YELLOW
    Write-Status "Por favor, commit todos los cambios antes de desplegar." $YELLOW
    Write-Status "Git status:" $YELLOW
    git status
    
    $confirmation = Read-Host "¿Deseas continuar de todos modos? (s/N)"
    if ($confirmation -ne "s" -and $confirmation -ne "S") {
        Write-Status "Despliegue cancelado." $RED
        exit 1
    }
}

# Asegurarse de que estamos en la rama principal (main o master)
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Status "🔍 Rama actual: $currentBranch" $YELLOW

# Construir la aplicación
Write-Status "🏗️ Construyendo la aplicación..." $YELLOW
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Status "❌ Error durante la construcción de la aplicación." $RED
    exit 1
}

Write-Status "✅ Aplicación construida con éxito." $GREEN

# Verificar si la rama gh-pages existe
$branchExists = git show-ref --verify --quiet refs/heads/gh-pages
$shouldCreateBranch = $false

if (-not $branchExists) {
    Write-Status "🔍 La rama gh-pages no existe, se creará una nueva." $YELLOW
    $shouldCreateBranch = $true
}

# Guardar la rama actual para volver a ella después
$originalBranch = $currentBranch

# Cambiar a la rama gh-pages o crearla si no existe
if ($shouldCreateBranch) {
    Write-Status "🔄 Creando rama gh-pages sin historial..." $YELLOW
    git checkout --orphan gh-pages
} else {
    Write-Status "🔄 Cambiando a la rama gh-pages..." $YELLOW
    git checkout gh-pages
    
    # Limpiar la rama gh-pages (excepto .git)
    Write-Status "🧹 Limpiando rama gh-pages..." $YELLOW
    Get-ChildItem -Force | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force
}

# Copiar los archivos construidos a la raíz del repositorio
Write-Status "📋 Copiando archivos construidos..." $YELLOW
Copy-Item -Path dist/* -Destination . -Recurse

# Crear un archivo .nojekyll para evitar el procesamiento de Jekyll
Write-Status "📝 Creando archivo .nojekyll..." $YELLOW
"" | Out-File -FilePath .nojekyll -Encoding ascii

# Agregar todos los archivos al área de preparación
Write-Status "➕ Agregando archivos al área de preparación..." $YELLOW
git add -A

# Confirmar los cambios
Write-Status "💾 Confirmando cambios..." $YELLOW
git commit -m "Despliegue en GitHub Pages - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Subir los cambios a GitHub
Write-Status "☁️ Subiendo cambios a GitHub..." $YELLOW
git push -f origin gh-pages

if ($LASTEXITCODE -ne 0) {
    Write-Status "❌ Error al subir los cambios a GitHub." $RED
    Write-Status "Volviendo a la rama $originalBranch..." $YELLOW
    git checkout $originalBranch
    exit 1
}

# Volver a la rama original
Write-Status "🔄 Volviendo a la rama $originalBranch..." $YELLOW
git checkout $originalBranch

Write-Status "✨ ¡Despliegue completado con éxito! ✨" $GREEN
Write-Status "📱 Tu aplicación estará disponible en: https://[tu-usuario-github].github.io/untechoparagatoscallejeros_front/" $GREEN
Write-Status "⏱️ Puede tardar unos minutos en estar disponible." $YELLOW
