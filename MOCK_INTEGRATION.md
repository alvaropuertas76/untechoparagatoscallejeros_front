# Integración con Datos Mock

## Descripción

Este documento explica cómo se ha implementado una solución temporal utilizando datos mock para mantener la aplicación funcional mientras se completa la integración con Supabase.

## Estado Actual

Actualmente, la aplicación está configurada para utilizar el servicio `mockCatService.js` en lugar del `catService.js` real que se conecta a Supabase. Esto permite que la aplicación siga funcionando y que los desarrolladores puedan probar cambios sin depender de la conexión a Supabase.

## Archivos Modificados

1. `src/context/CatContext.jsx`
   - Se ha cambiado la importación de `catService` a `mockCatService`
   - Se ha añadido un comentario indicando que es una solución temporal

## Cómo Funciona el Servicio Mock

El servicio mock (`mockCatService.js`) simula todas las operaciones CRUD que normalmente se realizarían con Supabase:

- `getAllCats()`: Devuelve todos los gatos mock
- `getCatById()`: Devuelve un gato específico por ID
- `createCat()`: Crea un nuevo gato (solo en memoria)
- `updateCat()`: Actualiza un gato existente
- `deleteCat()`: Marca un gato como fallecido
- `searchCats()`: Filtra gatos según criterios
- `getStats()`: Calcula estadísticas basadas en los datos mock

Además, el servicio incluye un retraso simulado para imitar el comportamiento de una API real.

## Datos Mock

Los datos de prueba se encuentran en `src/services/mockData.js` y consisten en una colección de objetos de gato con todas las propiedades necesarias para la aplicación.

## Volver a la Versión Real

Cuando la integración con Supabase esté lista, sigue estos pasos para volver a la versión real:

1. Edita `src/context/CatContext.jsx`
2. Cambia:
   ```javascript
   import { mockCatService as catService } from '../services/mockCatService';
   ```
   a:
   ```javascript
   import { catService } from '../services/catService';
   ```
3. Elimina el comentario "NOTA TEMPORAL" que indica que se están usando datos mock

## Pruebas

Al cambiar entre los servicios mock y real, asegúrate de probar:

1. Login y autenticación
2. Listado de gatos
3. Creación, edición y eliminación de gatos
4. Filtros de búsqueda
5. Estadísticas del dashboard

## Solución de Problemas

Si encuentras problemas al usar el servicio mock:

1. Verifica que el archivo `mockData.js` esté correctamente configurado
2. Comprueba que los datos mock tienen la misma estructura que los datos reales
3. Asegúrate de que todas las importaciones son correctas

Si encuentras problemas al volver a la versión real:

1. Verifica que las credenciales de Supabase son correctas
2. Comprueba que las tablas en Supabase están correctamente configuradas
3. Asegúrate de que el RLS (Row Level Security) está configurado adecuadamente
