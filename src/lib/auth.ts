import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const SESSION_COOKIE = "nox_teacher_session";
const SESSION_DURATION_DAYS = 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createTeacherSession(teacherId: string) {
  await db.teacherSession.deleteMany({
    where: {
      OR: [{ teacherId }, { expiresAt: { lt: new Date() } }],
    },
  });

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await db.teacherSession.create({
    data: {
      teacherId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearTeacherSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await db.teacherSession.deleteMany({ where: { tokenHash } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentTeacher() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);
  const session = await db.teacherSession.findUnique({
    where: { tokenHash },
    include: { teacher: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.teacherSession.deleteMany({ where: { tokenHash } });
    }
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  return session.teacher;
}

export async function requireTeacher() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/profesor/login");
  }
  return teacher;
}
