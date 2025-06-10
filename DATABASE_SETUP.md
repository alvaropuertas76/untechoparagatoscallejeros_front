# Configuración de la Base de Datos PostgreSQL para Un Techo Para Gatos Callejeros

Este documento proporciona instrucciones paso a paso para configurar la base de datos PostgreSQL para la aplicación "Un Techo Para Gatos Callejeros".

## Requisitos Previos

1. PostgreSQL 14 o superior instalado en su sistema
2. Acceso de administrador a PostgreSQL
3. Node.js y npm/pnpm instalados
4. La aplicación descargada y configurada

## Paso 1: Instalar PostgreSQL

Si aún no tiene PostgreSQL instalado:

### Para Windows:
1. Descargue el instalador desde [el sitio oficial de PostgreSQL](https://www.postgresql.org/download/windows/)
2. Ejecute el instalador y siga las instrucciones
3. Anote la contraseña que establezca para el usuario 'postgres'
4. Asegúrese de que PostgreSQL se está ejecutando como servicio

### Para macOS:
```bash
brew install postgresql
brew services start postgresql
```

### Para Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Paso 2: Crear la Base de Datos

1. Abra una terminal/línea de comandos
2. Conéctese a PostgreSQL como usuario postgres:

   **Windows**:
   ```
   psql -U postgres
   ```
   
   **macOS/Linux**:
   ```
   sudo -u postgres psql
   ```

3. Cree la base de datos:
   ```sql
   CREATE DATABASE gatoscallejeros;
   ```

4. Verifique que la base de datos se ha creado:
   ```sql
   \l
   ```

5. Salga de la consola de PostgreSQL:
   ```sql
   \q
   ```

## Paso 3: Configurar las Variables de Entorno

1. En la raíz del proyecto, cree un archivo llamado `.env` con el siguiente contenido:
   ```
   # Configuración de PostgreSQL
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=gatoscallejeros
   DB_PASSWORD=su_contraseña_de_postgres
   DB_PORT=5432

   # Configuración del servidor API
   API_PORT=3001
   ```

2. Reemplace `su_contraseña_de_postgres` con la contraseña que estableció durante la instalación

## Paso 4: Crear las Tablas de la Base de Datos

Hay dos formas de crear las tablas:

### Opción 1: Usar el script npm

```bash
npm run db:setup
```

### Opción 2: Ejecutar los scripts manualmente

1. Navegue hasta la carpeta del proyecto
2. Ejecute los scripts SQL en el siguiente orden:

   ```bash
   psql -U postgres -d gatoscallejeros -f src/database/schema.sql
   psql -U postgres -d gatoscallejeros -f src/database/seed.sql
   ```

## Paso 5: Iniciar el Servidor

Una vez configurada la base de datos, puede iniciar el servidor:

```bash
npm run server
```

Para iniciar tanto el servidor como la aplicación frontend simultáneamente:

```bash
npm run dev:full
```

## Verificación

Para verificar que todo funciona correctamente:

1. El servidor debería estar ejecutándose en `http://localhost:3001`
2. Puede probar la API con Postman o cualquier cliente HTTP haciendo una solicitud GET a `http://localhost:3001/api/cats`
3. La aplicación frontend debería poder conectarse al servidor y mostrar los datos

## Solución de Problemas

### Problemas de Conexión a la Base de Datos

- Verifique que PostgreSQL está en ejecución
- Confirme que las credenciales en el archivo `.env` son correctas
- Asegúrese de que no hay reglas de firewall que bloqueen el puerto 5432

### Errores de Schema

- Si hay errores relacionados con tablas ya existentes, puede limpiar la base de datos:
  ```sql
  DROP DATABASE gatoscallejeros;
  CREATE DATABASE gatoscallejeros;
  ```
  Y luego ejecutar nuevamente los scripts de configuración

### Problemas con el Servidor

- Verifique los registros del servidor para identificar errores específicos
- Confirme que el puerto 3001 no está siendo utilizado por otra aplicación

## Respaldo y Restauración

### Crear un Respaldo
```bash
pg_dump -U postgres -d gatoscallejeros > backup.sql
```

### Restaurar desde un Respaldo
```bash
psql -U postgres -d gatoscallejeros < backup.sql
```
