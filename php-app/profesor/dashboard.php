<?php
require __DIR__ . '/../inc/bootstrap.php';
require __DIR__ . '/../inc/layout.php';
require_teacher();

$teacherId = (int)$_SESSION['teacher_id'];
$exams = (int)$pdo->query("SELECT COUNT(*) FROM exams WHERE teacher_id = {$teacherId}")->fetchColumn();
$subs = (int)$pdo->query("SELECT COUNT(*) FROM submissions s JOIN exams e ON e.id=s.exam_id WHERE e.teacher_id = {$teacherId}")->fetchColumn();

render_header('Dashboard', true);
?>
<section class="card">
  <h1>Dashboard</h1>
  <div class="grid cols-3">
    <div class="card"><h3>Exámenes</h3><strong><?= $exams ?></strong></div>
    <div class="card"><h3>Envíos</h3><strong><?= $subs ?></strong></div>
  </div>
  <div class="row">
    <a class="btn" href="/profesor/exam_new.php">Crear examen</a>
    <a class="btn secondary" href="/profesor/exams.php">Ver exámenes</a>
  </div>
</section>
<?php render_footer();
