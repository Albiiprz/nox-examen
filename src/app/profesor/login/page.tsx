import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/lib/auth";
import { TeacherLoginForm } from "@/components/teacher-login-form";

export default async function TeacherLoginPage() {
  const teacher = await getCurrentTeacher();
  if (teacher) {
    redirect("/profesor/dashboard");
  }

  return (
    <main className="container">
      <TeacherLoginForm />
    </main>
  );
}
