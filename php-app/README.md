# NOX Exámenes (PHP puro)

Versión compatible con hosting compartido (PHP + MySQL, sin Node.js).

## 1) Preparar base de datos
1. Crea una base MySQL vacía (ej: `nox_exam`).
2. Importa `sql/schema.sql` (phpMyAdmin).

## 2) Configurar app
1. Copia `config.sample.php` a `config.php`.
2. Rellena credenciales MySQL.

## 3) Crear profesor inicial
Si tienes terminal en hosting:
```bash
php tools/create_teacher.php profesor Profesor1234 "Profesor Nox"
```

Si no tienes terminal, crea el hash en local y haz insert manual en phpMyAdmin.

## 4) Publicar
Sube el contenido de `php-app/` al docroot del subdominio `examenes.noxsaga.com`.

## 5) URLs
- Inicio: `/index.php`
- Login profesor: `/profesor/login.php`
- Exámenes profesor: `/profesor/exams.php`

## Notas
- Máximo 10 preguntas test + 1 de desarrollo.
- Corrección automática de test.
- Ajuste manual de desarrollo en resultados.
- Exportación CSV.
