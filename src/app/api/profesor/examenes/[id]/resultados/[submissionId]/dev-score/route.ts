import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { SUBMISSION_STATUS } from "@/lib/constants";
import { clampScore, round2 } from "@/lib/score";
import { enforceRateLimit, enforceSameOrigin } from "@/lib/security";

const BodySchema = z.object({
  scoreDevAdjustment: z.number().min(-1).max(1),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; submissionId: string }> },
) {
  const originError = enforceSameOrigin(request);
  if (originError) {
    return originError;
  }

  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rateLimitError = enforceRateLimit(request, "teacher-dev-score", 120, 10 * 60 * 1000);
  if (rateLimitError) {
    return rateLimitError;
  }

  const body = await request.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ajuste inválido" }, { status: 400 });
  }

  const { id, submissionId } = await context.params;
  const exam = await db.exam.findFirst({
    where: { id, teacherId: teacher.id },
    select: { id: true },
  });

  if (!exam) {
    return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 });
  }

  const submission = await db.submission.findFirst({
    where: { id: submissionId, examId: exam.id },
    select: { id: true, scoreTest: true },
  });

  if (!submission) {
    return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
  }

  const nextFinal = clampScore(
    round2(submission.scoreTest + parsed.data.scoreDevAdjustment),
    0,
    10,
  );

  const updated = await db.submission.update({
    where: { id: submission.id },
    data: {
      scoreDevAdjustment: parsed.data.scoreDevAdjustment,
      scoreFinal: nextFinal,
      status: SUBMISSION_STATUS.CORREGIDO,
    },
    select: {
      id: true,
      scoreTest: true,
      scoreDevAdjustment: true,
      scoreFinal: true,
      status: true,
    },
  });

  return NextResponse.json({ submission: updated });
}
