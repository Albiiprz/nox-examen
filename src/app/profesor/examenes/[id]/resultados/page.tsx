import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { ResultsPanel } from "@/components/results-panel";

export default async function ExamResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const teacher = await requireTeacher();
  const { id } = await params;

  const exam = await db.exam.findFirst({
    where: { id, teacherId: teacher.id },
    select: {
      id: true,
      title: true,
      house: true,
      year: true,
      submissions: {
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          studentName: true,
          studentHouse: true,
          studentYear: true,
          scoreTest: true,
          scoreDevAdjustment: true,
          scoreFinal: true,
          status: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  return (
    <main className="container">
      <section className="panel spaced">
        <div className="row-between">
          <div>
            <h1>Resultados: {exam.title}</h1>
            <p className="muted">
              Casa: {exam.house} · Año: {exam.year}
            </p>
          </div>
          <div className="actions-row">
            <a
              className="button secondary"
              href={`/api/profesor/examenes/${exam.id}/export.csv`}
            >
              Descargar CSV
            </a>
            <a
              className="button secondary"
              href={`/api/profesor/examenes/${exam.id}/export.xlsx`}
            >
              Descargar Excel
            </a>
            <Link className="button" href="/profesor/examenes">
              Volver a exámenes
            </Link>
          </div>
        </div>

        <ResultsPanel
          examId={exam.id}
          submissions={exam.submissions.map((submission) => ({
            ...submission,
            submittedAt: submission.submittedAt.toISOString(),
          }))}
        />
      </section>
    </main>
  );
}
