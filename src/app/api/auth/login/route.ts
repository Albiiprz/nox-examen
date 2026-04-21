import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createTeacherSession } from "@/lib/auth";
import { normalizeSingleLine } from "@/lib/input";
import { enforceRateLimit, enforceSameOrigin } from "@/lib/security";

const LoginSchema = z.object({
  username: z.string().trim().min(3).max(60),
  password: z.string().min(6).max(128),
});

export async function POST(request: Request) {
  try {
    const originError = enforceSameOrigin(request);
    if (originError) {
      return originError;
    }

    const rateLimitError = enforceRateLimit(request, "auth-login", 8, 15 * 60 * 1000);
    if (rateLimitError) {
      return rateLimitError;
    }

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const username = normalizeSingleLine(parsed.data.username, 60);

    const teacher = await db.teacher.findUnique({
      where: { username },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Credenciales no válidas" }, { status: 401 });
    }

    const valid = await bcrypt.compare(parsed.data.password, teacher.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciales no válidas" }, { status: 401 });
    }

    await createTeacherSession(teacher.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
