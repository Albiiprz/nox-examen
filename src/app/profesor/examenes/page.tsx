import Link from "next/link";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { PublishButton } from "./publish-button";

export default async function ExamsPage() {
  const teacher = await requireTeacher();

  const exams = await db.exam.findMany({
    where: { teacherId: teacher.id },
    include: { _count: { select: { submissions: true, questions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container">
      <section className="panel">
        <div className="row-between">
          <h1>Exámenes</h1>
          <Link className="button" href="/profesor/examenes/nuevo">
            Nuevo examen
          </Link>
        </div>

        <table className="results-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Estado</th>
              <th>Preguntas</th>
              <th>Envíos</th>
              <th>Link</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan={6}>Todavía no hay exámenes creados.</td>
              </tr>
            ) : null}
            {exams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.title}</td>
                <td>{exam.status}</td>
                <td>{exam._count.questions}</td>
                <td>{exam._count.submissions}</td>
                <td>
                  {exam.publicToken ? (
                    <code>/e/{exam.publicToken}</code>
                  ) : (
                    <span className="muted">Sin publicar</span>
                  )}
                </td>
                <td>
                  <div className="actions-row">
                    <PublishButton examId={exam.id} isPublished={exam.status === "PUBLICADO"} />
                    <Link className="button secondary" href={`/profesor/examenes/${exam.id}/resultados`}>
                      Resultados
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
