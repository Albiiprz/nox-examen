<?php
function teacher_login(PDO $pdo, string $username, string $password): bool {
    $stmt = $pdo->prepare('SELECT id, username, password_hash, display_name FROM teachers WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $teacher = $stmt->fetch();
    if (!$teacher) {
        return false;
    }

    if (!password_verify($password, $teacher['password_hash'])) {
        return false;
    }

    $_SESSION['teacher_id'] = (int)$teacher['id'];
    $_SESSION['teacher_name'] = $teacher['display_name'];
    return true;
}

function require_teacher(): void {
    if (empty($_SESSION['teacher_id'])) {
        redirect('/profesor/login.php');
    }
}

function teacher_logout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}
