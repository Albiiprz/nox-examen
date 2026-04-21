import Link from "next/link";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const teacher = await requireTeacher();

  const [examCount, submissionCount, recentExams] = await Promise.all([
    db.exam.count({ where: { teacherId: teacher.id } }),
    db.submission.count({ where: { exam: { teacherId: teacher.id } } }),
    db.exam.findMany({
      where: { teacherId: teacher.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <main className="container">
      <section className="panel">
        <h1>Dashboard Profesor</h1>
        <p className="muted">Bienvenido, {teacher.displayName}.</p>

        <div className="stats-grid">
          <article className="stat-card">
            <span>Exámenes</span>
            <strong>{examCount}</strong>
          </article>
          <article className="stat-card">
            <span>Envíos</span>
            <strong>{submissionCount}</strong>
          </article>
        </div>

        <div className="actions-row">
          <Link className="button" href="/profesor/examenes/nuevo">
            Crear examen
          </Link>
          <Link className="button secondary" href="/profesor/examenes">
            Ver exámenes
          </Link>
        </div>

        <h2>Últimos exámenes</h2>
        <ul className="list">
          {recentExams.length === 0 ? <li>No hay exámenes todavía.</li> : null}
          {recentExams.map((exam) => (
            <li key={exam.id}>
              <span>{exam.title}</span>
              <span className="badge">{exam.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
