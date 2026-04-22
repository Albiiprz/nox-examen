<?php
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/layout.php';
render_header('Inicio');
?>
<section class="card">
  <h1>NOX Exámenes (PHP)</h1>
  <p class="muted">Versión compatible con hosting PHP + MySQL.</p>
  <div class="row">
    <a class="btn" href="/profesor/login.php">Acceso profesor</a>
  </div>
</section>
<?php render_footer();
