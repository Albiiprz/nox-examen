"use client";

import { useState } from "react";

type SubmissionRow = {
  id: string;
  studentName: string;
  studentHouse: string;
  studentYear: string;
  scoreTest: number;
  scoreDevAdjustment: number;
  scoreFinal: number;
  status: string;
  submittedAt: string;
};

type AnswerDetail = {
  questionId: string;
  prompt: string;
  type: string;
  selectedOptions: string[];
  correctOptions: string[];
  textAnswer: string | null;
  autoScore: number | null;
};

type SubmissionDetail = {
  id: string;
  studentName: string;
  studentHouse: string;
  studentYear: string;
  scoreTest: number;
  scoreDevAdjustment: number;
  scoreFinal: number;
  status: string;
  submittedAt: string;
  answers: AnswerDetail[];
};

function formatScore(value: number) {
  return value.toFixed(2);
}

export function ResultsPanel({
  examId,
  submissions,
}: {
  examId: string;
  submissions: SubmissionRow[];
}) {
  const [openSubmissionId, setOpenSubmissionId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [adjustment, setAdjustment] = useState<string>("0");
  const [savingAdjustment, setSavingAdjustment] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [rows, setRows] = useState(submissions);

  async function toggleRow(submissionId: string) {
    if (openSubmissionId === submissionId) {
      setOpenSubmissionId(null);
      setDetail(null);
      setInlineError(null);
      return;
    }

    setLoadingDetail(true);
    setInlineError(null);

    const response = await fetch(`/api/profesor/examenes/${examId}/resultados/${submissionId}`);
    const data = (await response.json()) as {
      error?: string;
      submission?: SubmissionDetail;
    };

    if (!response.ok || !data.submission) {
      setInlineError(data.error ?? "No se pudieron cargar las respuestas");
      setLoadingDetail(false);
      return;
    }

    setOpenSubmissionId(submissionId);
    setDetail(data.submission);
    setAdjustment(String(data.submission.scoreDevAdjustment));
    setLoadingDetail(false);
  }

  async function saveAdjustment() {
    if (!detail) {
      return;
    }

    const numeric = Number(adjustment);
    if (Number.isNaN(numeric) || numeric < -1 || numeric > 1) {
      setInlineError("El ajuste debe estar entre -1.0 y 1.0");
      return;
    }

    setSavingAdjustment(true);
    setInlineError(null);

    const response = await fetch(
      `/api/profesor/examenes/${examId}/resultados/${detail.id}/dev-score`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoreDevAdjustment: numeric }),
      },
    );

    const data = (await response.json()) as {
      error?: string;
      submission?: {
        scoreDevAdjustment: number;
        scoreFinal: number;
        status: string;
      };
    };

    if (!response.ok || !data.submission) {
      setInlineError(data.error ?? "No se pudo guardar el ajuste");
      setSavingAdjustment(false);
      return;
    }

    setDetail((current) =>
      current
        ? {
            ...current,
            scoreDevAdjustment: data.submission!.scoreDevAdjustment,
            scoreFinal: data.submission!.scoreFinal,
            status: data.submission!.status,
          }
        : current,
    );

    setRows((current) =>
      current.map((row) =>
        row.id === detail.id
          ? {
              ...row,
              scoreDevAdjustment: data.submission!.scoreDevAdjustment,
              scoreFinal: data.submission!.scoreFinal,
              status: data.submission!.status,
            }
          : row,
      ),
    );

    setSavingAdjustment(false);
  }

  return (
    <div className="spaced">
      <table className="results-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Casa</th>
            <th>Año</th>
            <th>Nota final</th>
            <th>Fecha envío</th>
            <th>Estado</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7}>Aún no hay respuestas enviadas para este examen.</td>
            </tr>
          ) : null}

          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.studentName}</td>
              <td>{row.studentHouse}</td>
              <td>{row.studentYear}</td>
              <td>{formatScore(row.scoreFinal)}</td>
              <td>{new Date(row.submittedAt).toLocaleString()}</td>
              <td>{row.status}</td>
              <td>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => toggleRow(row.id)}
                >
                  {openSubmissionId === row.id ? "Ocultar" : "Ver respuestas"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loadingDetail ? <p className="muted">Cargando detalle...</p> : null}
      {inlineError ? <p className="error-text">{inlineError}</p> : null}

      {detail ? (
        <section className="panel detail-panel">
          <div className="row-between">
            <h2>Detalle de {detail.studentName}</h2>
            <span className="badge">Nota final: {formatScore(detail.scoreFinal)}</span>
          </div>

          <p className="muted">
            Nota test: {formatScore(detail.scoreTest)} · Ajuste desarrollo: {formatScore(detail.scoreDevAdjustment)}
          </p>

          <div className="adjust-grid">
            <label>
              Ajuste desarrollo (-1 a +1)
              <input
                type="number"
                min={-1}
                max={1}
                step={0.1}
                value={adjustment}
                onChange={(event) => setAdjustment(event.target.value)}
              />
            </label>
            <button type="button" onClick={saveAdjustment} disabled={savingAdjustment}>
              {savingAdjustment ? "Guardando..." : "Guardar ajuste"}
            </button>
          </div>

          <div className="spaced">
            {detail.answers.map((answer, index) => (
              <article key={answer.questionId} className="question-card">
                <h3>
                  {index + 1}. {answer.prompt}
                </h3>

                {answer.type === "DESARROLLO" ? (
                  <p>{answer.textAnswer?.trim() || "Sin respuesta"}</p>
                ) : (
                  <>
                    <p>
                      <strong>Marcadas:</strong>{" "}
                      {answer.selectedOptions.length > 0
                        ? answer.selectedOptions.join(" | ")
                        : "Sin respuesta"}
                    </p>
                    <p>
                      <strong>Correctas:</strong> {answer.correctOptions.join(" | ")}
                    </p>
                    <p>
                      <strong>Puntuación:</strong> {formatScore(answer.autoScore ?? 0)}
                    </p>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
