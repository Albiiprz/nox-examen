<?php
function e(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function redirect(string $url): void {
    header('Location: ' . $url);
    exit;
}

function post(string $key, string $default = ''): string {
    return isset($_POST[$key]) ? trim((string)$_POST[$key]) : $default;
}

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
    }
    return $_SESSION['csrf'];
}

function verify_csrf(): void {
    $incoming = $_POST['csrf'] ?? '';
    $current = $_SESSION['csrf'] ?? '';
    if (!$incoming || !$current || !hash_equals($current, $incoming)) {
        http_response_code(400);
        echo 'CSRF inválido';
        exit;
    }
}

function normalize_key(string $name, string $house, string $year): string {
    return mb_strtolower(trim($name) . '|' . trim($house) . '|' . trim($year), 'UTF-8');
}

function score_question(array $question, array $selectedOptionIds): float {
    $correctIds = [];
    foreach ($question['options'] as $option) {
        if ((int)$option['is_correct'] === 1) {
            $correctIds[] = (int)$option['id'];
        }
    }

    $selected = array_values(array_unique(array_map('intval', $selectedOptionIds)));

    if ($question['type'] === 'single') {
        if (count($selected) !== 1 || count($correctIds) !== 1) {
            return 0.0;
        }
        return $selected[0] === $correctIds[0] ? 1.0 : 0.0;
    }

    if (count($selected) === 0) {
        return 0.0;
    }

    $hasIncorrect = false;
    foreach ($selected as $sid) {
        if (!in_array($sid, $correctIds, true)) {
            $hasIncorrect = true;
            break;
        }
    }

    if ($hasIncorrect) {
        return 0.0;
    }

    sort($selected);
    $correctSorted = $correctIds;
    sort($correctSorted);

    if ($selected === $correctSorted) {
        return 1.0;
    }

    return 0.5;
}
