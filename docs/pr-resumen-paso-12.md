# PR - MVP Exámenes NOX

## Resumen
Implementación end-to-end del MVP de exámenes con:
- Panel profesor (auth, dashboard, creación/publicación de examen).
- Flujo alumno por enlace único con estilo pergamino.
- Corrección automática de test y resultados por alumno.
- Ajuste manual de desarrollo.
- Exportación CSV y XLSX.
- Endurecimiento de seguridad (rate limit, origin checks, headers).
- Health/readiness endpoints y trazabilidad por request-id.
- Preparación de despliegue real (Docker, Nginx, scripts, runbooks).
- QA automática (tests de grading + CI lint/test/build).

## Cambios principales
- API routes completas para auth, exámenes, submissions, resultados y export.
- Modelo Prisma local + versión PostgreSQL para producción.
- UI profesor y alumno funcionales.
- Scripts de despliegue y smoke test.
- Pipeline de CI con GitHub Actions.

## Verificación local
- `npm run test` ✅
- `npm run lint` ✅
- `npm run build` ✅

## Checklist release
- [ ] Configurar remoto GitHub.
- [ ] Push rama `codex/release-mvp-examen`.
- [ ] Crear PR y revisión funcional.
- [ ] Despliegue en staging/producción según `docs/paso-10-despliegue-real.md`.
