<?php
require __DIR__ . '/../inc/bootstrap.php';
require __DIR__ . '/../inc/layout.php';
require_teacher();
$teacherId = (int)$_SESSION['teacher_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $examId = (int)($_POST['exam_id'] ?? 0);
    $action = post('action');
    $stmt = $pdo->prepare('SELECT id, public_token FROM exams WHERE id=? AND teacher_id=? LIMIT 1');
    $stmt->execute([$examId, $teacherId]);
    $exam = $stmt->fetch();
    if ($exam) {
        if ($action === 'publish') {
            $token = $exam['public_token'] ?: bin2hex(random_bytes(16));
            $up = $pdo->prepare('UPDATE exams SET status="published", public_token=? WHERE id=?');
            $up->execute([$token, $examId]);
        }
        if ($action === 'close') {
            $up = $pdo->prepare('UPDATE exams SET status="closed" WHERE id=?');
            $up->execute([$examId]);
        }
    }
    redirect('/profesor/exams.php');
}

$stmt = $pdo->prepare('SELECT e.*, (SELECT COUNT(*) FROM questions q WHERE q.exam_id=e.id) as q_count, (SELECT COUNT(*) FROM submissions s WHERE s.exam_id=e.id) as s_count FROM exams e WHERE teacher_id=? ORDER BY created_at DESC');
$stmt->execute([$teacherId]);
$rows = $stmt->fetchAll();

render_header('Exámenes', true);
?>
<section class="card">
  <div class="row"><h1>Exámenes</h1><a class="btn right" href="/profesor/exam_new.php">Nuevo examen</a></div>
  <table class="table">
    <thead><tr><th>Título</th><th>Estado</th><th>Preguntas</th><th>Envíos</th><th>Enlace</th><th>Acciones</th></tr></thead>
    <tbody>
      <?php foreach ($rows as $r): ?>
      <tr>
        <td><?= e($r['title']) ?></td>
        <td><span class="pill"><?= e($r['status']) ?></span></td>
        <td><?= (int)$r['q_count'] ?></td>
        <td><?= (int)$r['s_count'] ?></td>
        <td><?php if ($r['public_token']): ?><a href="/publico/exam.php?token=<?= e($r['public_token']) ?>" target="_blank">Abrir</a><?php else: ?>-<?php endif; ?></td>
        <td>
          <div class="row">
            <?php if ($r['status'] !== 'published'): ?>
            <form method="post"><input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><input type="hidden" name="exam_id" value="<?= (int)$r['id'] ?>"><input type="hidden" name="action" value="publish"><button type="submit" class="secondary">Publicar</button></form>
            <?php endif; ?>
            <a class="btn secondary" href="/profesor/results.php?exam_id=<?= (int)$r['id'] ?>">Resultados</a>
          </div>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</section>
<?php render_footer();
