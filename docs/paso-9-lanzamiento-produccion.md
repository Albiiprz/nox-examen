# Paso 9 - Cierre de Producción

Fecha: 21/04/2026  
Dominio objetivo: `https://examen.noxseason.com`

## 1. Variables de entorno
- [ ] Crear `.env.production` desde `.env.production.example`.
- [ ] Configurar `DATABASE_URL` de PostgreSQL real.
- [ ] Configurar `APP_URL=https://examen.noxseason.com`.
- [ ] Configurar `TRUST_PROXY=true` detrás de reverse proxy.

## 2. Base de datos
- [ ] Ejecutar validación de esquema PostgreSQL:
```bash
npm run db:generate:pg
npm run db:push:pg
```
- [ ] Crear profesor inicial en entorno productivo.
- [ ] Verificar lectura/escritura con un examen de prueba.

## 3. Build y arranque
- [ ] Build en limpio:
```bash
npm ci
npm run lint
npm run build
```
- [ ] Arranque:
```bash
npm run start
```

## 4. Reverse proxy y TLS
- [ ] Enrutado del subdominio `examen.noxseason.com` a la app.
- [ ] Certificado TLS activo.
- [ ] Redirección HTTP -> HTTPS.

## 5. Healthchecks
- [ ] Probar health básico:
  - `GET /api/health` -> 200
- [ ] Probar readiness con DB:
  - `GET /api/ready` -> 200

## 6. Seguridad aplicada
- [ ] Confirmar cabeceras de seguridad en respuesta HTTP.
- [ ] Confirmar limitación de peticiones (429 cuando corresponde).
- [ ] Confirmar validación de origen en endpoints de profesor.
- [ ] Confirmar cookies de sesión `HttpOnly` y `Secure` en producción.

## 7. Observabilidad mínima
- [ ] Revisar `x-request-id` en respuestas para trazabilidad.
- [ ] Configurar logs del proceso en plataforma de despliegue.
- [ ] Configurar monitor de disponibilidad contra `/api/ready`.

## 8. Pruebas de aceptación final
- [ ] Flujo profesor: login -> crear examen -> publicar -> ver resultados.
- [ ] Flujo alumno: abrir enlace -> enviar respuestas.
- [ ] Flujo resultados: detalle + ajuste manual + export CSV/XLSX.

## 9. Go-live
- [ ] Ventana de despliegue definida.
- [ ] Persona de guardia durante primeras 24h.
- [ ] Checklist de rollback preparado.
