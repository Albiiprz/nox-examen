# Paso 10 - Despliegue Real en examen.noxseason.com

Fecha: 21/04/2026

## Qué queda automatizado en el repo
- Docker multi-stage (`Dockerfile`).
- Compose de producción (`deploy/docker-compose.prod.yml`).
- Config Nginx para subdominio + HTTPS (`deploy/nginx/examen.noxseason.com.conf`).
- Script de despliegue (`deploy/scripts/deploy-prod.sh`).
- Script de smoke test (`deploy/scripts/smoke-test.sh`).

## 1. Prerrequisitos en servidor
- Ubuntu/Debian con:
  - Docker + Docker Compose plugin
  - Nginx
  - Certbot
  - Git
- Puerto 80/443 abiertos.
- Repo clonado en `/opt/nox-examen`.

## 2. DNS
En el proveedor DNS de `noxseason.com`:
- Crear/editar `A` record:
  - Host: `examen`
  - Value: `IP_PUBLICA_DEL_SERVIDOR`
  - TTL: 300s

## 3. Certificado SSL
En servidor:
```bash
sudo mkdir -p /var/www/certbot
sudo certbot certonly --webroot -w /var/www/certbot -d examen.noxseason.com
```

## 4. Nginx
Copiar config:
```bash
sudo cp deploy/nginx/examen.noxseason.com.conf /etc/nginx/sites-available/examen.noxseason.com.conf
sudo ln -sf /etc/nginx/sites-available/examen.noxseason.com.conf /etc/nginx/sites-enabled/examen.noxseason.com.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Variables de entorno de producción
Crear `/opt/nox-examen/.env.production`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/nox_exam?schema=public"
APP_URL="https://examen.noxseason.com"
TRUST_PROXY="true"
NODE_ENV="production"
```

## 6. Base de datos PostgreSQL
En `/opt/nox-examen`:
```bash
npm ci
npm run db:generate:pg
npm run db:push:pg
```

## 7. Despliegue
```bash
./deploy/scripts/deploy-prod.sh /opt/nox-examen
```

## 8. Verificación post-despliegue
```bash
./deploy/scripts/smoke-test.sh https://examen.noxseason.com
```

## 9. Rollback rápido
```bash
cd /opt/nox-examen
git checkout <commit_estable>
docker compose -f deploy/docker-compose.prod.yml up -d --build
./deploy/scripts/smoke-test.sh https://examen.noxseason.com
```

## 10. Operación diaria
- Logs de app:
```bash
docker compose -f deploy/docker-compose.prod.yml logs -f web
```
- Reinicio controlado:
```bash
docker compose -f deploy/docker-compose.prod.yml restart web
```
