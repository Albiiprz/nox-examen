"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  prompt: string;
  type: "TEST_UNICA" | "TEST_MULTIPLE" | "DESARROLLO";
  options: Option[];
};

const defaultOptions = (): Option[] => [
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

export function CreateExamForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [house, setHouse] = useState("");
  const [year, setYear] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { prompt: "", type: "TEST_UNICA", options: defaultOptions() },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateQuestion(index: number, patch: Partial<Question>) {
    setQuestions((current) =>
      current.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    );
  }

  function updateOption(
    questionIndex: number,
    optionIndex: number,
    patch: Partial<Option>,
  ) {
    setQuestions((current) =>
      current.map((q, i) => {
        if (i !== questionIndex) {
          return q;
        }

        const nextOptions = q.options.map((option, idx) =>
          idx === optionIndex ? { ...option, ...patch } : option,
        );

        return { ...q, options: nextOptions };
      }),
    );
  }

  function addTestQuestion() {
    const testCount = questions.filter((q) => q.type !== "DESARROLLO").length;
    if (testCount >= 10) {
      setError("Máximo 10 preguntas tipo test");
      return;
    }
    setQuestions((current) => [
      ...current,
      { prompt: "", type: "TEST_UNICA", options: defaultOptions() },
    ]);
  }

  function addDevelopmentQuestion() {
    const hasDev = questions.some((q) => q.type === "DESARROLLO");
    if (hasDev) {
      setError("Solo se permite una pregunta de desarrollo");
      return;
    }

    setQuestions((current) => [
      ...current,
      { prompt: "", type: "DESARROLLO", options: [] },
    ]);
  }

  function removeQuestion(index: number) {
    setQuestions((current) => current.filter((_, i) => i !== index));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title,
      house,
      year,
      questions,
    };

    const response = await fetch("/api/profesor/examenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "No se pudo crear el examen");
      setLoading(false);
      return;
    }

    router.push("/profesor/examenes");
    router.refresh();
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h1>Crear examen</h1>
      <p className="muted">Máximo 10 preguntas tipo test y 1 de desarrollo.</p>

      <label>Título</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label>Casa</label>
      <input value={house} onChange={(e) => setHouse(e.target.value)} required />

      <label>Año</label>
      <input value={year} onChange={(e) => setYear(e.target.value)} required />

      <div className="spaced">
        {questions.map((question, qIndex) => (
          <section key={qIndex} className="question-card">
            <div className="question-header">
              <strong>Pregunta {qIndex + 1}</strong>
              <button type="button" className="ghost" onClick={() => removeQuestion(qIndex)}>
                Eliminar
              </button>
            </div>

            <label>Tipo</label>
            <select
              value={question.type}
              onChange={(e) => {
                const nextType = e.target.value as Question["type"];
                if (nextType === "DESARROLLO") {
                  updateQuestion(qIndex, { type: nextType, options: [] });
                } else {
                  updateQuestion(qIndex, {
                    type: nextType,
                    options: question.options.length ? question.options : defaultOptions(),
                  });
                }
              }}
            >
              <option value="TEST_UNICA">Tipo test (respuesta única)</option>
              <option value="TEST_MULTIPLE">Tipo test (respuesta múltiple)</option>
              <option value="DESARROLLO">Desarrollo</option>
            </select>

            <label>Enunciado</label>
            <textarea
              value={question.prompt}
              onChange={(e) => updateQuestion(qIndex, { prompt: e.target.value })}
              required
            />

            {question.type !== "DESARROLLO" ? (
              <div className="spaced">
                <p className="muted">Opciones y respuesta(s) correcta(s)</p>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="option-row">
                    <input
                      type={question.type === "TEST_UNICA" ? "radio" : "checkbox"}
                      name={`correct-${qIndex}`}
                      checked={option.isCorrect}
                      onChange={(e) => {
                        if (question.type === "TEST_UNICA") {
                          const next = question.options.map((current, idx) => ({
                            ...current,
                            isCorrect: idx === oIndex ? e.target.checked : false,
                          }));
                          updateQuestion(qIndex, { options: next });
                        } else {
                          updateOption(qIndex, oIndex, { isCorrect: e.target.checked });
                        }
                      }}
                    />
                    <input
                      placeholder={`Opción ${oIndex + 1}`}
                      value={option.text}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, { text: e.target.value })
                      }
                      required
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">La pregunta de desarrollo se corrige manualmente.</p>
            )}
          </section>
        ))}
      </div>

      <div className="actions-row">
        <button type="button" className="secondary" onClick={addTestQuestion}>
          Añadir test
        </button>
        <button type="button" className="secondary" onClick={addDevelopmentQuestion}>
          Añadir desarrollo
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar borrador"}
      </button>
    </form>
  );
}
