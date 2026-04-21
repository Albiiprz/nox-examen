import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { StudentExamForm } from "@/components/student-exam-form";
import { EXAM_STATUS } from "@/lib/constants";

export default async function PublicExamPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const exam = await db.exam.findFirst({
    where: { publicToken: token, status: EXAM_STATUS.PUBLICADO },
    include: {
      questions: {
        orderBy: { position: "asc" },
        include: { options: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  return (
    <main className="parchment-bg">
      <StudentExamForm
        exam={{
          token,
          title: exam.title,
          house: exam.house,
          year: exam.year,
          questions: exam.questions.map((question) => ({
            id: question.id,
            prompt: question.prompt,
            type: question.type,
            options: question.options.map((option) => ({
              id: option.id,
              text: option.text,
            })),
          })),
        }}
      />
    </main>
  );
}
