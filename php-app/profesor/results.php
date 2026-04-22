<?php
require __DIR__ . '/../inc/bootstrap.php';
require __DIR__ . '/../inc/layout.php';
require_teacher();
$teacherId = (int)$_SESSION['teacher_id'];
$examId = (int)($_GET['exam_id'] ?? 0);
if ($examId < 1) { redirect('/profesor/exams.php'); }

$stmt = $pdo->prepare('SELECT * FROM exams WHERE id=? AND teacher_id=? LIMIT 1');
$stmt->execute([$examId, $teacherId]);
$exam = $stmt->fetch();
if (!$exam) { exit('Examen no encontrado'); }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    if (isset($_POST['export_csv'])) {
      $rows = $pdo->prepare('SELECT student_name,student_house,student_year,score_test,score_dev_adjust,score_final,status,submitted_at FROM submissions WHERE exam_id=? ORDER BY submitted_at DESC');
      $rows->execute([$examId]);
      header('Content-Type: text/csv; charset=utf-8');
      header('Content-Disposition: attachment; filename="resultados-'.$examId.'.csv"');
      $out = fopen('php://output', 'w');
      fputcsv($out, ['Nombre','Casa','Año','Nota test','Ajuste','Nota final','Estado','Fecha']);
      while ($r = $rows->fetch()) { fputcsv($out, $r); }
      fclose($out);
      exit;
    }

    $subId = (int)($_POST['submission_id'] ?? 0);
    $adjust = (float)($_POST['score_dev_adjust'] ?? 0);
    $adjust = max(-1.0, min(1.0, $adjust));
    $s = $pdo->prepare('SELECT score_test FROM submissions WHERE id=? AND exam_id=? LIMIT 1');
    $s->execute([$subId, $examId]);
    $sub = $s->fetch();
    if ($sub) {
      $final = max(0, min(10, round(((float)$sub['score_test']) + $adjust, 2)));
      $up = $pdo->prepare('UPDATE submissions SET score_dev_adjust=?, score_final=?, status="corrected" WHERE id=?');
      $up->execute([$adjust, $final, $subId]);
    }
    redirect('/profesor/results.php?exam_id=' . $examId);
}

$subs = $pdo->prepare('SELECT * FROM submissions WHERE exam_id=? ORDER BY submitted_at DESC');
$subs->execute([$examId]);
$subRows = $subs->fetchAll();

$ans = $pdo->prepare('SELECT a.*, q.prompt, q.type FROM answers a JOIN questions q ON q.id=a.question_id WHERE a.submission_id=? ORDER BY q.position_num');

render_header('Resultados', true);
?>
<section class="card">
  <div class="row">
    <h1>Resultados: <?= e($exam['title']) ?></h1>
    <form method="post" class="right"><input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><button class="secondary" name="export_csv" value="1">Descargar CSV</button></form>
  </div>

  <table class="table">
    <thead><tr><th>Nombre</th><th>Casa</th><th>Año</th><th>Nota final</th><th>Estado</th><th>Detalle</th></tr></thead>
    <tbody>
      <?php foreach ($subRows as $s): ?>
      <tr>
        <td><?= e($s['student_name']) ?></td>
        <td><?= e($s['student_house']) ?></td>
        <td><?= e($s['student_year']) ?></td>
        <td><?= e((string)$s['score_final']) ?></td>
        <td><?= e($s['status']) ?></td>
        <td>
          <details>
            <summary>Ver respuestas</summary>
            <?php $ans->execute([(int)$s['id']]); while ($a = $ans->fetch()): ?>
              <div class="details">
                <strong><?= e($a['prompt']) ?></strong>
                <?php if ($a['type'] === 'text'): ?>
                  <p><?= nl2br(e((string)$a['text_answer'])) ?></p>
                <?php else: ?>
                  <p>Marcadas: <?= e((string)$a['selected_option_ids']) ?></p>
                  <p>Puntuación: <?= e((string)$a['auto_score']) ?></p>
                <?php endif; ?>
              </div>
            <?php endwhile; ?>
            <form method="post" class="row">
              <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
              <input type="hidden" name="submission_id" value="<?= (int)$s['id'] ?>">
              <label>Ajuste desarrollo (-1 a +1)</label>
              <input type="number" name="score_dev_adjust" min="-1" max="1" step="0.1" value="<?= e((string)$s['score_dev_adjust']) ?>" style="max-width:140px">
              <button type="submit">Guardar ajuste</button>
            </form>
          </details>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</section>
<?php render_footer();
