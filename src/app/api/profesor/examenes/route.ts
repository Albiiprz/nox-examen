import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentTeacher } from "@/lib/auth";
import { QUESTION_TYPE } from "@/lib/constants";
import { normalizeMultiline, normalizeSingleLine } from "@/lib/input";
import { enforceRateLimit, enforceSameOrigin } from "@/lib/security";

const OptionSchema = z.object({
  text: z.string().trim().min(1).max(180),
  isCorrect: z.boolean(),
});

const QuestionSchema = z.object({
  prompt: z.string().trim().min(1).max(500),
  type: z.enum([
    QUESTION_TYPE.TEST_UNICA,
    QUESTION_TYPE.TEST_MULTIPLE,
    QUESTION_TYPE.DESARROLLO,
  ]),
  options: z.array(OptionSchema).max(6).optional().default([]),
});

const CreateExamSchema = z.object({
  title: z.string().trim().min(1).max(120),
  house: z.string().trim().min(1).max(40),
  year: z.string().trim().min(1).max(20),
  questions: z.array(QuestionSchema).min(1).max(11),
});

export async function GET() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const exams = await db.exam.findMany({
    where: { teacherId: teacher.id },
    include: { _count: { select: { submissions: true, questions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ exams });
}

export async function POST(request: Request) {
  const originError = enforceSameOrigin(request);
  if (originError) {
    return originError;
  }

  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rateLimitError = enforceRateLimit(request, "teacher-create-exam", 30, 10 * 60 * 1000);
  if (rateLimitError) {
    return rateLimitError;
  }

  const body = await request.json();
  const parsed = CreateExamSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const testQuestions = parsed.data.questions.filter(
    (q) => q.type === QUESTION_TYPE.TEST_UNICA || q.type === QUESTION_TYPE.TEST_MULTIPLE,
  );
  const devQuestions = parsed.data.questions.filter((q) => q.type === QUESTION_TYPE.DESARROLLO);

  if (testQuestions.length > 10) {
    return NextResponse.json({ error: "Máximo 10 preguntas tipo test" }, { status: 400 });
  }

  if (devQuestions.length > 1) {
    return NextResponse.json({ error: "Máximo 1 pregunta de desarrollo" }, { status: 400 });
  }

  for (const q of testQuestions) {
    if ((q.options?.length ?? 0) < 2) {
      return NextResponse.json({ error: "Cada pregunta test necesita al menos 2 opciones" }, { status: 400 });
    }

    const correctCount = q.options.filter((o) => o.isCorrect).length;
    if (correctCount === 0) {
      return NextResponse.json({ error: "Cada pregunta test necesita al menos una opción correcta" }, { status: 400 });
    }

    if (q.type === QUESTION_TYPE.TEST_UNICA && correctCount !== 1) {
      return NextResponse.json({ error: "Las preguntas de respuesta única deben tener solo una correcta" }, { status: 400 });
    }
  }

  const exam = await db.exam.create({
    data: {
      teacherId: teacher.id,
      title: normalizeSingleLine(parsed.data.title, 120),
      house: normalizeSingleLine(parsed.data.house, 40),
      year: normalizeSingleLine(parsed.data.year, 20),
      questions: {
        create: parsed.data.questions.map((q, index) => ({
          prompt: normalizeMultiline(q.prompt, 500),
          type: q.type,
          position: index + 1,
          options:
            q.type === QUESTION_TYPE.DESARROLLO
              ? undefined
              : {
                  create: (q.options ?? []).map((option, optionIndex) => ({
                    text: normalizeSingleLine(option.text, 180),
                    isCorrect: option.isCorrect,
                    position: optionIndex + 1,
                  })),
                },
        })),
      },
    },
  });

  return NextResponse.json({ examId: exam.id }, { status: 201 });
}
