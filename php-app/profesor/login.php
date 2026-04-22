<?php
require __DIR__ . '/../inc/bootstrap.php';
require __DIR__ . '/../inc/layout.php';

if (!empty($_SESSION['teacher_id'])) {
    redirect('/profesor/dashboard.php');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $username = post('username');
    $password = post('password');
    if (teacher_login($pdo, $username, $password)) {
        redirect('/profesor/dashboard.php');
    }
    $error = 'Credenciales inválidas';
}

render_header('Login profesor');
?>
<section class="card" style="max-width:520px">
  <h1>Acceso profesor</h1>
  <?php if ($error): ?><p class="error"><?= e($error) ?></p><?php endif; ?>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
    <label>Usuario</label>
    <input name="username" required>
    <label>Contraseña</label>
    <input type="password" name="password" required>
    <div class="row" style="margin-top:12px"><button type="submit">Entrar</button></div>
  </form>
</section>
<?php render_footer();
