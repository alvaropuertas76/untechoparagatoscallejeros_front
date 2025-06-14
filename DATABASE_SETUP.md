# AVISO: Migración a Supabase

## Información Importante

Este proyecto ha migrado de PostgreSQL local a **Supabase**, una plataforma de base de datos PostgreSQL en la nube.

## Nuevas Instrucciones

Para configurar la base de datos para este proyecto, por favor consulte:

1. **SUPABASE_INTEGRATION.md** - Guía completa de integración con Supabase
2. **SUPABASE_LOGIN.md** - Instrucciones para configurar la autenticación
3. **GUIA_EXEC_SQL.md** - Guía para configurar funciones SQL personalizadas

## Ventajas de la Migración

La migración a Supabase ofrece varias ventajas:
- No necesita instalar PostgreSQL localmente
- Acceso a la base de datos desde cualquier ubicación
- Seguridad mejorada con Row Level Security (RLS)
- Características adicionales como almacenamiento y autenticación

## Scripts de Configuración

Utilice los siguientes scripts para configurar Supabase:
```
npm run supabase:create-tables
npm run supabase:configurar-rls
npm run supabase:test-connection
```

---

**Nota**: La configuración original de PostgreSQL local se ha movido a `DATABASE_SETUP_OLD.md` y se mantiene como referencia histórica.

