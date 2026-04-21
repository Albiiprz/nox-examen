"use client";

import { useState } from "react";

type ExamQuestion = {
  id: string;
  prompt: string;
  type: string;
  options: Array<{ id: string; text: string }>;
};

type ExamPayload = {
  token: string;
  title: string;
  house: string;
  year: string;
  questions: ExamQuestion[];
};

export function StudentExamForm({ exam }: { exam: ExamPayload }) {
  const [studentName, setStudentName] = useState("");
  const [studentHouse, setStudentHouse] = useState("");
  const [studentYear, setStudentYear] = useState("");
  const [selectedMap, setSelectedMap] = useState<Record<string, string[]>>({});
  const [textMap, setTextMap] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleOption(question: ExamQuestion, optionId: string) {
    setSelectedMap((current) => {
      const existing = current[question.id] ?? [];
      if (question.type === "TEST_UNICA") {
        return { ...current, [question.id]: [optionId] };
      }

      const exists = existing.includes(optionId);
      return {
        ...current,
        [question.id]: exists
          ? existing.filter((id) => id !== optionId)
          : [...existing, optionId],
      };
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const answers = exam.questions.map((question) => ({
      questionId: question.id,
      selectedOptionIds: selectedMap[question.id] ?? [],
      textAnswer: textMap[question.id] ?? "",
    }));

    const response = await fetch(`/api/public/examen/${exam.token}/submission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName,
        studentHouse,
        studentYear,
        answers,
      }),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(data.error ?? "No se pudo enviar el examen");
      setLoading(false);
      return;
    }

    setStatus("Examen enviado correctamente. Gracias.");
    setLoading(false);
  }

  return (
    <form className="parchment-sheet" onSubmit={onSubmit}>
      <header className="exam-header">
        <h1>{exam.title}</h1>
        <p>
          Casa objetivo: <strong>{exam.house}</strong> · Año: <strong>{exam.year}</strong>
        </p>
      </header>

      <section className="identity-grid">
        <label>
          Nombre y apellidos
          <input value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
        </label>
        <label>
          Casa
          <input value={studentHouse} onChange={(e) => setStudentHouse(e.target.value)} required />
        </label>
        <label>
          Año
          <input value={studentYear} onChange={(e) => setStudentYear(e.target.value)} required />
        </label>
      </section>

      <div className="spaced">
        {exam.questions.map((question, index) => (
          <article key={question.id} className="question-card parchment-card">
            <h3>
              {index + 1}. {question.prompt}
            </h3>

            {question.type === "DESARROLLO" ? (
              <textarea
                placeholder="Escribe tu respuesta"
                value={textMap[question.id] ?? ""}
                onChange={(e) =>
                  setTextMap((current) => ({ ...current, [question.id]: e.target.value }))
                }
                rows={4}
              />
            ) : (
              <div className="spaced-sm">
                {question.options.map((option) => {
                  const checked = (selectedMap[question.id] ?? []).includes(option.id);
                  return (
                    <label key={option.id} className="option-row">
                      <input
                        type={question.type === "TEST_UNICA" ? "radio" : "checkbox"}
                        checked={checked}
                        onChange={() => toggleOption(question, option.id)}
                      />
                      <span>{option.text}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </div>

      {status ? <p className={status.includes("correctamente") ? "ok-text" : "error-text"}>{status}</p> : null}

      <button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar examen"}
      </button>
    </form>
  );
}
