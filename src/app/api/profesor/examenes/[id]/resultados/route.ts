import { NextResponse } from "next/server";
import { getCurrentTeacher } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const exam = await db.exam.findFirst({
    where: { id, teacherId: teacher.id },
    select: { id: true, title: true, house: true, year: true },
  });

  if (!exam) {
    return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 });
  }

  const submissions = await db.submission.findMany({
    where: { examId: exam.id },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      studentName: true,
      studentHouse: true,
      studentYear: true,
      scoreTest: true,
      scoreDevAdjustment: true,
      scoreFinal: true,
      status: true,
      submittedAt: true,
    },
  });

  return NextResponse.json({ exam, submissions });
}
