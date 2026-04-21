import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <section className="panel centered">
        <h1>NOX Exámenes</h1>
        <p className="muted">
          Base MVP inicial lista. Usa el acceso de profesorado para crear y publicar
          exámenes, y comparte el enlace público con alumnado.
        </p>

        <div className="actions-row">
          <Link className="button" href="/profesor/login">
            Acceso profesor
          </Link>
        </div>
      </section>
    </main>
  );
}
