import { NextResponse } from "next/server";
import { getCurrentTeacher } from "@/lib/auth";
import { db } from "@/lib/db";

function escapeCsvValue(value: string | number) {
  const asString = String(value ?? "");
  if (asString.includes(",") || asString.includes("\n") || asString.includes('"')) {
    return `"${asString.replaceAll('"', '""')}"`;
  }
  return asString;
}

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
    select: { id: true, title: true },
  });

  if (!exam) {
    return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 });
  }

  const submissions = await db.submission.findMany({
    where: { examId: exam.id },
    orderBy: { submittedAt: "desc" },
    select: {
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

  const headers = [
    "Nombre",
    "Casa",
    "Año",
    "Nota Test",
    "Ajuste Desarrollo",
    "Nota Final",
    "Estado",
    "Fecha Envío",
  ];

  const rows = submissions.map((submission) => [
    submission.studentName,
    submission.studentHouse,
    submission.studentYear,
    submission.scoreTest,
    submission.scoreDevAdjustment,
    submission.scoreFinal,
    submission.status,
    submission.submittedAt.toISOString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((item) => escapeCsvValue(item)).join(","))
    .join("\n");

  const filename = `resultados-${exam.title.replaceAll(" ", "-").toLowerCase()}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
