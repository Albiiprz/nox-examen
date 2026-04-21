import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
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

  const rows = submissions.map((submission) => ({
    Nombre: submission.studentName,
    Casa: submission.studentHouse,
    Año: submission.studentYear,
    "Nota Test": submission.scoreTest,
    "Ajuste Desarrollo": submission.scoreDevAdjustment,
    "Nota Final": submission.scoreFinal,
    Estado: submission.status,
    "Fecha Envío": submission.submittedAt.toISOString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
  const bytes = new Uint8Array(buffer);
  const filename = `resultados-${exam.title.replaceAll(" ", "-").toLowerCase()}.xlsx`;

  return new NextResponse(bytes, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
