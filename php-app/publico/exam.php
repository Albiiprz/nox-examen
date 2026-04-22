<?php
require __DIR__ . '/../inc/bootstrap.php';
require __DIR__ . '/../inc/layout.php';
$token = trim((string)($_GET['token'] ?? ''));
if ($token === '') { http_response_code(404); exit('Examen no encontrado'); }

$stmt = $pdo->prepare('SELECT * FROM exams WHERE public_token=? AND status="published" LIMIT 1');
$stmt->execute([$token]);
$exam = $stmt->fetch();
if (!$exam) { http_response_code(404); exit('Examen no disponible'); }

$qStmt = $pdo->prepare('SELECT * FROM questions WHERE exam_id=? ORDER BY position_num');
$qStmt->execute([(int)$exam['id']]);
$questions = $qStmt->fetchAll();

$optStmt = $pdo->prepare('SELECT * FROM options WHERE question_id=? ORDER BY position_num');
foreach ($questions as &$q) {
  if ($q['type'] === 'text') { $q['options'] = []; continue; }
  $optStmt->execute([(int)$q['id']]);
  $q['options'] = $optStmt->fetchAll();
}
unset($q);

render_header($exam['title']);
?>
<section class="parchment">
  <h1><?= e($exam['title']) ?></h1>
  <p>Casa objetivo: <strong><?= e($exam['house']) ?></strong> · Año: <strong><?= e($exam['year_label']) ?></strong></p>

  <form method="post" action="/publico/submit.php">
    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
    <input type="hidden" name="exam_id" value="<?= (int)$exam['id'] ?>">

    <div class="grid cols-3">
      <div><label>Nombre y apellidos</label><input name="student_name" required></div>
      <div><label>Casa</label><input name="student_house" required></div>
      <div><label>Año</label><input name="student_year" required></div>
    </div>

    <?php foreach ($questions as $i => $q): ?>
      <article class="details">
        <h3><?= ($i+1) ?>. <?= e($q['prompt']) ?></h3>
        <?php if ($q['type'] === 'text'): ?>
          <textarea name="answer_text[<?= (int)$q['id'] ?>]" placeholder="Respuesta de desarrollo"></textarea>
        <?php else: ?>
          <?php foreach ($q['options'] as $o): ?>
            <label class="row">
              <input style="width:auto" type="<?= $q['type']==='single'?'radio':'checkbox' ?>" name="answer_opt[<?= (int)$q['id'] ?>][]" value="<?= (int)$o['id'] ?>">
              <span><?= e($o['text_label']) ?></span>
            </label>
          <?php endforeach; ?>
        <?php endif; ?>
      </article>
    <?php endforeach; ?>

    <button type="submit">Enviar examen</button>
  </form>
</section>
<?php render_footer();
