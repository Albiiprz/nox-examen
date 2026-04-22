<?php
require __DIR__ . '/../inc/bootstrap.php';
require __DIR__ . '/../inc/layout.php';
require_teacher();

$teacherId = (int)$_SESSION['teacher_id'];
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $title = post('title');
    $house = post('house');
    $year = post('year');
    $types = $_POST['question_type'] ?? [];
    $prompts = $_POST['question_prompt'] ?? [];
    $optTexts = $_POST['option_text'] ?? [];
    $optCorrect = $_POST['option_correct'] ?? [];

    $questions = [];
    $testCount = 0;
    $textCount = 0;

    foreach ($prompts as $idx => $promptRaw) {
      $prompt = trim((string)$promptRaw);
      $type = $types[$idx] ?? 'single';
      if ($prompt === '') { continue; }
      if (!in_array($type, ['single','multiple','text'], true)) { continue; }

      if ($type === 'text') { $textCount++; }
      else { $testCount++; }

      $q = ['type'=>$type, 'prompt'=>$prompt, 'options'=>[]];

      if ($type !== 'text') {
        $texts = $optTexts[$idx] ?? [];
        $correctIndexes = array_map('intval', $optCorrect[$idx] ?? []);
        $position = 1;
        foreach ($texts as $oidx => $txtRaw) {
          $txt = trim((string)$txtRaw);
          if ($txt === '') { continue; }
          $q['options'][] = [
            'position_num' => $position++,
            'text_label' => $txt,
            'is_correct' => in_array((int)$oidx, $correctIndexes, true) ? 1 : 0,
          ];
        }

        $correctCount = 0;
        foreach ($q['options'] as $o) {
          if ($o['is_correct'] === 1) $correctCount++;
        }

        if (count($q['options']) < 2 || $correctCount < 1 || ($type === 'single' && $correctCount !== 1)) {
          $error = 'Revisa las opciones correctas de las preguntas tipo test.';
          break;
        }
      }

      $questions[] = $q;
    }

    if (!$error) {
      if ($title === '' || $house === '' || $year === '') $error = 'Completa título, casa y año.';
      elseif ($testCount < 1) $error = 'Necesitas al menos 1 pregunta tipo test.';
      elseif ($testCount > 10) $error = 'Máximo 10 preguntas tipo test.';
      elseif ($textCount > 1) $error = 'Máximo 1 pregunta de desarrollo.';
      elseif (empty($questions)) $error = 'Añade preguntas válidas.';
    }

    if (!$error) {
      $pdo->beginTransaction();
      $stmt = $pdo->prepare('INSERT INTO exams (teacher_id,title,house,year_label,status) VALUES (?,?,?,?,"draft")');
      $stmt->execute([$teacherId, $title, $house, $year]);
      $examId = (int)$pdo->lastInsertId();

      $qIns = $pdo->prepare('INSERT INTO questions (exam_id,position_num,type,prompt) VALUES (?,?,?,?)');
      $oIns = $pdo->prepare('INSERT INTO options (question_id,position_num,text_label,is_correct) VALUES (?,?,?,?)');

      $p = 1;
      foreach ($questions as $q) {
        $qIns->execute([$examId, $p++, $q['type'], $q['prompt']]);
        $questionId = (int)$pdo->lastInsertId();
        foreach ($q['options'] as $opt) {
          $oIns->execute([$questionId, $opt['position_num'], $opt['text_label'], $opt['is_correct']]);
        }
      }

      $pdo->commit();
      redirect('/profesor/exams.php');
    }
}

render_header('Nuevo examen', true);
?>
<section class="card">
  <h1>Crear examen</h1>
  <?php if ($error): ?><p class="error"><?= e($error) ?></p><?php endif; ?>
  <form method="post" id="exam-form">
    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
    <div class="grid cols-3">
      <div><label>Título</label><input name="title" required></div>
      <div><label>Casa</label><input name="house" required></div>
      <div><label>Año</label><input name="year" required></div>
    </div>

    <div id="questions"></div>

    <div class="row" style="margin-top:12px">
      <button type="button" class="secondary" onclick="addQuestion('single')">Añadir test única</button>
      <button type="button" class="secondary" onclick="addQuestion('multiple')">Añadir test múltiple</button>
      <button type="button" class="secondary" onclick="addQuestion('text')">Añadir desarrollo</button>
      <button type="submit" class="right">Guardar borrador</button>
    </div>
  </form>
</section>
<script>
let qIndex = 0;
function addQuestion(type) {
  const box = document.getElementById('questions');
  const idx = qIndex++;
  const wrap = document.createElement('div');
  wrap.className = 'q-block';
  let html = `<div class="row"><strong>Pregunta ${idx+1}</strong><button type="button" class="secondary" onclick="this.closest('.q-block').remove()">Eliminar</button></div>`;
  html += `<input type="hidden" name="question_type[${idx}]" value="${type}">`;
  html += `<label>Enunciado</label><textarea name="question_prompt[${idx}]" required></textarea>`;
  if (type !== 'text') {
    html += `<p class="muted">Marca correctas</p>`;
    for (let i=0;i<4;i++) {
      html += `<div class='row'><input style='width:auto' type='${type==='single'?'radio':'checkbox'}' name='option_correct[${idx}][]' value='${i}'><input name='option_text[${idx}][]' placeholder='Opción ${i+1}' required></div>`;
    }
  }
  wrap.innerHTML = html;
  box.appendChild(wrap);
}
addQuestion('single');
</script>
<?php render_footer();
