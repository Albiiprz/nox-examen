import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { gradeSubmission } from "@/lib/grade";
import { EXAM_STATUS } from "@/lib/constants";
import { normalizeMultiline, normalizeSingleLine } from "@/lib/input";
import { enforceRateLimit } from "@/lib/security";

const AnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionIds: z.array(z.string().min(1)).max(6).optional(),
  textAnswer: z.string().max(4000).optional(),
});

const SubmissionSchema = z.object({
  studentName: z.string().trim().min(2).max(120),
  studentHouse: z.string().trim().min(1).max(40),
  studentYear: z.string().trim().min(1).max(20),
  answers: z.array(AnswerSchema).max(12),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const rateLimitError = enforceRateLimit(
    request,
    `public-submit-${token}`,
    40,
    10 * 60 * 1000,
  );
  if (rateLimitError) {
    return rateLimitError;
  }

  const exam = await db.exam.findFirst({
    where: { publicToken: token, status: EXAM_STATUS.PUBLICADO },
    include: {
      questions: {
        orderBy: { position: "asc" },
        include: { options: true },
      },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: "Examen no disponible" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = SubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de envío inválidos" }, { status: 400 });
  }

  const studentName = normalizeSingleLine(parsed.data.studentName, 120);
  const studentHouse = normalizeSingleLine(parsed.data.studentHouse, 40);
  const studentYear = normalizeSingleLine(parsed.data.studentYear, 20);

  const normalizedIdentity = `${studentName.toLowerCase()}|${studentHouse.toLowerCase()}|${studentYear.toLowerCase()}`;

  const existingSubmissions = await db.submission.findMany({
    where: { examId: exam.id },
    select: {
      id: true,
      studentName: true,
      studentHouse: true,
      studentYear: true,
    },
  });

  const duplicate = existingSubmissions.find((submission) => {
    const existingIdentity = `${submission.studentName.toLowerCase()}|${submission.studentHouse.toLowerCase()}|${submission.studentYear.toLowerCase()}`;
    return existingIdentity === normalizedIdentity;
  });

  if (duplicate) {
    return NextResponse.json({ error: "Este alumno ya ha enviado el examen" }, { status: 409 });
  }

  const grading = gradeSubmission(
    exam.questions,
    parsed.data.answers.map((answer) => ({
      questionId: answer.questionId,
      selectedOptionIds: answer.selectedOptionIds ?? [],
      textAnswer: answer.textAnswer ? normalizeMultiline(answer.textAnswer, 4000) : "",
    })),
  );

  const submission = await db.submission.create({
    data: {
      examId: exam.id,
      studentName,
      studentHouse,
      studentYear,
      scoreTest: grading.scoreTest,
      scoreFinal: grading.scoreFinal,
      submittedAt: new Date(),
      answers: {
        create: grading.detail.map((answer) => ({
          question: { connect: { id: answer.questionId } },
          selectedOptionIds: answer.selectedOptionIds
            ? JSON.stringify(answer.selectedOptionIds)
            : null,
          textAnswer: answer.textAnswer,
          autoScore: answer.autoScore,
        })),
      },
    },
  });

  return NextResponse.json({ ok: true, submissionId: submission.id });
}
