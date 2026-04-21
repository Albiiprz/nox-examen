"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TeacherLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "No se pudo iniciar sesión");
      setLoading(false);
      return;
    }

    router.push("/profesor/dashboard");
    router.refresh();
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h1>Acceso Profesor</h1>
      <p className="muted">Panel de gestión de exámenes NOX.</p>

      <label htmlFor="username">Usuario</label>
      <input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error ? <p className="error-text">{error}</p> : null}

      <button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
