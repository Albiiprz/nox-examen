import { NextResponse } from "next/server";
import { getCurrentTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseSelectedOptionIds } from "@/lib/result-utils";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; submissionId: string }> },
) {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
    include: {
      answers: {
        include: {
          question: {
            include: { options: { orderBy: { position: "asc" } } },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
  }

  const normalizedAnswers = submission.answers.map((answer) => {
    const selectedOptionIds = parseSelectedOptionIds(answer.selectedOptionIds);
    const selectedOptions = answer.question.options
      .filter((option) => selectedOptionIds.includes(option.id))
      .map((option) => option.text);

    const correctOptions = answer.question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.text);

    return {
      questionId: answer.question.id,
      prompt: answer.question.prompt,
      type: answer.question.type,
      selectedOptions,
      correctOptions,
      textAnswer: answer.textAnswer,
      autoScore: answer.autoScore,
    };
  });

  return NextResponse.json({
    submission: {
      id: submission.id,
      studentName: submission.studentName,
      studentHouse: submission.studentHouse,
      studentYear: submission.studentYear,
      scoreTest: submission.scoreTest,
      scoreDevAdjustment: submission.scoreDevAdjustment,
      scoreFinal: submission.scoreFinal,
      status: submission.status,
      submittedAt: submission.submittedAt,
      answers: normalizedAnswers,
    },
  });
}
