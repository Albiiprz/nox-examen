import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentTeacher } from "@/lib/auth";
import { EXAM_STATUS } from "@/lib/constants";
import { enforceRateLimit, enforceSameOrigin } from "@/lib/security";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const originError = enforceSameOrigin(request);
  if (originError) {
    return originError;
  }

  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rateLimitError = enforceRateLimit(request, "teacher-publish-exam", 60, 10 * 60 * 1000);
  if (rateLimitError) {
    return rateLimitError;
  }

  const { id } = await context.params;
  const exam = await db.exam.findFirst({ where: { id, teacherId: teacher.id } });
  if (!exam) {
    return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 });
  }

  if (exam.status === EXAM_STATUS.CERRADO) {
    return NextResponse.json({ error: "No se puede publicar un examen cerrado" }, { status: 400 });
  }

  const publicToken = exam.publicToken ?? randomBytes(24).toString("hex");

  await db.exam.update({
    where: { id: exam.id },
    data: {
      status: EXAM_STATUS.PUBLICADO,
      publicToken,
      publishedAt: exam.publishedAt ?? new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    publicUrl: `/e/${publicToken}`,
  });
}
