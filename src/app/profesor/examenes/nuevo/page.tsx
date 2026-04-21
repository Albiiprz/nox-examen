import { requireTeacher } from "@/lib/auth";
import { CreateExamForm } from "@/components/create-exam-form";

export default async function NewExamPage() {
  await requireTeacher();

  return (
    <main className="container">
      <CreateExamForm />
    </main>
  );
}
