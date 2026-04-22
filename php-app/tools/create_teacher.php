<?php
require __DIR__ . '/../inc/bootstrap.php';

if (PHP_SAPI !== 'cli') {
    echo "Solo CLI\n";
    exit(1);
}

[$script, $username, $password, $displayName] = array_pad($argv, 4, null);
if (!$username || !$password) {
    echo "Uso: php tools/create_teacher.php usuario password \"Nombre Profesor\"\n";
    exit(1);
}

$displayName = $displayName ?: $username;
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('INSERT INTO teachers (username, password_hash, display_name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), display_name = VALUES(display_name)');
$stmt->execute([$username, $hash, $displayName]);

echo "Profesor creado/actualizado: {$username}\n";
