<?php
function render_header(string $title, bool $teacherArea = false): void {
    $teacherName = $_SESSION['teacher_name'] ?? '';
    echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . e($title) . '</title>';
    echo '<link rel="stylesheet" href="/assets/style.css">';
    echo '</head><body>';
    echo '<header class="topbar"><div class="wrap">';
    echo '<a href="/index.php" class="brand">NOX Exámenes</a>';
    if ($teacherArea && $teacherName) {
        echo '<nav><a href="/profesor/dashboard.php">Dashboard</a><a href="/profesor/exams.php">Exámenes</a><a href="/profesor/logout.php">Salir</a></nav>';
        echo '<span class="who">' . e($teacherName) . '</span>';
    }
    echo '</div></header><main class="wrap">';
}

function render_footer(): void {
    echo '</main></body></html>';
}
