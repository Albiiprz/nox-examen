"use client";

import { useState } from "react";

export function PublishButton({
  examId,
  isPublished,
}: {
  examId: string;
  isPublished: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function publish() {
    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/profesor/examenes/${examId}/publicar`, {
      method: "POST",
    });
    const data = (await response.json()) as { publicUrl?: string; error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "No se pudo publicar");
      setLoading(false);
      return;
    }

    setMessage(`Publicado: ${data.publicUrl}`);
    setLoading(false);
  }

  return (
    <div>
      <button
        type="button"
        className="secondary"
        disabled={loading || isPublished}
        onClick={publish}
      >
        {isPublished ? "Publicado" : loading ? "Publicando..." : "Publicar"}
      </button>
      {message ? <p className="tiny-text">{message}</p> : null}
    </div>
  );
}
