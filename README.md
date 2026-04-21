# NOX Exámenes - Base MVP (Paso 6)

Implementación inicial del MVP definida en los documentos de `docs/`.

## Qué está implementado
- Login profesor con sesión por cookie segura.
- Dashboard profesor básico.
- Crear examen en borrador (hasta 10 test + 1 desarrollo).
- Listado de exámenes del profesor.
- Publicar examen y generar enlace público (`/e/:token`).
- Formulario alumno estilo pergamino para responder examen.
- Envío de respuestas con corrección automática de tipo test.
- Persistencia con Prisma (SQLite para desarrollo local).
- Endurecimiento básico de seguridad (rate limit, validación de origen y cabeceras HTTP).
- QA automática con tests unitarios y pipeline CI.

## Stack
- Next.js (App Router)
- Prisma ORM
- SQLite (dev)
- Zod
- bcryptjs

## Arranque local
1. Instalar dependencias:
```bash
npm install
```

2. Configurar entorno:
```bash
cp .env.example .env
```

3. Generar cliente Prisma y crear base de datos:
```bash
npm run db:generate
npm run db:init
```

4. Crear profesor demo:
```bash
npm run db:seed
```

5. Arrancar aplicación:
```bash
npm run dev
```

## Credenciales demo
- Usuario: `profesor`
- Contraseña: `Profesor1234`

## Rutas principales
- Home: `/`
- Login profesor: `/profesor/login`
- Dashboard profesor: `/profesor/dashboard`
- Exámenes profesor: `/profesor/examenes`
- Nuevo examen: `/profesor/examenes/nuevo`
- Examen alumno público: `/e/:token`

## APIs principales
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/profesor/examenes`
- `POST /api/profesor/examenes`
- `POST /api/profesor/examenes/:id/publicar`
- `POST /api/public/examen/:token/submission`
- `GET /api/health`
- `GET /api/ready`

## Nota de arquitectura
En esta iteración se usa SQLite para acelerar desarrollo local. Para producción en `examen.noxseason.com`, cambiar `DATABASE_URL` a PostgreSQL y ejecutar migraciones.

## Seguridad aplicada (Paso 8)
- Rate limiting:
  - Login profesor.
  - Creación/publicación de examen.
  - Corrección manual de desarrollo.
  - Envío público de examen.
- Validación de origen (`Origin`) en endpoints mutables de profesor.
- Validaciones Zod con límites de longitud en campos críticos.
- Normalización de texto de entrada para reducir inconsistencias.
- Cabeceras de seguridad globales (`CSP`, `X-Frame-Options`, `nosniff`, etc.).

Nota: el rate limit actual es en memoria del proceso (válido para MVP/instancia única). En despliegue multi-instancia, migrarlo a Redis.

## Operativa de producción (Paso 9)
- Plantilla de entorno productivo: `.env.production.example`.
- Esquema Prisma para PostgreSQL: `prisma/schema.postgresql.prisma`.
- Scripts:
  - `npm run db:generate:pg`
  - `npm run db:push:pg`
- Checklist de lanzamiento:
  - `docs/paso-9-lanzamiento-produccion.md`

## Despliegue real (Paso 10)
- Infra de despliegue incluida:
  - `Dockerfile`
  - `deploy/docker-compose.prod.yml`
  - `deploy/nginx/examen.noxseason.com.conf`
  - `deploy/scripts/deploy-prod.sh`
  - `deploy/scripts/smoke-test.sh`
- Runbook completo:
  - `docs/paso-10-despliegue-real.md`

## QA y CI (Paso 11)
- Tests:
```bash
npm run test
```
- Pipeline GitHub Actions:
  - `.github/workflows/ci.yml`
  - Ejecuta: `lint + test + build` en push/PR.
