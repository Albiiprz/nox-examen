<?php
require __DIR__ . '/../inc/bootstrap.php';
verify_csrf();

$examId = (int)($_POST['exam_id'] ?? 0);
$studentName = post('student_name');
$studentHouse = post('student_house');
$studentYear = post('student_year');

if ($examId < 1 || $studentName === '' || $studentHouse === '' || $studentYear === '') {
    exit('Datos inválidos');
}

$stmt = $pdo->prepare('SELECT * FROM exams WHERE id=? AND status="published" LIMIT 1');
$stmt->execute([$examId]);
$exam = $stmt->fetch();
if (!$exam) { exit('Examen no disponible'); }

$studentKey = normalize_key($studentName, $studentHouse, $studentYear);
$dup = $pdo->prepare('SELECT id FROM submissions WHERE exam_id=? AND student_key=? LIMIT 1');
$dup->execute([$examId, $studentKey]);
if ($dup->fetch()) { exit('Este alumno ya envió el examen.'); }

$qStmt = $pdo->prepare('SELECT * FROM questions WHERE exam_id=? ORDER BY position_num');
$qStmt->execute([$examId]);
$questions = $qStmt->fetchAll();

$optStmt = $pdo->prepare('SELECT * FROM options WHERE question_id=? ORDER BY position_num');
$testQuestions = [];
foreach ($questions as &$q) {
  if ($q['type'] === 'text') { $q['options'] = []; continue; }
  $optStmt->execute([(int)$q['id']]);
  $q['options'] = $optStmt->fetchAll();
  $testQuestions[] = $q;
}
unset($q);

$answersOpt = $_POST['answer_opt'] ?? [];
$answersText = $_POST['answer_text'] ?? [];

$total = 0.0;
$details = [];
foreach ($questions as $q) {
  $qid = (int)$q['id'];
  if ($q['type'] === 'text') {
    $details[] = ['question_id'=>$qid,'selected'=>null,'text'=>trim((string)($answersText[$qid] ?? '')),'score'=>null];
    continue;
  }
  $selected = array_map('intval', $answersOpt[$qid] ?? []);
  $score = score_question($q, $selected);
  $total += $score;
  $details[] = ['question_id'=>$qid,'selected'=>$selected,'text'=>null,'score'=>$score];
}

$testCount = count($testQuestions);
$scoreTest = $testCount > 0 ? round(($total / $testCount) * 10, 2) : 0.0;

$pdo->beginTransaction();
$sub = $pdo->prepare('INSERT INTO submissions (exam_id,student_name,student_house,student_year,student_key,score_test,score_final,status) VALUES (?,?,?,?,?,?,?,"sent")');
$sub->execute([$examId,$studentName,$studentHouse,$studentYear,$studentKey,$scoreTest,$scoreTest]);
$submissionId = (int)$pdo->lastInsertId();

$ans = $pdo->prepare('INSERT INTO answers (submission_id,question_id,selected_option_ids,text_answer,auto_score) VALUES (?,?,?,?,?)');
foreach ($details as $d) {
  $ans->execute([
    $submissionId,
    $d['question_id'],
    $d['selected'] !== null ? json_encode($d['selected']) : null,
    $d['text'],
    $d['score'],
  ]);
}
$pdo->commit();

echo 'Examen enviado correctamente. Puedes cerrar esta página.';
